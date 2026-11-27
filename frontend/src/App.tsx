
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

type Craft = {
  id: number
  name: string
  description: string
  category: string
  location: string
  materials: string
  weight: number | null
  volume: string | null
  production_process: string
  can_edit: boolean
  tags: string[]
  image: string | null
  latitude: number | null
  longitude: number | null
}

function LocationPicker({ onSelect }: { onSelect: (lat: string, lng: string) => void }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng
      if (lat >= -85 && lat <= 85 && lng >= -180 && lng <= 180) {
        onSelect(lat.toFixed(2), lng.toFixed(2))
      }
    },
  })
  return null
}

function App() {
  const [editing, setEditing] = useState<Craft | null>(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [crafts, setCrafts] = useState<Craft[]>([])
  const [token, setToken] = useState(() => sessionStorage.getItem('craftToken') || '')
  const [panel, setPanel] = useState<'login' | 'register' | 'craft' | ''>('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setNotice('')
    try {
      const creating = panel === 'craft'
      const response = await fetch(creating ? (editing ? `/api/crafts/${editing.id}/` : '/api/crafts/') : '/api/auth/' + panel + '/', {
        method: creating && editing ? 'PATCH' : 'POST',
        headers: creating ? { Authorization: 'Token ' + token } : { 'Content-Type': 'application/json' },
        body: creating ? (form.get('image') instanceof File && (form.get('image') as File).size === 0 ? (form.delete('image'), form) : form) : JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(JSON.stringify(data))
      if (creating) {
        setCrafts(previous => editing ? previous.map(craft => craft.id === editing.id ? data as Craft : craft) : [...previous, data as Craft])
        setSearch('')
        setCategory('')
      } else {
        sessionStorage.setItem('craftToken', data.token)
        setToken(data.token)
      }
      setPanel('')
      setNotice(creating ? (editing ? 'Craft updated!' : 'Craft published!') : 'Signed in successfully.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }
  async function logout() {
    try {
      const response = await fetch('/api/auth/logout/', {
        method: 'POST', headers: { Authorization: 'Token ' + token },
      })
      if (!response.ok && response.status !== 401) throw new Error('Logout failed; please retry.')
      sessionStorage.removeItem('craftToken')
      setToken('')
      setMineOnly(false)
      setPanel('')
      setNotice('Signed out.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Logout failed')
    }
  }

  async function deleteCraft(craft: Craft) {
    if (!window.confirm('Delete ' + craft.name + '?')) return
    try {
      const response = await fetch('/api/crafts/' + craft.id + '/', {
        method: 'DELETE', headers: { Authorization: 'Token ' + token },
      })
      if (!response.ok) throw new Error('Could not delete craft')
      setCrafts(previous => previous.filter(item => item.id !== craft.id))
      setNotice('Craft deleted.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Request failed')
    }
  }

  const [mineOnly, setMineOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function loadCrafts() {
      try {
        const response = await fetch('/api/crafts/', { headers: token ? { Authorization: 'Token ' + token } : {}, signal: controller.signal })
        if (response.status === 401 && token && !controller.signal.aborted) {
          sessionStorage.removeItem('craftToken')
          setToken('')
          setPanel('')
          setNotice('Session expired. Please log in again.')
          return
        }

        if (!response.ok) {
          throw new Error('Could not load crafts')
        }

        const data: Craft[] = await response.json()
        if (!controller.signal.aborted) { setCrafts(data); setError('') }
      } catch {
        if (!controller.signal.aborted) setError('Failed to connect to Django API')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCrafts()
    return () => controller.abort()
  }, [token])

  const categories = [...new Set(crafts.map(craft => craft.category))].sort()
  const visibleCrafts = crafts.filter(craft =>
    craft.latitude !== null &&
    craft.longitude !== null &&
    (!token || !mineOnly || craft.can_edit) &&
    [craft.name, craft.category, craft.location, craft.materials, ...craft.tags].some(value => value.toLowerCase().includes(search.trim().toLowerCase())) &&
    (!category || craft.category === category)
  )

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 Local Craft Discovery Guide</h1>
        <p>Discover handmade crafts around the world</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
          <input aria-label="Search crafts by name, category, location or materials" placeholder="Search crafts..." type="search"
            value={search} onChange={event => setSearch(event.target.value)}
            style={{ padding: '8px', flex: '1 1 180px', minWidth: 0 }} />
          <select aria-label="Filter by category" value={category}
            onChange={event => setCategory(event.target.value)} style={{ padding: '8px', maxWidth: '100%' }}>
            <option value="">All categories</option>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => { setSearch(''); setCategory(''); setMineOnly(false) }}>Clear filters</button>
          <span role="status">{loading ? 'Loading crafts...' : error ? error : visibleCrafts.length === 0 ? 'No matching crafts on the map' : visibleCrafts.length + ' crafts on the map'}</span>
        </div>
        <div className="account-controls">
          {token ? <>
            <button onClick={() => { setEditing(null); setLatitude(''); setLongitude(''); setPanel('craft'); setNotice('') }}>Add a craft</button>
            <button aria-pressed={mineOnly} onClick={() => setMineOnly(value => !value)}>{mineOnly ? 'Show all crafts' : 'My crafts'}</button>
            <button onClick={() => void logout()}>Log out</button>
          </> : <>
            <button onClick={() => { setPanel('login'); setNotice('') }}>Log in</button>
            <button onClick={() => { setPanel('register'); setNotice('') }}>Register</button>
          </>}
          <span role="status">{notice}</span>
        </div>
      </header>
      {panel && <section className="form-panel">
        <form key={panel + (editing && panel === 'craft' ? editing.id : '')} onSubmit={submit}>
          <h2>{panel === 'craft' ? (editing ? 'Edit craft' : 'Add a craft') : panel === 'login' ? 'Log in' : 'Register'}</h2>
          {panel === 'craft' ? <>
            <label>Name<input name="name" defaultValue={editing?.name} required maxLength={200} /></label>
            <label>Description<textarea name="description" defaultValue={editing?.description} required /></label>
            <label>Category<input list="craft-categories" name="category" defaultValue={editing?.category} required maxLength={100} /></label>
            <datalist id="craft-categories">{categories.map(item => <option key={item} value={item} />)}</datalist>
            <small>Choose an existing category or enter a new one.</small>
            <label>Tags (comma separated)<input name="tag_names" maxLength={510} defaultValue={editing?.tags.join(', ')} placeholder="handmade, traditional" /></label>
            <label>Location (public region)<input name="location" defaultValue={editing?.location} required maxLength={200} /></label>
            <label>Materials<input name="materials" defaultValue={editing?.materials} required maxLength={200} /></label>
            <label>Production process<textarea name="production_process" defaultValue={editing?.production_process} /></label>
            <label>Volume (liters)<input name="volume" type="number" min="0" max="9999999.999" step="0.001" defaultValue={editing?.volume ?? ''} /></label>
            <label>Weight (grams)<input name="weight" defaultValue={editing?.weight ?? ""} type="number" min="0" /></label>
            <p>Select an approximate public location on the map. Do not mark a private address.</p>
            <MapContainer center={editing && editing.latitude !== null && editing.longitude !== null ? [editing.latitude, editing.longitude] : [20, 0]} zoom={editing ? 5 : 1} minZoom={1}
              maxBounds={[[-85, -180], [85, 180]]}
              style={{ height: 220, width: '100%', marginBottom: 12 }}>
              <TileLayer noWrap attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng) }} />
              {latitude !== '' && longitude !== '' &&
                Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) &&
                Math.abs(Number(latitude)) <= 85 && Math.abs(Number(longitude)) <= 180 &&
                <Marker position={[Number(latitude), Number(longitude)]} />}
            </MapContainer>
            <label>Latitude (approximate)<input name="latitude" type="number" step="any" min="-85" max="85" required value={latitude} onChange={event => setLatitude(event.target.value)} /></label>
            <label>Longitude (approximate)<input name="longitude" type="number" step="any" min="-180" max="180" required value={longitude} onChange={event => setLongitude(event.target.value)} /></label>
            <label>Photo<input name="image" type="file" accept="image/*" /></label>
          </> : <>
            <label>Username<input name="username" required autoComplete="username" /></label>
            <label>Password<input name="password" type="password" required autoComplete={panel === 'login' ? 'current-password' : 'new-password'} /></label>
          </>}
          {notice && <p role="status">{notice}</p>}
          <button disabled={busy} type="submit">{busy ? 'Please wait...' : panel === 'craft' ? (editing ? 'Save changes' : 'Publish craft') : 'Continue'}</button>
          <button disabled={busy} type="button" onClick={() => setPanel('')}>Cancel</button>
        </form>
      </section>}

      <main className="map-wrapper">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          minZoom={1}
          maxBounds={[[-85, -180], [85, 180]]}
          maxBoundsViscosity={1}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            noWrap={true}
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visibleCrafts.map(craft => (
              <Marker
                key={craft.id}
                position={[craft.latitude!, craft.longitude!]}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <h3>{craft.name}</h3>

                    {craft.image && (
                      <img
                        src={craft.image}
                        alt={craft.name}
                        style={{ width: '100%', borderRadius: '6px' }}
                      />
                    )}

                    <p>{craft.description}</p>
                    <p>📍 {craft.location}</p>
                    <p>Materials: {craft.materials}</p>
                    {craft.weight !== null && <p>Weight: {craft.weight} g</p>}
                    {craft.volume !== null && <p>Volume: {craft.volume} L</p>}
                    {craft.production_process && <p>How it is made: {craft.production_process}</p>}
                    <small>{craft.category}</small>
                    {craft.tags.length > 0 && <p>Tags: {craft.tags.join(', ')}</p>}
                    {token && craft.can_edit && <div className="account-controls">
                      <button onClick={() => {
                        setEditing(craft)
                        setLatitude(String(craft.latitude ?? ''))
                        setLongitude(String(craft.longitude ?? ''))
                        setNotice('')
                        setPanel('craft')
                      }}>Edit</button>
                      <button onClick={() => void deleteCraft(craft)}>Delete</button>
                    </div>}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {loading && <div className="map-status">Loading crafts...</div>}
        {error && <div className="map-status">{error}</div>}
      </main>
    </div>
  )
}

export default App
