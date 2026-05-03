// API Configuration
export const API_BASE_URL = 'https://friendly-system-rq7495gvqqghxxv6-3000.app.github.dev';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP:'/auth/signup',

  // User
  GET_USER: '/user/me',
  UPDATE_USER: '/user/update',

  // Wallet
  GET_WALLET: '/wallet',
  DEPOSIT: '/wallet/deposit',
  TRANSACTION_HISTORY: '/wallet/history',

  // Trips
  GET_SCHEDULES: '/trips/schedules',
  GET_ROUTE: '/trips/routes/:routeId',
  GET_ROUTE_TRIPS: '/trips/route/:routeId/trips',
  GET_TRIP: '/trips/trips/:tripInstanceId',
  BUY_TICKET: '/trips/trips/:tripInstanceId/buy-ticket',
  GET_MY_BOOKINGS: '/trips/my-bookings',
  CANCEL_BOOKING: '/trips/trips/:tripInstanceId/cancel',
};
