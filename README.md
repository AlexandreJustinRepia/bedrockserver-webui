<p align="center">
  <img src="public/assets/images/logo/logo.png" alt="Minecraft Bedrock Logo" width="120" height="120">
</p>

<h1 align="center">Bedrock Server Web UI</h1>

<p align="center">A web interface for Minecraft Bedrock Dedicated Server.</p>

<br />

## Setup

1. Clone this repo into your bedrock server folder:
   ```bash
   git clone https://github.com/AlexandreJustinRepia/bedrockserver-webui.git web-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend API:
   ```bash
   npm run server
   ```

4. In another terminal, start the frontend dev server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

## Structure

- `backend/server.js` - Express + WebSocket API that controls the server
- `src/` - React frontend with Tailwind CSS

## Features

- Console with live output and command input
- Player allowlist management
- Server property configuration
- Addon management
- Dark / light mode toggle

## Notes

- The backend assumes `bedrock_server.exe` is in the parent directory.
- Server properties are read from and written to `../server.properties`.
- Players are managed via `../allowlist.json`.
- Addons are read from `../behavior_packs` and `../resource_packs`.
- Theme preference is saved to `localStorage`.

---

<p align="center">
  Developed by <strong>Alexandre Justin Repia</strong>
</p>
