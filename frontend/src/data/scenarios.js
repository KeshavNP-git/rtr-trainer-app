// ──────────────────────────────────────────────────────────────
//  All scenarios use IndiGo 6E-101 (A320) — one airline, one
//  callsign throughout. Phases follow real A320 ops flow.
// ──────────────────────────────────────────────────────────────

export const SCENARIOS = [
  // ── TASK 1 ──────────────────────────────────────────────────
  {
    id: 'clearance_delivery',
    task: 'Task 1',
    title: 'IFR Clearance Delivery',
    subtitle: 'VIDP Delhi → VABB Mumbai',
    phase: 'PRE-DEPARTURE',
    freq: '118.100',
    station: 'DELHI DELIVERY',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '28',
    squawk: '4521',
    atis: { wind: '28010KT', vis: '9999', temp: '28/18', qnh: '1013', info: 'ALPHA', cloud: 'FEW040' },
    description:
      'Contact Clearance Delivery before engine start. Request full IFR route clearance to Mumbai. '
      + 'Receive SID, squawk code, initial altitude, departure frequency. Read back EVERYTHING.',
    expectedFlow: [
      'Call delivery with aircraft type, stand, destination, ATIS',
      'Receive full IFR clearance — write it down',
      'Read back: destination, SID, squawk, levels, departure freq',
      'Get "readback correct" before proceeding',
    ],
    phases: ['Initial Contact', 'Receive Clearance', 'Full Readback', 'Correction (if needed)', 'Readback Confirmed'],
    expectedCalls: [
      'Delhi Delivery, IndiGo 101, Airbus A320, stand Bravo 7, request IFR clearance to Mumbai, information Alpha.',
      'Cleared to Mumbai via KANKI3A departure, squawk 4521, expect FL350, initial climb 5000 feet, departure frequency 124.650, IndiGo 101.',
      'Wilco, IndiGo 101.',
    ],
  },

  // ── TASK 2 ──────────────────────────────────────────────────
  {
    id: 'pushback_startup',
    task: 'Task 2',
    title: 'Pushback & Engine Start',
    subtitle: 'Stand B7 — Delhi Apron',
    phase: 'PRE-DEPARTURE',
    freq: '121.700',
    station: 'DELHI GROUND',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '28',
    squawk: '4521',
    atis: { wind: '28010KT', vis: '9999', temp: '28/18', qnh: '1013', info: 'ALPHA', cloud: 'FEW040' },
    description:
      'Contact Ground for pushback and startup approval. Confirm pushback direction. '
      + 'Report engines running and ready to taxi. Handle realistic dialogue.',
    expectedFlow: [
      'Request startup and pushback from stand B7',
      'Acknowledge pushback direction',
      'Confirm engines running after pushback',
      'Request taxi clearance',
    ],
    phases: ['Request Startup', 'Pushback Approval', 'Engines Running', 'Ready to Taxi'],
    expectedCalls: [
      'Delhi Ground, IndiGo 101, stand Bravo 7, request startup and pushback, information Alpha.',
      'Startup approved, push and start, face east, wilco, IndiGo 101.',
      'Delhi Ground, IndiGo 101, ready to taxi, runway 28.',
    ],
  },

  // ── TASK 3 ──────────────────────────────────────────────────
  {
    id: 'taxi',
    task: 'Task 3',
    title: 'Taxi to Runway 28',
    subtitle: 'Complex taxi — multiple crossings',
    phase: 'PRE-DEPARTURE',
    freq: '121.700',
    station: 'DELHI GROUND',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '28',
    squawk: '4521',
    atis: { wind: '28010KT', vis: '9999', temp: '28/18', qnh: '1013', info: 'ALPHA', cloud: 'FEW040' },
    description:
      'Receive taxi instructions through multiple taxiways with a runway crossing. '
      + 'Read back EVERY taxiway name and hold-short instruction. ATC will challenge incorrect readbacks.',
    expectedFlow: [
      'Report ready to taxi with runway',
      'Receive taxi route (Alpha → cross RWY 10/28 → Bravo → hold short RWY 28)',
      'Read back full route AND hold-short point',
      'Report "Holding point runway 28" when reached',
    ],
    phases: ['Taxi Request', 'Receive Route', 'Full Route Readback', 'Runway Crossing', 'Holding Point Report'],
    expectedCalls: [
      'Delhi Ground, IndiGo 101, ready to taxi, runway 28.',
      'Taxi via Alpha, hold short runway 10/28, crossing approved, then Bravo to holding point runway 28, QNH 1013, IndiGo 101.',
      'IndiGo 101, holding point runway 28.',
    ],
  },

  // ── TASK 4 ──────────────────────────────────────────────────
  {
    id: 'takeoff',
    task: 'Task 4',
    title: 'Lineup & Takeoff',
    subtitle: 'Runway 28 — Delhi Tower',
    phase: 'DEPARTURE',
    freq: '118.100',
    station: 'DELHI TOWER',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '28',
    squawk: '4521',
    atis: { wind: '28012KT', vis: '9999', temp: '28/18', qnh: '1013', info: 'ALPHA', cloud: 'FEW040' },
    description:
      'Report at holding point to Tower. Receive line-up and wait, then takeoff clearance. '
      + 'After rotation, contact Departure on 124.650.',
    expectedFlow: [
      'Report holding point and ready',
      'Receive "line up and wait" — do not take off yet',
      'Receive takeoff clearance with wind',
      'Read back runway and "cleared for takeoff"',
      'After airborne, contact Departure',
    ],
    phases: ['Holding Point Report', 'Line Up & Wait', 'Takeoff Clearance', 'Readback', 'Contact Departure'],
    expectedCalls: [
      'Delhi Tower, IndiGo 101, holding point runway 28, ready for departure.',
      'Runway 28, lining up and waiting, IndiGo 101.',
      'Wind 280/12, runway 28, cleared for takeoff, IndiGo 101.',
      '124.650, good day, IndiGo 101.',
    ],
  },

  // ── TASK 5 ──────────────────────────────────────────────────
  {
    id: 'climb_departure',
    task: 'Task 5',
    title: 'Climb & Departure',
    subtitle: 'Departing Delhi — Radar Contact',
    phase: 'DEPARTURE',
    freq: '124.650',
    station: 'DELHI DEPARTURE',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '28',
    squawk: '4521',
    atis: { wind: 'N/A', vis: 'N/A', temp: 'N/A', qnh: 'N/A', info: 'N/A', cloud: 'N/A' },
    description:
      'Airborne from Runway 28. Contact Departure, get radar identified, receive climb and heading instructions. '
      + 'Handle possible traffic conflict and speed restriction.',
    expectedFlow: [
      'Initial contact with passing altitude and cleared level',
      'Get radar contact + climb to FL100',
      'Heading instructions for SID',
      'Level reports when reaching',
      'Hand-off to Control',
    ],
    phases: ['Airborne Contact', 'Radar Identified', 'Climb FL100', 'Heading Assignment', 'Hand-off'],
    expectedCalls: [
      'Delhi Departure, IndiGo 101, airborne runway 28, passing 2000 feet, climbing 5000 feet.',
      'Climb flight level 100, turn right heading 090, IndiGo 101.',
      'Flight level 100, IndiGo 101.',
      '127.850, good day, IndiGo 101.',
    ],
  },

  // ── TASK 6 ──────────────────────────────────────────────────
  {
    id: 'cruise',
    task: 'Task 6',
    title: 'Cruise & Enroute',
    subtitle: 'FL350 — Delhi to Mumbai Control',
    phase: 'CRUISE',
    freq: '127.850',
    station: 'MUMBAI CONTROL',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: 'N/A',
    squawk: '4521',
    atis: { wind: 'N/A', vis: 'N/A', temp: 'N/A', qnh: 'N/A', info: 'N/A', cloud: 'N/A' },
    description:
      'Cruising at FL350 Delhi to Mumbai. Check-in with enroute control. Request level change for fuel. '
      + 'Handle dynamic events: weather deviation for CB cells, ATC speed restriction, holding due traffic.',
    expectedFlow: [
      'Enroute check-in with level and estimate',
      'Request FL370 step climb',
      'Report level reaching',
      'CB weather — request 30NM left deviation',
      'Resume track after weather',
    ],
    phases: ['Enroute Contact', 'Level Change Request', 'Weather Deviation', 'Resume Track', 'Descent Clearance'],
    expectedCalls: [
      'Mumbai Control, IndiGo 101, flight level 350, estimating MUMBA at 1045.',
      'Mumbai Control, IndiGo 101, request climb flight level 370 for fuel.',
      'Mumbai Control, IndiGo 101, significant CB on track, request deviation left 30 nautical miles.',
      'Mumbai Control, IndiGo 101, clear of weather, requesting resume direct track.',
    ],
  },

  // ── TASK 7 ──────────────────────────────────────────────────
  {
    id: 'descent',
    task: 'Task 7',
    title: 'Descent & STAR',
    subtitle: 'Inbound Mumbai — Approach Control',
    phase: 'DESCENT',
    freq: '119.100',
    station: 'MUMBAI APPROACH',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '27',
    squawk: '4521',
    atis: { wind: '27010KT', vis: '8000', temp: '30/22', qnh: '1008', info: 'BRAVO', cloud: 'FEW025' },
    description:
      'Inbound to Mumbai with ATIS BRAVO. Contact Approach, receive STAR (IGABA1A), speed restrictions, '
      + 'step descents. Handle radar vectors to intercept final.',
    expectedFlow: [
      'Approach check-in with level and ATIS',
      'Receive descent and STAR',
      'Step descents: FL100 → 5000ft',
      'Speed restrictions: 250kt below FL100',
      'Vectors to ILS final',
    ],
    phases: ['Approach Contact', 'Descend FL100', 'STAR IGABA1A', 'Speed Restriction', 'ILS Vectors'],
    expectedCalls: [
      'Mumbai Approach, IndiGo 101, flight level 250 descending, information Bravo.',
      'Descend flight level 100, IGABA1A arrival, expect ILS runway 27, IndiGo 101.',
      'Descend 5000 feet, speed 250 knots, IndiGo 101.',
    ],
  },

  // ── TASK 8 ──────────────────────────────────────────────────
  {
    id: 'approach',
    task: 'Task 8',
    title: 'ILS Approach RWY 27',
    subtitle: 'Vectoring to Final — Mumbai',
    phase: 'APPROACH',
    freq: '119.100',
    station: 'MUMBAI APPROACH',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '27',
    squawk: '4521',
    atis: { wind: '27010KT', vis: '8000', temp: '30/22', qnh: '1008', info: 'BRAVO', cloud: 'FEW025' },
    description:
      'Being vectored to intercept ILS RWY 27 Mumbai. Receive final heading, cleared ILS. '
      + 'Report outer marker. Contact Tower.',
    expectedFlow: [
      'Receive final vector and altitude',
      'Cleared ILS approach runway 27',
      'Report established on localizer',
      'Report outer marker',
      'Contact Tower 118.100',
    ],
    phases: ['Final Vector', 'ILS Clearance', 'Localizer Established', 'Outer Marker', 'Contact Tower'],
    expectedCalls: [
      'Left heading 240, descend 2500 feet, IndiGo 101.',
      'Cleared ILS approach runway 27, report outer marker, IndiGo 101.',
      'Mumbai Approach, IndiGo 101, ILS established runway 27.',
      'IndiGo 101, outer marker.',
      '118.100, good day, IndiGo 101.',
    ],
  },

  // ── TASK 9 ──────────────────────────────────────────────────
  {
    id: 'landing',
    task: 'Task 9',
    title: 'Landing — Mumbai Tower',
    subtitle: 'Short Final RWY 27',
    phase: 'LANDING',
    freq: '118.100',
    station: 'MUMBAI TOWER',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '27',
    squawk: '4521',
    atis: { wind: '27010KT', vis: '8000', temp: '30/22', qnh: '1008', info: 'BRAVO', cloud: 'FEW025' },
    description:
      'On ILS final RWY 27 Mumbai. Contact Tower, receive landing clearance. '
      + 'After touchdown, vacate via November, contact Ground.',
    expectedFlow: [
      'Contact Tower on final',
      'Receive landing clearance with wind',
      'After landing — vacate via November',
      'Contact Ground 121.700',
    ],
    phases: ['Contact Tower', 'Landing Clearance', 'Touchdown', 'Vacate Report', 'Contact Ground'],
    expectedCalls: [
      'Mumbai Tower, IndiGo 101, ILS final runway 27.',
      'Wind 270/10, runway 27, cleared to land, IndiGo 101.',
      'Mumbai Tower, IndiGo 101, vacating runway 27 via November.',
      '121.700, good day, IndiGo 101.',
    ],
  },

  // ── TASK 10 ─────────────────────────────────────────────────
  {
    id: 'after_landing',
    task: 'Task 10',
    title: 'After Landing — Taxi to Stand',
    subtitle: 'Mumbai Ground — Stand F4',
    phase: 'ARRIVAL',
    freq: '121.700',
    station: 'MUMBAI GROUND',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '27',
    squawk: '4521',
    atis: { wind: '27010KT', vis: '8000', temp: '30/22', qnh: '1008', info: 'BRAVO', cloud: 'FEW025' },
    description:
      'Vacated runway. Taxi to stand F4 via November, Foxtrot, cross runway 14/32, then Echo. '
      + 'Read back full route and runway crossing. Flight complete at stand.',
    expectedFlow: [
      'Vacated report and request taxi',
      'Receive taxi route (N → F → cross RWY 14/32 → E → Stand F4)',
      'Full readback of route and crossing',
      'Report stand reached — engines off',
    ],
    phases: ['Vacated Report', 'Receive Taxi', 'Route Readback', 'Stand Reached'],
    expectedCalls: [
      'Mumbai Ground, IndiGo 101, vacated runway 27 via November, request taxi to stand.',
      'Taxi via November, Foxtrot, cross runway 14/32, Echo to stand Foxtrot 4, QNH 1008, IndiGo 101.',
      'IndiGo 101, stand Foxtrot 4, engines shutdown.',
    ],
  },

  // ── TASK 11 — EMERGENCY ──────────────────────────────────────
  {
    id: 'emergency_engine',
    task: 'Task 11',
    title: 'MAYDAY — Engine Failure',
    subtitle: 'EMERGENCY: Left engine failure after takeoff',
    phase: 'EMERGENCY',
    freq: '124.650',
    station: 'DELHI DEPARTURE',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '28',
    squawk: '7700',
    atis: { wind: '28012KT', vis: '9999', temp: '29/18', qnh: '1013', info: 'ECHO', cloud: 'FEW040' },
    description:
      'LEFT ENGINE FAILURE after departure from RWY 28. You must declare MAYDAY correctly. '
      + 'ATC will guide you for emergency return. Format: MAYDAY×3, callsign, nature, souls, fuel, position, intentions.',
    expectedFlow: [
      'Declare MAYDAY (×3 format)',
      'State nature: engine failure, souls on board, fuel',
      'State position and intentions: return to Delhi RWY 28',
      'Receive emergency vectors and ILS clearance',
      'Emergency landing',
    ],
    phases: ['MAYDAY Declaration', 'Acknowledge + Vectors', 'Emergency Descent', 'ILS RWY 28', 'Emergency Landing'],
    expectedCalls: [
      'MAYDAY MAYDAY MAYDAY, Delhi Departure, IndiGo 101, engine failure left engine, 186 souls on board, 4 hours fuel, 10 miles north Delhi, 4000 feet, request immediate return runway 28.',
      'IndiGo 101, Roger MAYDAY, turn left heading 180, descend 3000 feet, vectoring ILS runway 28.',
    ],
  },

  // ── TASK 12 — GO-AROUND ──────────────────────────────────────
  {
    id: 'emergency_goaround',
    task: 'Task 12',
    title: 'Go-Around & Hold',
    subtitle: 'Runway not clear — missed approach',
    phase: 'EMERGENCY',
    freq: '119.100',
    station: 'MUMBAI APPROACH',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '27',
    squawk: '4521',
    atis: { wind: '27008KT', vis: '6000', temp: '28/21', qnh: '1009', info: 'CHARLIE', cloud: 'FEW020' },
    description:
      'On ILS final RWY 27 — ATC issues go-around (runway not clear). '
      + 'Execute missed approach, enter holding at IGABA, then second approach.',
    expectedFlow: [
      'Receive go-around instruction',
      'Climb to 3000ft, left turn heading 240',
      'Acknowledge and execute go-around',
      'Enter hold at IGABA: right turns, inbound 270, 1-min legs',
      'After 2 holds, receive second approach clearance',
    ],
    phases: ['Go-Around Issued', 'Missed Approach', 'Hold at IGABA', 'Hold Entry', '2nd Approach'],
    expectedCalls: [
      'Going around, IndiGo 101.',
      'Mumbai Approach, IndiGo 101, missed approach, climbing 3000 feet.',
      'IndiGo 101, holding at IGABA, inbound 270, right turns, wilco.',
      'IndiGo 101, ready for second approach.',
    ],
  },

  // ── TASK 13 — DIVERSION ──────────────────────────────────────
  {
    id: 'emergency_diversion',
    task: 'Task 13',
    title: 'PAN PAN — Medical Diversion',
    subtitle: 'Passenger cardiac — divert to Pune',
    phase: 'EMERGENCY',
    freq: '127.850',
    station: 'MUMBAI CONTROL',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: 'N/A',
    squawk: '7700',
    atis: { wind: 'N/A', vis: 'N/A', temp: 'N/A', qnh: 'N/A', info: 'N/A', cloud: 'N/A' },
    description:
      'Passenger cardiac arrest en-route. Declare PAN PAN correctly. '
      + 'Request diversion to Pune (VAPN). Medical services alerted.',
    expectedFlow: [
      'Declare PAN PAN (×3 format)',
      'State nature: medical, souls on board',
      'Request diversion to Pune',
      'Receive diversion clearance and descent',
      'Contact Pune Approach',
    ],
    phases: ['PAN PAN Declaration', 'Diversion Request', 'Clearance', 'Descent', 'Contact Pune'],
    expectedCalls: [
      'PAN PAN PAN PAN PAN PAN, Mumbai Control, IndiGo 101, medical emergency, passenger unconscious, 186 souls on board, request immediate diversion Pune.',
      'Mumbai Control, IndiGo 101, request descent flight level 100 direct Pune.',
    ],
  },

  // ── TASK 14 — HOLDING ────────────────────────────────────────
  {
    id: 'holding',
    task: 'Task 14',
    title: 'Holding Procedure',
    subtitle: 'IGABA Hold — runway congestion',
    phase: 'APPROACH',
    freq: '119.100',
    station: 'MUMBAI APPROACH',
    aircraft: 'IndiGo 6E-101',
    type: 'A320',
    dep: 'VIDP',
    arr: 'VABB',
    runway: '27',
    squawk: '4521',
    atis: { wind: '27006KT', vis: '9999', temp: '29/20', qnh: '1009', info: 'DELTA', cloud: 'FEW030' },
    description:
      'Runway congestion at Mumbai. Enter holding at IGABA VOR. '
      + 'Hold for two circuits, then receive approach clearance.',
    expectedFlow: [
      'Receive holding clearance: IGABA, inbound 270, right turns, EFC 1230Z',
      'Acknowledge hold with full readback',
      'Report entering hold',
      'After two circuits, receive approach',
      'Full ILS RWY 27',
    ],
    phases: ['Hold Clearance', 'Hold Entry Report', 'Circuit 1', 'Circuit 2', 'Approach Clearance'],
    expectedCalls: [
      'IndiGo 101, hold at IGABA, inbound track 270, right turns, 1-minute legs, altitude 5000 feet, expect approach 1230Z, wilco.',
      'Mumbai Approach, IndiGo 101, entering hold at IGABA.',
      'Mumbai Approach, IndiGo 101, ready to leave the hold.',
    ],
  },
];

// ──────────────────────────────────────────────────────────────
//  LEARN MODULE — ATC Communication Guide
// ──────────────────────────────────────────────────────────────

export const LEARN_MODULES = [
  {
    id: 'phonetics',
    icon: '🔤',
    title: 'Phonetic Alphabet',
    subtitle: 'A=Alpha, B=Bravo...',
    sections: [
      {
        heading: 'Why Use Phonetics?',
        body: `On radio, many letters sound identical — B, D, E, G, P, T, and V all rhyme in English. 
A single misheard letter in a runway number, callsign, or waypoint can be catastrophic. 
ICAO standardised the phonetic alphabet so every letter sounds completely unique.`,
      },
      {
        heading: 'The ICAO Alphabet',
        phonetic: true,
      },
      {
        heading: 'Number Pronunciation',
        body: `Numbers are spoken individually, not as full numbers:
• 0 = ZE-RO  • 1 = WUN  • 2 = TOO  • 3 = TREE  • 4 = FOW-er  • 5 = FIFE
• 6 = SIX  • 7 = SEV-en  • 8 = AIT  • 9 = NIN-er

Examples:
→ Runway 28 = "runway two eight"
→ FL350 = "flight level three five zero"
→ QNH 1013 = "one zero one three"
→ Squawk 4521 = "squawk four five two one"`,
      },
    ],
  },
  {
    id: 'structure',
    icon: '📡',
    title: 'Call Structure',
    subtitle: 'Who, Who, Message',
    sections: [
      {
        heading: 'The 3-Part Rule',
        body: `Every radio call has exactly three parts:

1. WHO you are calling  →  "Delhi Ground"
2. WHO you are         →  "IndiGo 101"
3. YOUR MESSAGE        →  "request startup stand Bravo 7"

Full call: "Delhi Ground, IndiGo 101, request startup stand Bravo 7."

Never skip any part. ATC needs to know: who do I need to respond to, and what do they want?`,
      },
      {
        heading: 'Callsign Rules',
        body: `• Always use your FULL callsign on first contact with a new station
• After establishment, ATC may abbreviate: "IndiGo 101" → "101"
• You may abbreviate ONLY after ATC has abbreviated first
• IndiGo 6E-101 spoken as: "IndiGo One Zero One" or "Six Echo One Zero One"
• Air India: "Air India One Eight Two"  
• SpiceJet: "Spice Jet Sierra Golf One One One"`,
      },
      {
        heading: 'Readback Rules',
        body: `You MUST read back:
✅ All clearances (route, SID, squawk, levels)
✅ All runway instructions (takeoff, landing, cross)
✅ All hold-short instructions
✅ All taxi routes (every taxiway + hold-short point)
✅ Frequency changes
✅ Any instruction containing numbers

You do NOT need to read back:
❌ Weather reports (ATIS)
❌ Traffic information
❌ General information

CRITICAL: If ATC says "Negative, readback incorrect" — stop and listen to the correction.`,
      },
    ],
  },
  {
    id: 'phraseology',
    icon: '🗣️',
    title: 'Standard Phraseology',
    subtitle: 'ICAO approved words only',
    sections: [
      {
        heading: 'Approved Phrases',
        phrases: [
          { word: 'AFFIRM', meaning: 'Yes (never say "yes" or "yeah")' },
          { word: 'NEGATIVE', meaning: 'No' },
          { word: 'WILCO', meaning: 'Will comply (received + will do)' },
          { word: 'ROGER', meaning: 'Message received (NOT "yes")' },
          { word: 'SAY AGAIN', meaning: 'Please repeat (not "repeat" alone)' },
          { word: 'STANDBY', meaning: 'Wait — I will call you back' },
          { word: 'CORRECT', meaning: 'What you said is right' },
          { word: 'APPROVED', meaning: 'Permission granted' },
          { word: 'HOLD POSITION', meaning: 'Stop immediately, do not move' },
          { word: 'EXPEDITE', meaning: 'Hurry — this is time-critical' },
          { word: 'IMMEDIATELY', meaning: 'Without any delay' },
          { word: 'CANCEL', meaning: 'Void the previous clearance' },
        ],
      },
      {
        heading: 'Common Mistakes to Avoid',
        body: `❌ "Okay" → ✅ "Wilco" or "Roger"
❌ "Yeah" / "Yes" → ✅ "Affirm"
❌ "No" → ✅ "Negative"
❌ "Repeat" (in emergency means fire again!) → ✅ "Say again"
❌ "Check" for an instruction → ✅ Read it back properly
❌ "With you" for check-in → ✅ State callsign + level + ATIS
❌ "Climbing to" → ✅ "Climbing flight level..."
❌ "Going to" → ✅ "Proceeding to" or "Routing via"`,
      },
    ],
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: 'Emergency Phraseology',
    subtitle: 'MAYDAY · PAN PAN · 7700',
    sections: [
      {
        heading: 'MAYDAY — Immediate Danger',
        body: `Use MAYDAY when there is IMMEDIATE danger to life (engine fire, structural failure, loss of control).

FORMAT — say exactly this:
MAYDAY MAYDAY MAYDAY
[ATC unit name]
[Your callsign]
[Nature of emergency]
[Number of souls on board]
[Fuel endurance in hours + minutes]
[Position or last known position]
[Altitude]
[Intentions / what you plan to do]

Example:
"MAYDAY MAYDAY MAYDAY, Delhi Departure, IndiGo 101, 
engine failure left engine, 186 souls on board, 
4 hours fuel, 10 miles north Delhi, 4000 feet descending, 
request immediate return runway 28."

→ Squawk 7700
→ ATC will clear all traffic and give you priority`,
      },
      {
        heading: 'PAN PAN — Urgency',
        body: `Use PAN PAN when there is an URGENT situation but no immediate danger to life 
(medical emergency, hydraulic issue, navigation failure).

FORMAT:
PAN PAN PAN PAN PAN PAN
[ATC unit]
[Callsign]
[Nature of urgency]
[Souls on board]
[Position]
[Intentions]

Example:
"PAN PAN PAN PAN PAN PAN, Mumbai Control, IndiGo 101, 
medical emergency passenger unconscious, 186 souls on board, 
FL350 80 miles north Mumbai, request priority and diversion Pune."

→ Squawk 7700 if instructed
→ You retain PIC authority to divert`,
      },
      {
        heading: 'Emergency Squawk Codes',
        body: `7700 = General Emergency (MAYDAY)
7600 = Radio Communications Failure
7500 = Unlawful Interference (Hijack — never squawk this accidentally)

If radio fails (squawk 7600):
• Continue on current clearance
• Squawk 7600 → ATC will see on radar
• Continue to destination unless safety requires otherwise
• Look for light signals from Tower on approach`,
      },
    ],
  },
  {
    id: 'clearance',
    icon: '📋',
    title: 'IFR Clearance Format',
    subtitle: 'CRAFT memory aid',
    sections: [
      {
        heading: 'CRAFT — The Clearance Memory Aid',
        body: `C — Clearance limit (destination airport)
R — Route (SID name, airways, waypoints)
A — Altitude (initial climb altitude + expected cruise level)
F — Frequency (departure frequency)
T — Transponder (squawk code)

Example clearance:
"IndiGo 101, cleared to Mumbai via KANKI3A departure, 
squawk 4521, expect FL350, initial climb 5000 feet, 
departure frequency 124.650."

Your readback covers ALL 5 parts:
"Cleared to Mumbai via KANKI3A, 
squawk 4521, expect FL350, initial 5000, 
departure 124.650, IndiGo 101."`,
      },
      {
        heading: 'Clearance Delivery Sequence',
        body: `Step 1 — Check ATIS (automated terminal information):
Listen to ATIS on its dedicated frequency. Note the INFORMATION letter (Alpha, Bravo...).

Step 2 — Contact Delivery:
"Delhi Delivery, IndiGo 101, Airbus A320, stand Bravo 7, 
request IFR clearance to Mumbai, information Alpha."

Step 3 — Receive and WRITE DOWN the clearance.

Step 4 — Read back every detail:
"Cleared to Mumbai via KANKI3A, squawk 4521, 
expect FL350, initial 5000 feet, departure 124.650, IndiGo 101."

Step 5 — Wait for: "IndiGo 101, readback correct."
Only then may you contact Ground for startup.`,
      },
    ],
  },
  {
    id: 'taxi',
    icon: '🚧',
    title: 'Ground Operations',
    subtitle: 'Startup, taxi, holding point',
    sections: [
      {
        heading: 'Startup & Pushback Sequence',
        body: `1. "Delhi Ground, IndiGo 101, stand Bravo 7, request startup and pushback, information Alpha."
ATC: "IndiGo 101, startup approved, push and start, face east, report ready to taxi."

2. You: "Startup approved, push and start, face east, wilco, IndiGo 101."
[Complete pushback, start engines]

3. You: "Delhi Ground, IndiGo 101, ready to taxi, runway 28."
ATC: "IndiGo 101, taxi via Alpha, cross runway 10/28, Bravo to holding point runway 28, QNH 1013."

4. FULL readback: 
"Taxi via Alpha, cross runway 10/28, Bravo, holding point runway 28, QNH 1013, IndiGo 101."`,
      },
      {
        heading: 'Runway Crossing Rules',
        body: `A runway crossing clearance is SEPARATE from a taxi clearance.

You need EXPLICIT clearance to cross any runway. 
If the taxi instruction says "hold short runway XX" — you stop there and wait.

❌ NEVER cross a runway without explicit "cross runway XX" in your clearance.

When given crossing clearance, ALWAYS read it back:
ATC: "IndiGo 101, cross runway 10/28."
You: "Cross runway 10/28, IndiGo 101."

After crossing: you may resume taxi on other taxiways without additional clearance
unless a new hold-short is given.`,
      },
    ],
  },
  {
    id: 'approach_land',
    icon: '🛬',
    title: 'Approach & Landing',
    subtitle: 'ILS, missed approach, landing',
    sections: [
      {
        heading: 'ILS Approach Sequence',
        body: `1. Approach contact:
"Mumbai Approach, IndiGo 101, flight level 250 descending, information Bravo."

2. Radar vectors to final:
ATC: "IndiGo 101, turn left heading 240, descend 2500 feet, 
intercept localizer runway 27."

3. ILS established:
"Mumbai Approach, IndiGo 101, ILS established runway 27."

4. Outer marker:
"IndiGo 101, outer marker." → ATC: "Contact Tower 118.100."

5. Tower contact:
"Mumbai Tower, IndiGo 101, ILS final runway 27, 4 miles."
ATC: "IndiGo 101, wind 270/10, runway 27, cleared to land."

6. Landing readback:
"Runway 27, cleared to land, IndiGo 101."`,
      },
      {
        heading: 'Go-Around Procedure',
        body: `If ATC issues go-around:
ATC: "IndiGo 101, go around, runway not clear."
→ Immediately: Thrust up, pitch up, flaps up sequence

Your call: "Going around, IndiGo 101."
Then: "Mumbai Approach, IndiGo 101, missed approach, climbing 3000 feet."

ATC will give you: heading, altitude, expect vectors or hold.
If self-initiated at Decision Height:
"Mumbai Tower, IndiGo 101, going around, runway not in sight."

Always declare go-around early — never continue a dangerous approach.`,
      },
    ],
  },
];

export const PHONETIC_TABLE = [
  { letter: 'A', word: 'Alpha', pronounce: 'AL-fah' },
  { letter: 'B', word: 'Bravo', pronounce: 'BRAH-voh' },
  { letter: 'C', word: 'Charlie', pronounce: 'CHAR-lee' },
  { letter: 'D', word: 'Delta', pronounce: 'DELL-tah' },
  { letter: 'E', word: 'Echo', pronounce: 'ECK-oh' },
  { letter: 'F', word: 'Foxtrot', pronounce: 'FOKS-trot' },
  { letter: 'G', word: 'Golf', pronounce: 'GOLF' },
  { letter: 'H', word: 'Hotel', pronounce: 'hoh-TELL' },
  { letter: 'I', word: 'India', pronounce: 'IN-dee-ah' },
  { letter: 'J', word: 'Juliet', pronounce: 'JEW-lee-ETT' },
  { letter: 'K', word: 'Kilo', pronounce: 'KEY-loh' },
  { letter: 'L', word: 'Lima', pronounce: 'LEE-mah' },
  { letter: 'M', word: 'Mike', pronounce: 'MIKE' },
  { letter: 'N', word: 'November', pronounce: 'no-VEM-ber' },
  { letter: 'O', word: 'Oscar', pronounce: 'OSS-cah' },
  { letter: 'P', word: 'Papa', pronounce: 'pah-PAH' },
  { letter: 'Q', word: 'Quebec', pronounce: 'keh-BECK' },
  { letter: 'R', word: 'Romeo', pronounce: 'ROW-me-oh' },
  { letter: 'S', word: 'Sierra', pronounce: 'see-AIR-rah' },
  { letter: 'T', word: 'Tango', pronounce: 'TANG-go' },
  { letter: 'U', word: 'Uniform', pronounce: 'YOU-nee-form' },
  { letter: 'V', word: 'Victor', pronounce: 'VIK-tah' },
  { letter: 'W', word: 'Whiskey', pronounce: 'WISS-key' },
  { letter: 'X', word: 'Xray', pronounce: 'ECKS-ray' },
  { letter: 'Y', word: 'Yankee', pronounce: 'YANG-key' },
  { letter: 'Z', word: 'Zulu', pronounce: 'ZOO-loo' },
];

// ──────────────────────────────────────────────────────────────
//  PART 1 — KNOWLEDGE QUESTIONS (Exam Style)
// ──────────────────────────────────────────────────────────────

export const PART1_QUESTIONS = [
  {
    id: 'part1-q1',
    time: '29:59',
    number: '1.a',
    total: 6,
    title: 'IFR Clearance Delivery',
    question: 'Contact Clearance Delivery before engine start. Request full IFR route clearance to Mumbai. Receive SID, squawk code, initial altitude, departure frequency. Read back EVERYTHING.',
    flightInfo: {
      reg: 'VT-IND',
      dep: 'VOGO',
      route: 'Q12 NOBOD KANTI',
      aircraft: 'ATR72',
      dest: 'VOML RWY 06/24',
      stand: 'Stand 3',
      endurance: '05:30',
    },
    aircraft: { type: 'ATR72', reg: 'VT-IND', dest: 'VOML', runway: 'RWY 06/24', stand: 'Stand 3', endurance: '05:30' },
    frequencies: { ground: '121.9', tower: '118.1', approach: '119.7', control: '125.3' },
    weather: { atis: 'INFORMATION DELTA', meta: '0914 30Z', data: '08008KT 6000 FEW020' },
    expectedAnswer: 'Delhi Delivery, IndiGo 101, Airbus A320, stand Bravo 7, request IFR clearance to Mumbai, information Alpha.',
    type: 'communication',
  },
  {
    id: 'part1-q1b',
    time: '29:44',
    number: '1.b',
    total: 6,
    title: 'Permission for proposed action',
    question: 'Transmit the phrase that means: Permission for proposed action granted',
    flightInfo: {
      reg: 'VT-IND',
      dep: 'VOGO',
      route: 'Q12 NOBOD KANTI',
      aircraft: 'ATR72',
      dest: 'VOML RWY 06/24',
      stand: 'Stand 3',
      endurance: '05:30',
    },
    aircraft: { type: 'ATR72', reg: 'VT-IND', dest: 'VOML', runway: 'RWY 06/24', stand: 'Stand 3', endurance: '05:30' },
    frequencies: { ground: '121.9', tower: '118.1', approach: '119.7', control: '125.3' },
    weather: { atis: 'INFORMATION DELTA', meta: '0914 30Z', data: '08008KT 6000 FEW020' },
    expectedAnswer: 'APPROVED',
    type: 'phraseology',
  },
  {
    id: 'part1-q1c',
    time: '29:37',
    number: '1.c',
    total: 6,
    title: 'Message separation phrase',
    question: 'Transmit the phrase that means: I hereby indicate the separation between portions of the message',
    flightInfo: {
      reg: 'VT-IND',
      dep: 'VOGO',
      route: 'Q12 NOBOD KANTI',
      aircraft: 'ATR72',
      dest: 'VOML RWY 06/24',
      stand: 'Stand 3',
      endurance: '05:30',
    },
    aircraft: { type: 'ATR72', reg: 'VT-IND', dest: 'VOML', runway: 'RWY 06/24', stand: 'Stand 3', endurance: '05:30' },
    frequencies: { ground: '121.9', tower: '118.1', approach: '119.7', control: '125.3' },
    weather: { atis: 'INFORMATION DELTA', meta: '0914 30Z', data: '08008KT 6000 FEW020' },
    expectedAnswer: 'BREAK',
    type: 'phraseology',
  },
  {
    id: 'part1-q1d',
    time: '29:31',
    number: '1.d',
    total: 6,
    title: 'System examination phrase',
    question: 'Transmit the phrase that means: Examine a system or procedure',
    flightInfo: {
      reg: 'VT-IND',
      dep: 'VOGO',
      route: 'Q12 NOBOD KANTI',
      aircraft: 'ATR72',
      dest: 'VOML RWY 06/24',
      stand: 'Stand 3',
      endurance: '05:30',
    },
    aircraft: { type: 'ATR72', reg: 'VT-IND', dest: 'VOML', runway: 'RWY 06/24', stand: 'Stand 3', endurance: '05:30' },
    frequencies: { ground: '121.9', tower: '118.1', approach: '119.7', control: '125.3' },
    weather: { atis: 'INFORMATION DELTA', meta: '0914 30Z', data: '08008KT 6000 FEW020' },
    expectedAnswer: 'CHECK',
    type: 'phraseology',
  },
  {
    id: 'part1-q1e',
    time: '29:24',
    number: '1.e',
    total: 6,
    title: 'Request active runway entry',
    question: 'You are at NOBOD 1005 Est KANTI 1025, ETA Mangalore 1040. Give position report',
    flightInfo: {
      reg: 'VT-IND',
      dep: 'VOGO',
      route: 'Q12 NOBOD KANTI',
      aircraft: 'ATR72',
      dest: 'VOML RWY 06/24',
      stand: 'Stand 3',
      endurance: '05:30',
    },
    aircraft: { type: 'ATR72', reg: 'VT-IND', dest: 'VOML', runway: 'RWY 06/24', stand: 'Stand 3', endurance: '05:30' },
    frequencies: { ground: '121.9', tower: '118.1', approach: '119.7', control: '125.3' },
    weather: { atis: 'INFORMATION DELTA', meta: '0914 30Z', data: '08008KT 6000 FEW020' },
    expectedAnswer: 'IndiGo 101, position NOBOD 1005 EST KANTI 1025, ETA Mangalore 1040, flight level 200, souls on board 145.',
    type: 'communication',
  },
  {
    id: 'part1-q1f',
    time: '28:34',
    number: '1.f',
    total: 6,
    title: 'Emergency - Engine fire',
    question: 'Port engine on fire you are 150nm inbound VOML, inform ATC and take appropriate action',
    flightInfo: {
      reg: 'VT-IND',
      dep: 'VOGO',
      route: 'Q12 NOBOD KANTI',
      aircraft: 'ATR72',
      dest: 'VOML RWY 06/24',
      stand: 'Stand 3',
      endurance: '05:30',
    },
    aircraft: { type: 'ATR72', reg: 'VT-IND', dest: 'VOML', runway: 'RWY 06/24', stand: 'Stand 3', endurance: '05:30' },
    frequencies: { ground: '121.9', tower: '118.1', approach: '119.7', control: '125.3' },
    weather: { atis: 'INFORMATION DELTA', meta: '0914 30Z', data: '08008KT 6000 FEW020' },
    expectedAnswer: 'Mayday, Mayday, Mayday, IndiGo 101, port engine fire, 150 nautical miles inbound VOML, requesting immediate descent and vectors to nearest airfield, initializing engine fire procedures.',
    type: 'emergency',
  },
];
