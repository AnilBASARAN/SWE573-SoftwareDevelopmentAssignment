
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>🌍 Local Craft Discovery Guide</h1>
        <p>Discover handmade crafts around the world</p>
      </header>

      <main className="map-wrapper">
        <MapContainer
          center={[30, 10]}
          zoom={2}
          minZoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[40.15, 26.41]}>
            <Popup>
              <strong>Handmade Craft</strong>
              <p>Çanakkale, Türkiye</p>
              <small>Demo product location</small>
            </Popup>
          </Marker>
        </MapContainer>
      </main>
    </div>
  )
}

export default App
