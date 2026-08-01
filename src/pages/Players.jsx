import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:3001/api'

export default function Players() {
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')
  const [xuid, setXuid] = useState('')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    const res = await fetch(`${API_BASE}/players`)
    const data = await res.json()
    setPlayers(data)
  }

  const addPlayer = async (e) => {
    e.preventDefault()
    if (!name.trim() || !xuid.trim()) return
    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), xuid: xuid.trim() }),
    })
    if (res.ok) {
      fetchPlayers()
      setName('')
      setXuid('')
    }
  }

  const removePlayer = async (playerName) => {
    await fetch(`${API_BASE}/players/${encodeURIComponent(playerName)}`, { method: 'DELETE' })
    fetchPlayers()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-editorial text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Players
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Manage the server allowlist by adding or removing players.
        </p>
      </div>

      <div className="card">
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Add Player
        </h2>
        <form onSubmit={addPlayer} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="input-field"
          />
          <input
            type="text"
            value={xuid}
            onChange={(e) => setXuid(e.target.value)}
            placeholder="XUID"
            className="input-field font-mono"
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Player List ({players.length})
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {players.map((player, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 stagger-item"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {player.name}
                </p>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {player.xuid}
                </p>
              </div>
              <button
                onClick={() => removePlayer(player.name)}
                className="btn-danger"
              >
                Remove
              </button>
            </div>
          ))}
          {players.length === 0 && (
            <p className="py-6 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              No players added.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
