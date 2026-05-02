import React, { createContext, useState, useContext } from 'react';
import { apiService, Schedule, Route, Trip, TripDetail, Booking, Wallet } from '../services/api';

interface TripsContextType {
  schedules: Schedule[];
  routes: Map<number, Route>;
  trips: Map<number, Trip[]>;
  bookings: Booking[];
  wallet: Wallet | null;
  walletLoading: boolean;
  bookingsLoading: boolean;
  schedulesLoading: boolean;

  // Wallet methods
  refreshWallet: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;

  // Trips methods
  fetchSchedules: () => Promise<void>;
  fetchRouteTrips: (routeId: number) => Promise<Trip[]>;
  fetchRoute: (routeId: number) => Promise<Route>;
  fetchTripDetails: (tripInstanceId: number) => Promise<TripDetail>;

  // Bookings methods
  fetchMyBookings: () => Promise<void>;
  buyTicket: (tripInstanceId: number) => Promise<void>;
  cancelBooking: (tripInstanceId: number) => Promise<void>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Map<number, Route>>(new Map());
  const [trips, setTrips] = useState<Map<number, Trip[]>>(new Map());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const [walletLoading, setWalletLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // Wallet methods
  const refreshWallet = async () => {
    setWalletLoading(true);
    try {
      const walletData = await apiService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };

  const deposit = async (amount: number) => {
    setWalletLoading(true);
    try {
      const updatedWallet = await apiService.deposit(amount);
      setWallet(updatedWallet);
    } catch (error) {
      console.error('Failed to deposit:', error);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };

  // Trips methods
  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const data = await apiService.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      throw error;
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchRouteTrips = async (routeId: number) => {
    try {
      const data = await apiService.getRouteTrips(routeId);
      setTrips(prev => new Map(prev).set(routeId, data));
      return data;
    } catch (error) {
      console.error('Failed to fetch route trips:', error);
      throw error;
    }
  };

  const fetchRoute = async (routeId: number) => {
    try {
      const data = await apiService.getRoute(routeId);
      setRoutes(prev => new Map(prev).set(routeId, data));
      return data;
    } catch (error) {
      console.error('Failed to fetch route:', error);
      throw error;
    }
  };

  const fetchTripDetails = async (tripInstanceId: number) => {
    try {
      const data = await apiService.getTrip(tripInstanceId);
      return data;
    } catch (error) {
      console.error('Failed to fetch trip details:', error);
      throw error;
    }
  };

  // Bookings methods
  const fetchMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await apiService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    } finally {
      setBookingsLoading(false);
    }
  };

  const buyTicket = async (tripInstanceId: number) => {
    try {
      await apiService.buyTicket(tripInstanceId);
      // Refresh wallet and bookings
      await Promise.all([refreshWallet(), fetchMyBookings()]);
    } catch (error) {
      console.error('Failed to buy ticket:', error);
      throw error;
    }
  };

  const cancelBooking = async (tripInstanceId: number) => {
    try {
      await apiService.cancelBooking(tripInstanceId);
      // Refresh wallet and bookings
      await Promise.all([refreshWallet(), fetchMyBookings()]);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  return (
    <TripsContext.Provider
      value={{
        schedules,
        routes,
        trips,
        bookings,
        wallet,
        walletLoading,
        bookingsLoading,
        schedulesLoading,
        refreshWallet,
        deposit,
        fetchSchedules,
        fetchRouteTrips,
        fetchRoute,
        fetchTripDetails,
        fetchMyBookings,
        buyTicket,
        cancelBooking,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within TripsProvider');
  }
  return context;
};
