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

  const statusColor = status === 'running' ? 'bg-green-900 text-green-200' : status === 'starting' ? 'bg-yellow-900 text-yellow-200' : status === 'external' ? 'bg-orange-900 text-orange-200' : 'bg-red-900 text-red-200'
  const statusLabel = status === 'running' ? 'Running' : status === 'starting' ? 'Starting...' : status === 'external' ? 'External Process' : 'Stopped'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Console</h1>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
          {status === 'external' && externalPid ? (
            <button
              onClick={killExternal}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Kill External (PID {externalPid})
            </button>
          ) : status === 'running' || status === 'starting' ? (
            <button
              onClick={stopServer}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={startServer}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Start
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-300">Server Output</h2>
        </div>
        <div className="h-96 overflow-y-auto p-4 font-mono text-sm text-gray-300 bg-black">
          {logs.length === 0 && (
            <p className="text-gray-500">Server output will appear here...</p>
          )}
          {logs.map((log, i) => (
            <div key={i} className={log.type === 'cmd' ? 'text-yellow-400' : log.type === 'error' ? 'text-red-400' : 'text-gray-300'}>
              {log.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        <form onSubmit={sendCommand} className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
