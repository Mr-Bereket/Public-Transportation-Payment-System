USE PublicTransportDB;

-- Dummy data for PublicTransportDB

-- PASSENGER
INSERT INTO PASSENGER (Name, PhoneNumber, Password, JoinDate) VALUES
('Amanuel Bekele', '+251911000001', 'password123', '2024-07-01'),
('Martha Alemu', '+251911000002', 'password456', '2024-08-15'),
('Samuel Tadesse', '+251911000003', 'password789', '2024-09-10');

-- DRIVER
INSERT INTO DRIVER (Name, LicenseNumber, Status, HireDate) VALUES
('Tesfaye Gebremichael', 'DL-AT12345', 'active', '2022-05-20'),
('Meron Haile', 'DL-BT23456', 'active', '2023-03-12'),
('Elena Solomon', 'DL-CT34567', 'inactive', '2021-11-01');

-- BUS
INSERT INTO BUS (PlateNumber, Capacity, BusType, Status) VALUES
('ET-01-123', 50, 'standard', 'available'),
('ET-02-456', 40, 'express', 'in_service'),
('ET-03-789', 60, 'double_decker', 'maintenance');

-- ROUTE
INSERT INTO ROUTE (RouteName) VALUES
('City Center - Bole'),
('Bole - Megenagna'),
('Megenagna - Meskel Square');

-- STOPS
INSERT INTO STOPS (StopName, Latitude, Longitude) VALUES
('City Center', 9.0054, 38.7578),
('Meskel Square', 9.0181, 38.7579),
('Bole', 9.0200, 38.7920),
('Megenagna', 9.0103, 38.7817),
('Jemo', 9.0321, 38.7614);

-- SMART_CARD
INSERT INTO SMART_CARD (CardID, PassengerID, CardType, Balance, Status, ExpiryDate) VALUES
('CARD10001', 1, 'adult', 50.00, 'active', '2026-07-01'),
('CARD10002', 2, 'student', 25.50, 'active', '2025-09-15'),
('CARD10003', 3, 'senior', 10.00, 'inactive', '2024-12-31');

-- SCHEDULE
INSERT INTO SCHEDULE (RouteID, ArrivalTime, DepartureTime, DaysOfWeek) VALUES
(1, '07:00:00', '07:10:00', 'Mon,Tue,Wed,Thu,Fri'),
(2, '08:30:00', '08:40:00', 'Mon,Tue,Wed,Thu,Fri,Sat'),
(3, '09:15:00', '09:25:00', 'Mon,Wed,Fri');

-- ROUTE_STOPS
INSERT INTO ROUTE_STOPS (RouteID, StopID, StopOrder) VALUES
(1, 1, 1),
(1, 3, 2),
(1, 2, 3),
(2, 3, 1),
(2, 4, 2),
(2, 5, 3),
(3, 4, 1),
(3, 2, 2),
(3, 1, 3);

-- TRIP_INSTANCE
INSERT INTO TRIP_INSTANCE (ScheduleID, BusID, DriverID, ActualDate, ActualStartTime, ActualEndTime, DelayMinutes, PassengerCount) VALUES
(1, 1, 1, '2025-04-01', '07:00:00', '07:45:00', 5, 42),
(2, 2, 2, '2025-04-01', '08:30:00', '09:10:00', 0, 38),
(3, 1, 1, '2025-04-02', '09:15:00', '09:55:00', 10, 45);

-- TAP_EVENT
INSERT INTO TAP_EVENT (CardID, TripInstanceID, TimeStamp, TapType) VALUES
('CARD10001', 1, '2025-04-01 07:05:00', 'on'),
('CARD10002', 2, '2025-04-01 08:35:00', 'on'),
('CARD10003', 3, '2025-04-02 09:20:00', 'on'),
('CARD10001', 1, '2025-04-01 07:45:00', 'off');

-- TRANSACTION
INSERT INTO `TRANSACTION` (CardID, TripInstanceID, Amount, TimeStamp, PaymentStatus, Type) VALUES
('CARD10001', 1, 2.50, '2025-04-01 07:05:05', 'completed', 'fare'),
('CARD10002', 2, 3.00, '2025-04-01 08:35:05', 'completed', 'fare'),
('CARD10003', 3, 2.50, '2025-04-02 09:20:05', 'completed', 'fare'),
('CARD10001', NULL, 20.00, '2025-03-31 12:00:00', 'completed', 'deposit');

-- BUS_TRACKING
INSERT INTO BUS_TRACKING (TripInstanceID, Latitude, Longitude, TimeStamp, Status) VALUES
(1, 9.0100, 38.7660, '2025-04-01 07:20:00', 'on_route'),
(2, 9.0180, 38.7800, '2025-04-01 08:50:00', 'on_route'),
(3, 9.0150, 38.7600, '2025-04-02 09:30:00', 'delayed');
