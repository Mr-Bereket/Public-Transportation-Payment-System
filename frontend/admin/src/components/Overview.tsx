import { useState, useEffect } from 'react'
import axios from 'axios'

interface OverviewData {
  passengers: number
  routes: number
  activeTrips: number
  totalRevenue: number
}

function Overview() {
  const [data, setData] = useState<OverviewData>({ passengers: 0, routes: 0, activeTrips: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/overview')
      setData(response.data)
    } catch (error) {
      console.error('Error fetching overview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const totalRevenue = Number(data.totalRevenue) || 0

  return (
    <div>
      <h1>Overview</h1>
      <div className="overview-cards">
        <div className="overview-card">
          <h3>Total Passengers</h3>
          <div className="count">{data.passengers}</div>
        </div>
        <div className="overview-card">
          <h3>Total Routes</h3>
          <div className="count">{data.routes}</div>
        </div>
        <div className="overview-card">
          <h3>Active Trips</h3>
          <div className="count">{data.activeTrips}</div>
        </div>
        <div className="overview-card">
          <h3>Total Revenue</h3>
          <div className="count">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default Overview