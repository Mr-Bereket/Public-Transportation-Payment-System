import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  phone: string;
  password: string;
}

export interface User {
  PassengerID: number;
  Name: string;
  PhoneNumber: string;
  JoinDate: string;
}

export interface Wallet {
  card_id: string;
  balance: number;
  status: string;
}

export interface Schedule {
  ScheduleID: number;
  RouteID: number;
  RouteName: string;
  ArrivalTime: string;
  DepartureTime: string;
  DaysOfWeek: string;
}

export interface Route {
  RouteID: number;
  RouteName: string;
  stops: Stop[];
}

export interface Stop {
  StopID: number;
  StopName: string;
  Latitude: number;
  Longitude: number;
  StopOrder: number;
}

export interface Trip {
  TripInstanceID: number;
  ActualDate: string;
  ActualStartTime: string;
  ActualEndTime: string;
  PassengerCount: number;
  Capacity: number;
  availableSeats: number;
  PlateNumber: string;
  BusType: string;
}

export interface TripDetail extends Trip {
  RouteID: number;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  DriverName: string;
}

export interface Booking {
  TransactionID: number;
  Amount: number;
  bookedAt: string;
  TripInstanceID: number;
  ActualDate: string;
  ActualStartTime: string;
  ActualEndTime: string;
  RouteName: string;
  PlateNumber: string;
  BusType: string;
}

export interface Transaction {
  TransactionID: number;
  Amount: number;
  TimeStamp: string;
  Type: 'deposit' | 'fare' | 'refund';
  PaymentStatus: string;
}

class APIService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders() {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: any = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API Error');
    }

    return data;
  }

  // Auth APIs
  async login(phone: string, password: string): Promise<{ token: string; user: User }> {
    return this.request(API_ENDPOINTS.LOGIN, 'POST', { phone, password });
  }

  async signup(name: string, phone: string, password: string): Promise<{ token: string; user: User }> {
    return this.request(API_ENDPOINTS.SIGNUP, 'POST', { name, phone, password });
  }

  // User APIs
  async getUser(): Promise<User> {
    return this.request(API_ENDPOINTS.GET_USER);
  }

  async updateUser(name?: string, phone?: string): Promise<{ message: string; user: User }> {
    return this.request(API_ENDPOINTS.UPDATE_USER, 'PATCH', { name, phone });
  }

  // Wallet APIs
  async getWallet(): Promise<Wallet> {
    return this.request(API_ENDPOINTS.GET_WALLET);
  }

  async deposit(amount: number): Promise<Wallet> {
    return this.request(API_ENDPOINTS.DEPOSIT, 'POST', { amount });
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    return this.request(API_ENDPOINTS.TRANSACTION_HISTORY);
  }

  // Trip APIs
  async getSchedules(): Promise<Schedule[]> {
    return this.request(API_ENDPOINTS.GET_SCHEDULES);
  }

  async getRoute(routeId: number): Promise<Route> {
    return this.request(API_ENDPOINTS.GET_ROUTE.replace(':routeId', routeId.toString()));
  }

  async getRouteTrips(routeId: number): Promise<Trip[]> {
    return this.request(API_ENDPOINTS.GET_ROUTE_TRIPS.replace(':routeId', routeId.toString()));
  }

  async getTrip(tripInstanceId: number): Promise<TripDetail> {
    return this.request(API_ENDPOINTS.GET_TRIP.replace(':tripInstanceId', tripInstanceId.toString()));
  }

  async buyTicket(tripInstanceId: number): Promise<{ message: string; ticketPrice: number; newBalance: number }> {
    return this.request(
      API_ENDPOINTS.BUY_TICKET.replace(':tripInstanceId', tripInstanceId.toString()),
      'POST'
    );
  }

  async getMyBookings(): Promise<Booking[]> {
    return this.request(API_ENDPOINTS.GET_MY_BOOKINGS);
  }

  async cancelBooking(tripInstanceId: number): Promise<{ message: string; refundAmount: number }> {
    return this.request(
      API_ENDPOINTS.CANCEL_BOOKING.replace(':tripInstanceId', tripInstanceId.toString()),
      'POST'
    );
  }
}

export const apiService = new APIService();
