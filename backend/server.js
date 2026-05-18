require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const rateLimit = require('express-rate-limit');
const Fuse = require('fuse.js');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initializeRadioComm } = require('./radioComm');

const app  = express();
// ✅ FIX: Must use process.env.PORT for Render — bind to 0.0.0.0
const PORT = process.env.PORT || 3001;
const server = createServer(app);

// ✅ FIX: Socket.io CORS — allow all Vercel URLs + localhost
const io = new Server(server, {
  // FIX: Allow all origins for Socket.io (WebRTC signaling only — no sensitive data)
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  // FIX: Render requires these settings to keep WebSocket alive
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
});

initializeRadioComm(io);

// ── Standard Aviation Phrases for Auto-Correction ────────────
const STANDARD_PHRASES = [
  'requesting clearance','request IFR clearance','ready to copy',
  'ready to copy clearance','squawk','altitude','flight level','climb',
  'descend','maintain','turn left','turn right','heading','vector',
  'inbound','final approach','report','position report','level off',
  'reaching altitude','mayday','pan pan','declaring emergency','go around',
  'abort','standby','copy','roger','wilco','affirmative','negative',
  'say again','say altitude','confirm','runway','taxiway','holding point',
  'cross runway','pushback','startup','engines running',
];

const fuse = new Fuse(STANDARD_PHRASES, { threshold: 0.4, distance: 100 });

function autoCorrectText(pilotText) {
  const words = pilotText.toLowerCase().split(/\s+/);
  return words.map(word => {
    if (word.length < 3 || /^\d+$/.test(word)) return word;
    const matches = fuse.search(word);
    if (matches.length > 0 && matches[0].score < 0.5) return matches[0].item;
    return word;
  }).join(' ');
}

// ── Validate required env vars ────────────────────────────────
['GEMINI_API_KEY', 'ELEVENLABS_API_KEY'].forEach(v => {
  if (!process.env[v]) {
    console.error(`❌  Missing env var: ${v}`);
    process.exit(1);
  }
});

const GEMINI_KEY   = process.env.GEMINI_API_KEY;
const EL_KEY       = process.env.ELEVENLABS_API_KEY;
const EL_VOICE     = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

// FIX: Open CORS for production — backend is public API with rate limiting
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.options('*', cors());

app.use(express.json({ limit: '64kb' }));

app.use('/api', rateLimit({
  windowMs: 60_000, max: 40,
  message: { error: 'Rate limit reached. Wait a moment.' }
}));

// ── Health + Keep-Alive ───────────────────────────────────────
app.get('/', (_req, res) => res.json({
  status: 'ok', service: 'RTR Trainer API v2.0',
  endpoints: ['/api/atc', '/api/voices'],
}));

// FIX: Render free tier spins down — this endpoint lets frontend ping every 14min
app.get('/ping', (_req, res) => res.json({ pong: true, t: Date.now() }));

// ── Scenario system prompts ───────────────────────────────────
const SCENARIO_PROMPTS = {
  clearance_delivery: `You are Delhi Clearance Delivery ATC. The aircraft is IndiGo 6E-101, an Airbus A320, 
departing from Delhi (VIDP) to Mumbai (VABB). ATIS information ALPHA is current. 
Runway in use: 28. SID: KANKI3A. Squawk: 4521. Expect FL350. Initial climb: 5000ft. 
Departure frequency after airborne: 124.650.

Your role: Issue full IFR clearance, correct any readback errors, handle re-requests. 
Use AUTHENTIC Indian ATC accent style with full ICAO phraseology. 
Clearance format: Cleared to [dest] via [SID], squawk [code], expect FL[xxx], 
initial climb [alt]ft, departure frequency [freq].
Always correct incomplete readbacks. Maintain realistic ATC communication.
After your ATC response, add on a NEW LINE: [SCORE] X/10 | [one line of feedback on pilot phraseology]`,

  pushback_startup: `You are Delhi Ground ATC. IndiGo 6E-101 (A320) is at stand B7, Delhi (VIDP).
Pilot needs startup approval and pushback clearance. ATIS ALPHA received.
Issue: startup approved, pushback direction (tail east), report ready to taxi.
Handle realistic dialogue: if pilot forgets stand number or ATIS — ask for it.
Use full ICAO phraseology. Be realistic — include pauses for engine start, pushback confirmation.
Sequence: startup → pushback → engines running → ready to taxi call.
[SCORE] X/10 | [feedback] on new line after each response.`,

  taxi: `You are Delhi Ground ATC. IndiGo 6E-101 (A320) has completed startup at stand B7.
Issue complex taxi instructions to runway 28: via Alpha, cross runway 10/28 at November, 
then Bravo to holding point runway 28. QNH 1013.
Be strict on readbacks — pilot MUST read back all taxiway names AND hold-short point.
If pilot misses any part of taxi clearance, say "Negative, readback incorrect" and re-issue.
Simulate realistic ground traffic delays if needed.
[SCORE] X/10 | [feedback] on new line.`,

  takeoff: `You are Delhi Tower ATC. IndiGo 6E-101 (A320) is at holding point runway 28.
Handle: holding point report → line up and wait → traffic on final → takeoff clearance.
Wind: 280/12kt. Issue clearance with wind. After rotation, instruct contact Departure 124.650.
If pilot rolls without clearance or misreads runway — issue go-around.
[SCORE] X/10 | [feedback] on new line.`,

  climb_departure: `You are Delhi Departure Control. IndiGo 6E-101 (A320) just departed runway 28, 
climbing through 2000ft to 5000ft. Radar identify → climb FL100 → turn right heading 090 → 
eventually hand off to Delhi Control 127.850. 
Simulate realistic climb sequence with possible speed restrictions, traffic conflicts.
[SCORE] X/10 | [feedback] on new line.`,

  cruise: `You are Mumbai Control (en-route). IndiGo 6E-101 (A320) is at FL350, 
cruising Delhi to Mumbai, estimate MUMBA at 1045Z.
Handle: position reports, level change requests (FL370 or FL390 for fuel), 
possible weather deviation (CB cells 30NM right of track), frequency changes.
Make it dynamic — create realistic enroute events.
[SCORE] X/10 | [feedback] on new line.`,

  descent: `You are Mumbai Approach Control. IndiGo 6E-101 (A320) is inbound to Mumbai (VABB), 
currently FL250, ATIS BRAVO received. Expect ILS RWY 27.
Issue: descent clearance, STAR (IGABA1A), speed restrictions, radar vectors.
Be progressive — descend to FL100, then 5000ft, then vectors to final.
[SCORE] X/10 | [feedback] on new line.`,

  approach: `You are Mumbai Approach Control. IndiGo 6E-101 (A320) is being vectored for ILS RWY 27 Mumbai.
Issue: turn to intercept heading 240, descend 2500ft, cleared ILS approach RWY 27, 
report outer marker. Handle: ILS established call, outer marker, contact Tower 118.100.
[SCORE] X/10 | [feedback] on new line.`,

  landing: `You are Mumbai Tower ATC. IndiGo 6E-101 (A320) is on final ILS RWY 27, 4 miles out.
Handle: landing clearance (wind 270/10kt), landing, vacate instruction (expedite via November), 
contact Ground 121.700. 
If go-around needed: issue missed approach clearance, climb 3000ft, left turn heading 240.
[SCORE] X/10 | [feedback] on new line.`,

  after_landing: `You are Mumbai Ground ATC. IndiGo 6E-101 (A320) has just vacated runway 27 via November.
Handle: welcome to Mumbai, taxi to stand F4 via November, Foxtrot, cross runway 14/32, 
then Echo to stand F4. QNH 1012. Parking frequency Apron 121.900.
Be strict on readbacks especially the runway crossing.
[SCORE] X/10 | [feedback] on new line.`,

  emergency_engine: `You are Delhi Departure Control. IndiGo 6E-101 (A320) just departed RWY 28, 
climbing through 3000ft — ENGINE FAILURE on left engine (CFM56). Pilot declares MAYDAY.
Handle: acknowledge MAYDAY, clear all traffic, give return heading, vectors for ILS RWY 28, 
alert emergency services, ask souls on board and fuel. 
Check pilot uses correct MAYDAY format: MAYDAY×3, callsign, nature, souls, fuel, position, intentions.
[SCORE] X/10 | [feedback] on emergency phraseology.`,

  emergency_goaround: `You are Mumbai Approach. IndiGo 6E-101 (A320) is on ILS RWY 27.
Trigger: at 500ft, runway not clear — aircraft on runway. Issue go-around immediately.
Then re-sequence: hold at IGABA (right turns, inbound 270, EFC 1215Z), then second approach.
[SCORE] X/10 | [feedback] on new line.`,

  emergency_diversion: `You are Mumbai Approach. IndiGo 6E-101 (A320) declares PAN PAN — passenger medical.
Handle: acknowledge PAN PAN, priority handling, expedite to runway 27, 
alert medical services, ambulance on standby. 
Check: PAN PAN×3 format, nature of emergency, souls on board stated correctly.
[SCORE] X/10 | [feedback] on new line.`,

  holding: `You are Mumbai Approach Control. IndiGo 6E-101 (A320) inbound to Mumbai.
Due to runway inspection, issue holding clearance: hold at IGABA VOR, 
inbound track 270, right turns, 1 minute legs, altitude 5000ft, EFC 1230Z.
After 2 holds (simulate ~8 minutes), issue approach clearance.
[SCORE] X/10 | [feedback] on holding phraseology.`,
};

// ── POST /api/atc ─────────────────────────────────────────────
app.post('/api/atc', async (req, res) => {
  const { pilotText, scenarioId, history = [] } = req.body;

  if (!pilotText || typeof pilotText !== 'string' || pilotText.trim().length < 2)
    return res.status(400).json({ error: 'pilotText is required.' });

  const correctedPilotText = autoCorrectText(pilotText.trim());
  const sysPrompt = SCENARIO_PROMPTS[scenarioId] || SCENARIO_PROMPTS.clearance_delivery;

  const messages = [
    ...history.slice(-12).map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    })),
    { role: 'user', content: correctedPilotText },
  ];

  // ── 1. Gemini AI ──────────────────────────────────────────
  let fullText = '';
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [{
          role: 'user',
          parts: [{
            text: `${sysPrompt}\n\n${messages.map(m => `${m.role === 'user' ? 'Pilot' : 'ATC'}: ${m.content}`).join('\n')}\n\nPilot: ${pilotText}`
          }]
        }],
        generationConfig: { maxOutputTokens: 700, temperature: 0.7 }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 28000 }
    );
    fullText = data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    return res.status(502).json({ error: 'AI service unavailable. Try again.' });
  }

  const scoreIdx = fullText.indexOf('[SCORE]');
  const atcText  = (scoreIdx > -1 ? fullText.slice(0, scoreIdx) : fullText).trim();
  const feedback = scoreIdx > -1 ? fullText.slice(scoreIdx).trim() : null;

  // ── 2. ElevenLabs TTS ─────────────────────────────────────
  let audioBase64 = null;
  let audioMime   = 'audio/mpeg';

  try {
    const elRes = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}`,
      {
        text: atcText,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.52, similarity_boost: 0.82, style: 0.10, use_speaker_boost: true },
      },
      {
        headers: { 'Content-Type': 'application/json', 'xi-api-key': EL_KEY, Accept: 'audio/mpeg' },
        responseType: 'arraybuffer',
        timeout: 22000,
      }
    );
    audioBase64 = Buffer.from(elRes.data).toString('base64');
    audioMime   = elRes.headers['content-type'] || 'audio/mpeg';
  } catch (err) {
    console.warn('ElevenLabs TTS failed (browser TTS fallback):', err.response?.status, err.message);
  }

  return res.json({
    atcText, feedback, audioBase64, audioMime,
    updatedHistory: [...messages, { role: 'assistant', content: atcText }],
  });
});

// ── GET /api/voices ───────────────────────────────────────────
app.get('/api/voices', async (_req, res) => {
  try {
    const { data } = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': EL_KEY },
      timeout: 10000,
    });
    res.json({ voices: data.voices.map(v => ({ id: v.voice_id, name: v.name })) });
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch voices.' });
  }
});

// ✅ FIX: Bind to 0.0.0.0 so Render can route traffic to the container
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅  RTR Trainer API running on port ${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/`);
  console.log(`    ATC endpoint: POST http://localhost:${PORT}/api/atc`);
  console.log(`    WebSocket: ws://localhost:${PORT}\n`);
});
