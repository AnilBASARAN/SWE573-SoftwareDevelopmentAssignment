
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

type Craft = {
  id: number
  name: string
  description: string
  category: string
  location: string
  image: string | null
  latitude: number | null
  longitude: number | null
}

function App() {
  const [crafts, setCrafts] = useState<Craft[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCrafts() {
      try {
        const response = await fetch('/api/crafts/')

        if (!response.ok) {
          throw new Error('Could not load crafts')
        }

        const data: Craft[] = await response.json()
        setCrafts(data)
      } catch {
        setError('Failed to connect to Django API')
      } finally {
        setLoading(false)
      }
    }

    loadCrafts()
  }, [])

  const categories = [...new Set(crafts.map(craft => craft.category))].sort()
  const visibleCrafts = crafts.filter(craft =>
    craft.latitude !== null &&
    craft.longitude !== null &&
    craft.name.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!category || craft.category === category)
  )

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 Local Craft Discovery Guide</h1>
        <p>Discover handmade crafts around the world</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
          <input aria-label="Search crafts by name" placeholder="Search crafts..." type="search"
            value={search} onChange={event => setSearch(event.target.value)}
            style={{ padding: '8px', flex: '1 1 180px', minWidth: 0 }} />
          <select aria-label="Filter by category" value={category}
            onChange={event => setCategory(event.target.value)} style={{ padding: '8px', maxWidth: '100%' }}>
            <option value="">All categories</option>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => { setSearch(''); setCategory('') }}>Clear filters</button>
          <span role="status">{loading ? 'Loading crafts...' : error ? error : visibleCrafts.length === 0 ? 'No matching crafts on the map' : visibleCrafts.length + ' crafts on the map'}</span>
        </div>
      </header>

      <main className="map-wrapper">
        <MapContainer
          center={[30, 0]}
          zoom={2}
          minZoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
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
                    <small>{craft.category}</small>
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
