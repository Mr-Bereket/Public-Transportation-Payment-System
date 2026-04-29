-- 1. Core Entities (No FKs)
CREATE TABLE PASSENGER (
    PassengerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    PhoneNumber VARCHAR(20),
    Password VARCHAR(255),
    JoinDate DATE
);

CREATE TABLE DRIVER (
    DriverID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    LicenseNumber VARCHAR(50),
    Status VARCHAR(20),
    HireDate DATE
);

CREATE TABLE BUS (
    BusID INT PRIMARY KEY AUTO_INCREMENT,
    PlateNumber VARCHAR(20),
    Capacity INT,
    BusType VARCHAR(20),
    Status VARCHAR(20)
);

CREATE TABLE ROUTE (
    RouteID INT PRIMARY KEY AUTO_INCREMENT,
    RouteName VARCHAR(100)
);

CREATE TABLE STOPS (
    StopID INT PRIMARY KEY AUTO_INCREMENT,
    StopName VARCHAR(100),
    Latitude FLOAT,
    Longitude FLOAT
);

-- 2. Secondary Entities (With FKs)
CREATE TABLE SMART_CARD (
    CardID VARCHAR(20) PRIMARY KEY,
    PassengerID INT,
    CardType VARCHAR(20),
    Balance DECIMAL(10, 2) DEFAULT 0.00,
    Status VARCHAR(20),
    ExpiryDate DATE,
    FOREIGN KEY (PassengerID) REFERENCES PASSENGER(PassengerID)
);

CREATE TABLE SCHEDULE (
    ScheduleID INT PRIMARY KEY AUTO_INCREMENT,
    RouteID INT,
    ArrivalTime TIME,
    DepartureTime TIME,
    DaysOfWeek VARCHAR(50),
    FOREIGN KEY (RouteID) REFERENCES ROUTE(RouteID)
);

CREATE TABLE ROUTE_STOPS (
    RouteStopID INT PRIMARY KEY AUTO_INCREMENT,
    RouteID INT,
    StopID INT,
    StopOrder INT,
    FOREIGN KEY (RouteID) REFERENCES ROUTE(RouteID),
    FOREIGN KEY (StopID) REFERENCES STOPS(StopID)
);

-- 3. Operational Entities
CREATE TABLE TRIP_INSTANCE (
    TripInstanceID INT PRIMARY KEY AUTO_INCREMENT,
    ScheduleID INT,
    BusID INT,
    DriverID INT,
    ActualDate DATE,
    ActualStartTime TIME,
    ActualEndTime TIME,
    DelayMinutes INT,
    PassengerCount INT,
    FOREIGN KEY (ScheduleID) REFERENCES SCHEDULE(ScheduleID),
    FOREIGN KEY (BusID) REFERENCES BUS(BusID),
    FOREIGN KEY (DriverID) REFERENCES DRIVER(DriverID)
);

CREATE TABLE TAP_EVENT (
    TapID INT PRIMARY KEY AUTO_INCREMENT,
    CardID VARCHAR(20),
    TripInstanceID INT,
    TimeStamp DATETIME,
    TapType VARCHAR(10),
    FOREIGN KEY (CardID) REFERENCES SMART_CARD(CardID),
    FOREIGN KEY (TripInstanceID) REFERENCES TRIP_INSTANCE(TripInstanceID)
);

CREATE TABLE TRANSACTION (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    CardID VARCHAR(20),
    TripInstanceID INT,
    Amount DECIMAL(10, 2),
    TimeStamp DATETIME,
    PaymentStatus VARCHAR(20),
    FOREIGN KEY (CardID) REFERENCES SMART_CARD(CardID),
    FOREIGN KEY (TripInstanceID) REFERENCES TRIP_INSTANCE(TripInstanceID)
);

CREATE TABLE BUS_TRACKING (
    TrackingID INT PRIMARY KEY AUTO_INCREMENT,
    TripInstanceID INT,
    Latitude FLOAT,
    Longitude FLOAT,
    TimeStamp DATETIME,
    Status VARCHAR(20),
    FOREIGN KEY (TripInstanceID) REFERENCES TRIP_INSTANCE(TripInstanceID)
);
 
