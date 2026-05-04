import { useState, useEffect } from 'react'
import axios from 'axios'

interface Driver {
  DriverID: number
  Name: string
  LicenseNumber: string
  Status: string
  HireDate: string
}

function DriverManager() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [formData, setFormData] = useState({
    Name: '',
    LicenseNumber: '',
    Status: 'active',
    HireDate: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/drivers')
      setDrivers(response.data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.Name.trim() || !formData.LicenseNumber.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await axios.post('http://localhost:3000/admin/drivers', formData)
      alert('Driver hired successfully!')
      setFormData({
        Name: '',
        LicenseNumber: '',
        Status: 'active',
        HireDate: new Date().toISOString().split('T')[0]
      })
      fetchDrivers()
    } catch (error) {
      console.error('Error hiring driver:', error)
      alert('Error hiring driver')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fireDriver = async (id: number) => {
    if (confirm('Are you sure you want to fire this driver?')) {
      try {
        await axios.delete(`http://localhost:3000/admin/drivers/${id}`)
        alert('Driver removed successfully!')
        fetchDrivers()
      } catch (error: any) {
        console.error('Error firing driver:', error)
        const errorMessage = error.response?.data?.error || 'Error firing driver'
        alert(errorMessage)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Driver Management</h1>

      <div className="card">
        <h2>Hire New Driver</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Enter driver name"
              required
            />
          </div>

          <div className="form-group">
            <label>License Number:</label>
            <input
              type="text"
              name="LicenseNumber"
              value={formData.LicenseNumber}
              onChange={handleChange}
              placeholder="Enter license number"
              required
            />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Hire Date:</label>
            <input
              type="date"
              name="HireDate"
              value={formData.HireDate}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Hire Driver
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Drivers List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>License Number</th>
              <th>Status</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.DriverID}>
                <td>{driver.DriverID}</td>
                <td>{driver.Name}</td>
                <td>{driver.LicenseNumber}</td>
                <td>{driver.Status}</td>
                <td>{driver.HireDate}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => fireDriver(driver.DriverID)}
                  >
                    Fire
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

export default DriverManager
