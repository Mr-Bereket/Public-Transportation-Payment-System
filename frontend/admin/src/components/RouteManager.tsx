import { useState, useEffect } from 'react'
import axios from 'axios'

interface Route {
  RouteID: number
  RouteName: string
}

function RouteManager() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [newRouteName, setNewRouteName] = useState('')
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
      await axios.post('http://localhost:3000/admin/routes', { RouteName: newRouteName })
      setNewRouteName('')
      fetchRoutes()
    } catch (error) {
      console.error('Error adding route:', error)
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