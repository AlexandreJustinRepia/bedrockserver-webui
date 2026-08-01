import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:3001/api'

export default function Addons() {
  const [addons, setAddons] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('Behavior Pack')
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetchAddons()
  }, [])

  const fetchAddons = async () => {
    const res = await fetch(`${API_BASE}/addons`)
    const data = await res.json()
    setAddons(data)
  }

  const addAddon = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await fetch(`${API_BASE}/addons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), type }),
    })
    setName('')
    setFile(null)
    fetchAddons()
  }

  const toggleAddon = (index) => {
    setAddons((prev) =>
      prev.map((a, i) => (i === index ? { ...a, enabled: !a.enabled } : a))
    )
  }

  const removeAddon = async (addon) => {
    await fetch(`${API_BASE}/addons`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addon.name, type: addon.type }),
    })
    fetchAddons()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Addons</h1>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-300">Add New Addon</h2>
        </div>
        <form onSubmit={addAddon} className="p-4 space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Addon name"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Behavior Pack">Behavior Pack</option>
              <option value="Resource Pack">Resource Pack</option>
              <option value="World Template">World Template</option>
            </select>
            <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">
              Choose File
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0]?.name || null)}
              />
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
          {file && <p className="text-xs text-gray-500">Selected: {file}</p>}
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-300">Installed Addons ({addons.length})</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {addons.map((addon, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{addon.name}</p>
                <p className="text-xs text-gray-500">{addon.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAddon(i)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    addon.enabled
                      ? 'bg-green-900 text-green-200 hover:bg-green-800'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {addon.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => removeAddon(addon)}
                  className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded text-xs font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {addons.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">No addons installed.</p>
          )}
        </div>
      </div>
    </div>
  )
}
