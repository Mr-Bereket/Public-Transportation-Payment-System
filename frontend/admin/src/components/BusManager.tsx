import { useState, useEffect } from 'react'
import axios from 'axios'

interface Bus {
  BusID: number
  PlateNumber: string
  Capacity: number
  BusType: string
  Status: string
}

function BusManager() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [formData, setFormData] = useState({
    PlateNumber: '',
    Capacity: '',
    BusType: 'standard',
    Status: 'available'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/buses')
      setBuses(response.data)
    } catch (error) {
      console.error('Error fetching buses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.PlateNumber.trim() || !formData.Capacity) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await axios.post('http://localhost:3000/admin/buses', {
        ...formData,
        Capacity: parseInt(formData.Capacity)
      })
      alert('Bus added successfully!')
      setFormData({
        PlateNumber: '',
        Capacity: '',
        BusType: 'standard',
        Status: 'available'
      })
      fetchBuses()
    } catch (error) {
      console.error('Error adding bus:', error)
      alert('Error adding bus')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const removeBus = async (id: number) => {
    if (confirm('Are you sure you want to remove this bus?')) {
      try {
        await axios.delete(`http://localhost:3000/admin/buses/${id}`)
        alert('Bus removed successfully!')
        fetchBuses()
      } catch (error: any) {
        console.error('Error removing bus:', error)
        const errorMessage = error.response?.data?.error || 'Error removing bus'
        alert(errorMessage)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Bus Management</h1>

      <div className="card">
        <h2>Add New Bus</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plate Number:</label>
            <input
              type="text"
              name="PlateNumber"
              value={formData.PlateNumber}
              onChange={handleChange}
              placeholder="Enter plate number (e.g., ET-01-123)"
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity:</label>
            <input
              type="number"
              name="Capacity"
              value={formData.Capacity}
              onChange={handleChange}
              placeholder="Enter bus capacity"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Bus Type:</label>
            <select
              name="BusType"
              value={formData.BusType}
              onChange={handleChange}
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="double_decker">Double Decker</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="in_service">In Service</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Bus
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Buses List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Capacity</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.BusID}>
                <td>{bus.BusID}</td>
                <td>{bus.PlateNumber}</td>
                <td>{bus.Capacity}</td>
                <td>{bus.BusType}</td>
                <td>{bus.Status}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeBus(bus.BusID)}
                  >
                    Remove
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

export default BusManager
