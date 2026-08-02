# Desktop Launcher

One-click desktop shortcut to start the Bedrock Server Web UI.

## Files

- `start-webui.bat` - Main launcher script
- `create-shortcut.vbs` - Shortcut creator script

## Quick Setup

1. Double-click `create-shortcut.vbs`
2. A shortcut named **"Bedrock Server Web UI"** will appear on your desktop
3. Double-click the desktop shortcut anytime to launch

## What It Does

The launcher automatically:
1. Starts the backend API server on port 3001
2. Starts the frontend dev server on port 5173
3. Opens your default browser to `http://localhost:5173`

## Manual Start

If you prefer to start manually:

```bash
# Terminal 1 - Backend API
npm run server

# Terminal 2 - Frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## Stop Servers

To stop the servers:
- Close the command windows that opened
- Or press `Ctrl+C` in each terminal window

## Troubleshooting

**Port already in use:**
If you get `EADDRINUSE` errors, another instance is already running. Close any existing command windows or restart your computer.

**Backend won't start:**
Make sure Node.js is installed and run `npm install` first.

**Frontend shows connection errors:**
Make sure the backend is running on port 3001 before opening the frontend.
