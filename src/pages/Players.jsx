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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Players</h1>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-300">Add Player</h2>
        </div>
        <form onSubmit={addPlayer} className="p-4 flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            value={xuid}
            onChange={(e) => setXuid(e.target.value)}
            placeholder="XUID"
            className="w-40 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-300">Player List ({players.length})</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {players.map((player, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{player.name}</p>
                <p className="text-xs text-gray-500 font-mono">{player.xuid}</p>
              </div>
              <button
                onClick={() => removePlayer(player.name)}
                className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded text-xs font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {players.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">No players added.</p>
          )}
        </div>
      </div>
    </div>
  )
}
