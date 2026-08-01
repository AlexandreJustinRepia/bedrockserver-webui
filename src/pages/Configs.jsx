import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:3001/api'

export default function Configs() {
  const [config, setConfig] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    const res = await fetch(`${API_BASE}/config`)
    const data = await res.json()
    setConfig(data)
  }

  const update = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const saveConfig = async () => {
    await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass =
    'input-field font-mono text-sm'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Server Config
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Adjust server properties and gameplay settings.
          </p>
        </div>
        <button onClick={saveConfig} className="btn-primary">
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                {key}
              </label>
              {key === 'gamemode' ? (
                <select
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  className={inputClass}
                >
                  <option value="survival">survival</option>
                  <option value="creative">creative</option>
                  <option value="adventure">adventure</option>
                </select>
              ) : key === 'difficulty' ? (
                <select
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  className={inputClass}
                >
                  <option value="peaceful">peaceful</option>
                  <option value="easy">easy</option>
                  <option value="normal">normal</option>
                  <option value="hard">hard</option>
                </select>
              ) : ['online-mode', 'white-list', 'enable-command-block'].includes(key) ? (
                <select
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  className={inputClass}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  type={['max-players', 'spawn-protection', 'view-distance', 'tick-distance', 'player-idle-timeout'].includes(key) ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
