import { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:3001/api'

export default function Console() {
  const [status, setStatus] = useState('stopped')
  const [externalPid, setExternalPid] = useState(null)
  const [logs, setLogs] = useState([])
  const [input, setInput] = useState('')
  const wsRef = useRef(null)
  const logEndRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/ws/console')
    wsRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'status') {
        setStatus(data.status)
        setExternalPid(data.externalPid || null)
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
          setExternalPid(statusData.externalPid || null)
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

  const killExternal = async () => {
    const res = await fetch(`${API_BASE}/server/force-kill-external`, { method: 'POST' })
    const data = await res.json()
    if (data.killed) {
      setExternalPid(null)
      setStatus('stopped')
    }
  }

  const sendCommand = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setLogs((prev) => [...prev, { type: 'cmd', text: `> ${input}` }])
    const trimmed = input
    setInput('')
    await fetch(`${API_BASE}/server/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: trimmed }),
    })
  }

  const statusConfig = {
    running: { label: 'Running', className: 'tag-green' },
    starting: { label: 'Starting', className: 'tag-yellow' },
    external: { label: 'External Process', className: 'tag-red' },
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
            {status === 'external' && externalPid && ` · PID ${externalPid}`}
          </span>
          {status === 'external' && externalPid ? (
            <button onClick={killExternal} className="btn-danger">
              Kill External
            </button>
          ) : status === 'running' || status === 'starting' ? (
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
        <form onSubmit={sendCommand} className="mt-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="input-field font-mono"
            />
            <button type="submit" className="btn-primary">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
