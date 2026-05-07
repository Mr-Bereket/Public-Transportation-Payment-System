import { useState, useEffect } from 'react'
import axios from 'axios'

interface Route {
  RouteID: number
  RouteName: string
}

function RouteManager() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [newRouteName, setNewRouteName] = useState('')
  const [newArrivalTime, setNewArrivalTime] = useState('')
  const [newDepartureTime, setNewDepartureTime] = useState('')
  const [newDaysOfWeek, setNewDaysOfWeek] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/routes')
      setRoutes(response.data)
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRoute = async () => {
    if (!newRouteName.trim()) return

    try {
      const payload: any = { RouteName: newRouteName }
      if (newArrivalTime || newDepartureTime || newDaysOfWeek) {
        payload.ArrivalTime = newArrivalTime
        payload.DepartureTime = newDepartureTime
        payload.DaysOfWeek = newDaysOfWeek
      }

      await axios.post('http://localhost:3000/admin/routes-with-schedule', payload)
      setNewRouteName('')
      setNewArrivalTime('')
      setNewDepartureTime('')
      setNewDaysOfWeek('')
      fetchRoutes()
      alert('Route created successfully!')
    } catch (error: any) {
      console.error('Error adding route:', error)
      const errorMessage = error.response?.data?.error || 'Error adding route'
      alert(errorMessage)
    }
  }

  const deleteRoute = async (id: number) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await axios.delete(`http://localhost:3000/admin/routes/${id}`)
        alert('Route deleted successfully!')
        fetchRoutes()
      } catch (error: any) {
        console.error('Error deleting route:', error)
        const errorMessage = error.response?.data?.error || 'Error deleting route'
        alert(errorMessage)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Route Manager</h1>

      <div className="card">
        <h2>Add New Route</h2>
        <div className="form-group">
          <label>Route Name:</label>
          <input
            type="text"
            value={newRouteName}
            onChange={(e) => setNewRouteName(e.target.value)}
            placeholder="Enter route name"
          />
        </div>
        <p style={{ marginBottom: '0.5rem', color: '#555' }}>
          Optionally add a schedule for this route now.
        </p>
        <div className="form-group">
          <label>Departure Time:</label>
          <input
            type="time"
            value={newDepartureTime}
            onChange={(e) => setNewDepartureTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Arrival Time:</label>
          <input
            type="time"
            value={newArrivalTime}
            onChange={(e) => setNewArrivalTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Days of Week:</label>
          <input
            type="text"
            value={newDaysOfWeek}
            onChange={(e) => setNewDaysOfWeek(e.target.value)}
            placeholder="e.g. Mon-Fri, Sat, Sun"
          />
        </div>
        <button className="btn btn-primary" onClick={addRoute}>
          Add Route
        </button>
      </div>

      <div className="card">
        <h2>Routes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Route Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.RouteID}>
                <td>{route.RouteID}</td>
                <td>{route.RouteName}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteRoute(route.RouteID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RouteManager