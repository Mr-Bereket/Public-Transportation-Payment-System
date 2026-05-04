import './Sidebar.css'

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Admin Dashboard</h1>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-item ${activeView === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveView('routes')}
        >
          Route Manager
        </button>
        <button
          className={`nav-item ${activeView === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveView('trips')}
        >
          Trip Scheduler
        </button>
        <button
          className={`nav-item ${activeView === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveView('drivers')}
        >
          Driver Management
        </button>
        <button
          className={`nav-item ${activeView === 'buses' ? 'active' : ''}`}
          onClick={() => setActiveView('buses')}
        >
          Bus Management
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar