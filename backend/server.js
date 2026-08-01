import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import { spawn, exec, execSync } from 'child_process'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '../..')
const SERVER_EXE = path.join(ROOT_DIR, 'bedrock_server.exe')
const SERVER_PROPERTIES = path.join(ROOT_DIR, 'server.properties')
const ALLOWLIST_PATH = path.join(ROOT_DIR, 'allowlist.json')

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

let serverProcess = null
let serverStatus = 'stopped'
const consoleClients = new Set()
const recentLogs = []
const MAX_LOGS = 500

function broadcastConsole(data) {
  const message = typeof data === 'string' ? data : JSON.stringify(data)
  const logEntry = typeof data === 'string' ? { type: 'raw', text: data } : data
  recentLogs.push(logEntry)
  if (recentLogs.length > MAX_LOGS) recentLogs.shift()
  consoleClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  })
}

function readServerProperties() {
  if (!fs.existsSync(SERVER_PROPERTIES)) return {}
  const content = fs.readFileSync(SERVER_PROPERTIES, 'utf-8')
  const result = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    result[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim()
  }
  return result
}

function writeServerProperties(data) {
  const lines = []
  for (const [key, value] of Object.entries(data)) {
    lines.push(`${key}=${value}`)
  }
  fs.writeFileSync(SERVER_PROPERTIES, lines.join('\n') + '\n', 'utf-8')
}

function readAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function writeAllowlist(data) {
  fs.writeFileSync(ALLOWLIST_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function findExternalServerPid() {
  try {
    const output = execSync('tasklist /FI "IMAGENAME eq bedrock_server.exe" /FO CSV /NH').toString()
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/^"bedrock_server\.exe","(\d+)"/)
      if (match) {
        const pid = parseInt(match[1], 10)
        if (serverProcess && serverProcess.pid === pid) continue
        return pid
      }
    }
  } catch {
    // ignore
  }
  return null
}

function killExternalServer(pid) {
  return new Promise((resolve, reject) => {
    exec(`taskkill /F /PID ${pid}`, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function getServerStatus() {
  const externalPid = findExternalServerPid()
  if (externalPid) {
    return { status: 'external', externalPid }
  }
  return { status: serverStatus, externalPid: null }
}

app.get('/api/server/status', (req, res) => {
  res.json(getServerStatus())
})

app.get('/api/server/logs', (req, res) => {
  res.json({ logs: recentLogs })
})

app.post('/api/server/start', async (req, res) => {
  const externalPid = findExternalServerPid()
  if (externalPid) {
    return res.status(409).json({ error: 'Another bedrock_server.exe is already running', externalPid })
  }
  if (serverProcess) {
    return res.status(400).json({ error: 'Server is already running' })
  }
  serverStatus = 'starting'
  broadcastConsole({ type: 'info', text: 'Starting server...' })

  serverProcess = spawn(SERVER_EXE, [], {
    cwd: ROOT_DIR,
    shell: true,
  })

  serverProcess.stdout.on('data', (data) => {
    const text = data.toString()
    broadcastConsole({ type: 'stdout', text })
  })

  serverProcess.stderr.on('data', (data) => {
    const text = data.toString()
    broadcastConsole({ type: 'stderr', text })
  })

  serverProcess.on('close', (code) => {
    broadcastConsole({ type: 'info', text: `Server process exited with code ${code}` })
    serverProcess = null
    serverStatus = 'stopped'
    recentLogs.length = 0
    broadcastConsole({ type: 'status', status: 'stopped' })
  })

  serverProcess.on('error', (err) => {
    broadcastConsole({ type: 'error', text: `Failed to start server: ${err.message}` })
    serverProcess = null
    serverStatus = 'stopped'
    recentLogs.length = 0
    broadcastConsole({ type: 'status', status: 'stopped' })
  })

  serverStatus = 'running'
  res.json({ status: 'running' })
})

app.post('/api/server/stop', async (req, res) => {
  const externalPid = findExternalServerPid()
  if (externalPid) {
    broadcastConsole({ type: 'info', text: `Stopping external server (PID ${externalPid})...` })
    try {
      await killExternalServer(externalPid)
      broadcastConsole({ type: 'info', text: 'External server stopped.' })
    } catch (err) {
      broadcastConsole({ type: 'error', text: `Stop error: ${err.message}` })
    }
    return res.json({ status: 'stopped' })
  }
  if (!serverProcess) {
    return res.status(400).json({ error: 'Server is not running' })
  }
  broadcastConsole({ type: 'info', text: 'Stopping server...' })
  const pid = serverProcess.pid
  try {
    exec(`taskkill /F /PID ${pid}`, (err) => {
      if (err && !err.message.includes('not found')) {
        broadcastConsole({ type: 'error', text: `Stop error: ${err.message}` })
      }
    })
  } catch {
    // ignore
  }
  res.json({ status: 'stopping' })
})

app.post('/api/server/force-kill-external', async (req, res) => {
  const externalPid = findExternalServerPid()
  if (!externalPid) {
    return res.status(400).json({ error: 'No external server found' })
  }
  try {
    await killExternalServer(externalPid)
    res.json({ killed: true, pid: externalPid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/server/command', (req, res) => {
  const { command } = req.body
  if (!serverProcess) {
    return res.status(400).json({ error: 'Server is not running' })
  }
  serverProcess.stdin.write(command + '\n')
  res.json({ sent: true })
})

app.get('/api/config', (req, res) => {
  res.json(readServerProperties())
})

app.post('/api/config', (req, res) => {
  writeServerProperties(req.body)
  res.json({ saved: true })
})

app.get('/api/players', (req, res) => {
  res.json(readAllowlist())
})

app.post('/api/players', (req, res) => {
  const { name, xuid } = req.body
  if (!name || !xuid) {
    return res.status(400).json({ error: 'name and xuid are required' })
  }
  const list = readAllowlist()
  const existing = list.find((p) => p.name === name || p.xuid === xuid)
  if (existing) {
    return res.status(400).json({ error: 'Player already exists' })
  }
  list.push({ name, xuid })
  writeAllowlist(list)
  res.json(list)
})

app.delete('/api/players/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name)
  const list = readAllowlist().filter((p) => p.name !== name)
  writeAllowlist(list)
  res.json(list)
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

const server = http.createServer(app)

const wss = new WebSocketServer({ server, path: '/ws/console' })

wss.on('connection', (ws) => {
  consoleClients.add(ws)
  ws.send(JSON.stringify({ type: 'status', status: serverStatus }))
  ws.on('close', () => {
    consoleClients.delete(ws)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`)
})
