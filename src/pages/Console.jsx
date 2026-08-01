import { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:3001/api'

const COMMANDS = [
  'op',
  'deop',
  'kick',
  'ban',
  'pardon',
  'unban',
  'whitelist',
  'list',
  'say',
  'tp',
  'teleport',
  'give',
  'effect',
  'enchant',
  'gamemode',
  'difficulty',
  'time',
  'weather',
  'kill',
  'me',
  'msg',
  'tell',
  'w',
  'title',
  'playsound',
  'stop',
  'reload',
  'save',
  'seed',
  'setblock',
  'clone',
  'fill',
  'summon',
  'spawnpoint',
  'worldborder',
  'execute',
  'function',
  'scoreboard',
  'team',
  'tag',
  'data',
  'attribute',
  'recipe',
  'xp',
  'loot',
  'camerashake',
  'event',
  'fog',
  'music',
  'particle',
  'schedule',
  'stopsound',
  'titleraw',
  'trigger',
  'toggledownfall',
  'help',
  '?',
]

export default function Console() {
  const [status, setStatus] = useState('stopped')
  const [logs, setLogs] = useState([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wsRef = useRef(null)
  const logEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/ws/console')
    wsRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'status') {
        setStatus(data.status)
      } else if (data.type === 'info' || data.type === 'stdout' || data.type === 'stderr' || data.type === 'error') {
        setLogs((prev) => [...prev, data])
      }
    }

    ws.onclose = () => {
      setStatus('stopped')
    }

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    async function restoreState() {
      try {
        const [statusRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/server/status`),
          fetch(`${API_BASE}/server/logs`),
        ])
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          setStatus(statusData.status)
        }
        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData.logs || [])
        }
      } catch {
        // ignore
      }
    }
    restoreState()
  }, [])

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const startServer = async () => {
    const res = await fetch(`${API_BASE}/server/start`, { method: 'POST' })
    const data = await res.json()
    if (data.status) setStatus(data.status)
    if (data.error) setLogs((prev) => [...prev, { type: 'error', text: data.error }])
  }

  const stopServer = async () => {
    const res = await fetch(`${API_BASE}/server/stop`, { method: 'POST' })
    const data = await res.json()
    if (data.status) setStatus('stopped')
  }

  const sendCommand = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const trimmed = input.trim().replace(/^\//, '')
    setLogs((prev) => [...prev, { type: 'cmd', text: `> ${trimmed}` }])
    setInput('')
    setSuggestions([])
    setSelectedIndex(-1)
    await fetch(`${API_BASE}/server/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: trimmed }),
    })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)
    if (value.trim().length > 0) {
      const filtered = COMMANDS.filter((cmd) =>
        cmd.toLowerCase().startsWith(value.trim().toLowerCase())
      )
      setSuggestions(filtered)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setSelectedIndex(-1)
    }
  }

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault()
        setInput(suggestions[selectedIndex])
        setSuggestions([])
        setSelectedIndex(-1)
        inputRef.current?.focus()
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setSelectedIndex(-1)
    }
  }

  const selectSuggestion = (cmd) => {
    setInput(cmd)
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const statusConfig = {
    running: { label: 'Running', className: 'tag-green' },
    starting: { label: 'Starting', className: 'tag-yellow' },
    external: { label: 'Running', className: 'tag-green' },
    stopped: { label: 'Stopped', className: 'tag-blue' },
  }

  const currentStatus = statusConfig[status] || statusConfig.stopped

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Console
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Start, stop, and interact with the server process.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`tag ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
          {status === 'running' || status === 'starting' || status === 'external' ? (
            <button onClick={stopServer} className="btn-danger">
              Stop
            </button>
          ) : (
            <button onClick={startServer} className="btn-primary">
              Start
            </button>
          )}
        </div>
      </div>

      <div className="card card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Server Output
          </h2>
        </div>
        <div className="console-output">
          {logs.length === 0 && (
            <p style={{ color: 'var(--color-text-secondary)' }}>Server output will appear here...</p>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              className={[
                'log-line',
                log.type === 'cmd' ? 'log-cmd' : '',
                log.type === 'error' ? 'log-error' : '',
                log.type === 'info' ? 'log-info' : '',
                log.type === 'stdout' || log.type === 'stderr' ? 'log-std' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {log.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        <form onSubmit={sendCommand} className="mt-4 relative">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="input-field font-mono"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="submit" className="btn-primary">
              Send
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((cmd, i) => (
                <button
                  key={cmd}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectSuggestion(cmd)
                  }}
                  className={`suggestion-item ${i === selectedIndex ? 'selected' : ''}`}
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
