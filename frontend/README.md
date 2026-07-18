# CosaNostraApp Frontend

Frontend React/Vite de Cosa Nostra.

## Desarrollo local

```bash
npm install
npm run dev
```

Variable local:

```bash
VITE_API_URL=http://localhost:3001/api
```

## Deploy en Vercel

Configuracion sugerida:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Variable de entorno en Vercel:

```bash
VITE_API_URL=https://TU-BACKEND-RENDER.onrender.com/api
```

`vercel.json` redirige las rutas de React Router a `index.html`, para que URLs como `/builder`, `/cart` y `/order/:id` funcionen al refrescar.
