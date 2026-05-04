import { useState, useEffect } from 'react'
import axios from 'axios'

interface Schedule {
  ScheduleID: number
  RouteID: number
  RouteName: string
  ArrivalTime: string
  DepartureTime: string
  DaysOfWeek: string
}

interface Bus {
  BusID: number
  PlateNumber: string
  Capacity: number
  BusType: string
}

interface Driver {
  DriverID: number
  Name: string
  LicenseNumber: string
}

interface Trip {
  TripInstanceID: number
  ScheduleID: number
  RouteName: string
  BusID: number
  PlateNumber: string
  DriverID: number
  DriverName: string
  ActualDate: string
  ActualStartTime: string
  ActualEndTime: string
  DelayMinutes: number
  PassengerCount: number
}

function TripScheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [formData, setFormData] = useState({
    ScheduleID: '',
    BusID: '',
    DriverID: '',
    ActualDate: '',
    ActualStartTime: '',
    ActualEndTime: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, busesRes, driversRes, tripsRes] = await Promise.all([
        axios.get('http://localhost:3000/admin/schedules'),
        axios.get('http://localhost:3000/admin/buses'),
        axios.get('http://localhost:3000/admin/drivers'),
        axios.get('http://localhost:3000/admin/trips')
      ])
      setSchedules(schedulesRes.data)
      setBuses(busesRes.data)
      setDrivers(driversRes.data)
      setTrips(tripsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await axios.post('http://localhost:3000/admin/trips', {
        ...formData,
        ScheduleID: parseInt(formData.ScheduleID),
        BusID: parseInt(formData.BusID),
        DriverID: parseInt(formData.DriverID)
      })
      alert('Trip created successfully!')
      setFormData({
        ScheduleID: '',
        BusID: '',
        DriverID: '',
        ActualDate: '',
        ActualStartTime: '',
        ActualEndTime: ''
      })
      fetchData() // Refetch to update the list
    } catch (error) {
      console.error('Error creating trip:', error)
      alert('Error creating trip')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Trip Scheduler</h1>

      <div className="card">
        <h2>Create New Trip</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Route/Schedule:</label>
            <select
              name="ScheduleID"
              value={formData.ScheduleID}
              onChange={handleChange}
              required
            >
              <option value="">Select a route</option>
              {schedules.map((schedule) => (
                <option key={schedule.ScheduleID} value={schedule.ScheduleID}>
                  {schedule.RouteName} - {schedule.DepartureTime} to {schedule.ArrivalTime} ({schedule.DaysOfWeek})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Bus:</label>
            <select
              name="BusID"
              value={formData.BusID}
              onChange={handleChange}
              required
            >
              <option value="">Select a bus</option>
              {buses.map((bus) => (
                <option key={bus.BusID} value={bus.BusID}>
                  {bus.PlateNumber} - {bus.BusType} (Capacity: {bus.Capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Driver:</label>
            <select
              name="DriverID"
              value={formData.DriverID}
              onChange={handleChange}
              required
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.DriverID} value={driver.DriverID}>
                  {driver.Name} - {driver.LicenseNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Actual Date:</label>
            <input
              type="date"
              name="ActualDate"
              value={formData.ActualDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Actual Start Time:</label>
            <input
              type="time"
              name="ActualStartTime"
              value={formData.ActualStartTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Actual End Time:</label>
            <input
              type="time"
              name="ActualEndTime"
              value={formData.ActualEndTime}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Create Trip
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Scheduled Trips</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Route</th>
              <th>Bus</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Delay (min)</th>
              <th>Passengers</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.TripInstanceID}>
                <td>{trip.TripInstanceID}</td>
                <td>{trip.RouteName}</td>
                <td>{trip.PlateNumber}</td>
                <td>{trip.DriverName}</td>
                <td>{trip.ActualDate}</td>
                <td>{trip.ActualStartTime}</td>
                <td>{trip.ActualEndTime}</td>
                <td>{trip.DelayMinutes}</td>
                <td>{trip.PassengerCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TripScheduler