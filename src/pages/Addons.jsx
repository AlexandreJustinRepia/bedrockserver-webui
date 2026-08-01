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
    <div className="space-y-8">
      <div>
        <h1 className="font-editorial text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Addons
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Install and manage behavior packs, resource packs, and world templates.
        </p>
      </div>

      <div className="card">
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Add New Addon
        </h2>
        <form onSubmit={addAddon} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Addon name"
              className="input-field"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
            >
              <option value="Behavior Pack">Behavior Pack</option>
              <option value="Resource Pack">Resource Pack</option>
              <option value="World Template">World Template</option>
            </select>
            <label className="btn-primary cursor-pointer inline-flex items-center justify-center">
              Choose File
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0]?.name || null)}
              />
            </label>
            <button type="submit" className="btn-primary">
              Add
            </button>
          </div>
          {file && <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Selected: {file}</p>}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((addon, i) => (
          <div
            key={i}
            className="card card-hover stagger-item"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {addon.name}
                </p>
                <p className="text-xs mt-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  {addon.type}
                </p>
              </div>
              <span className={`tag ${addon.enabled !== false ? 'tag-green' : 'tag-red'}`}>
                {addon.enabled !== false ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => toggleAddon(i)}
                className={`${addon.enabled !== false ? 'btn-danger' : 'btn-primary'} text-xs`}
              >
                {addon.enabled !== false ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => removeAddon(addon)}
                className="btn-danger text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {addons.length === 0 && (
          <div className="col-span-full py-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No addons installed.
          </div>
        )}
      </div>
    </div>
  )
}
