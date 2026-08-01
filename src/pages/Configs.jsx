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
    'w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Server Config</h1>
        <button
          onClick={saveConfig}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden divide-y divide-gray-700">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <label className="text-sm text-gray-300 w-48 flex-shrink-0">
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
  )
}
