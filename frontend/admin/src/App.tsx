import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import RouteManager from './components/RouteManager'
import TripScheduler from './components/TripScheduler'
import DriverManager from './components/DriverManager'
import BusManager from './components/BusManager'

function App() {
  const [activeView, setActiveView] = useState('overview')

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <Overview />
      case 'routes':
        return <RouteManager />
      case 'trips':
        return <TripScheduler />
      case 'drivers':
        return <DriverManager />
      case 'buses':
        return <BusManager />
      default:
        return <Overview />
    }
  }

  return (
    <div className="app">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

export default App
