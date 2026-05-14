# RTR Trainer — A320 Aviation Radio Simulator

AI-powered ATC radio communication trainer with real-time PTT (Push-To-Talk) support.

## Project Structure

```
rtr-trainer/
├── backend/          ← Node.js + Express + Socket.io API
│   ├── server.js     ← Main server (Gemini AI + ElevenLabs TTS)
│   ├── radioComm.js  ← WebRTC signaling for PTT Radio Comm
│   └── package.json
├── frontend/         ← React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/   (Simulator, RadioComm, Part1, Part2, etc.)
│   │   ├── data/         (scenarios, transmissions)
│   │   ├── hooks/        (useAudio, useMicrophone)
│   │   └── services/     (api.js)
│   ├── vercel.json
│   └── vite.config.js
└── render.yaml       ← Render deployment config
```

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY and ELEVENLABS_API_KEY
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:3001

## Deployment

### Render (Backend)
| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

**Environment Variables on Render:**
- `GEMINI_API_KEY` → your key
- `ELEVENLABS_API_KEY` → your key
- `ELEVENLABS_VOICE_ID` → `pNInz6obpgDQGcFmaJgB`
- `FRONTEND_URL` → your Vercel URL (after deploy)
- `NODE_ENV` → `production`

### Vercel (Frontend)
| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment Variables on Vercel:**
- `VITE_BACKEND_URL` → your Render URL (e.g. `https://rtr-trainer-backend.onrender.com`)
