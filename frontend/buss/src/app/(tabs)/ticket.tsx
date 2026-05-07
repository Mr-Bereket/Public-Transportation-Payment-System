import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { useTrips } from '../../contexts/TripsContext';
import { Schedule } from '../../services/api';
import { showAlert } from '../../services/alert';

export default function BuyTicket() {
  const router = useRouter();
  const navigation = useNavigation();
  const { schedules, schedulesLoading, fetchSchedules, fetchRouteTrips } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      await fetchSchedules();
    } catch (error) {
      showAlert('Error', 'Failed to load schedules');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSchedules();
      if (selectedRoute) {
        const tripData = await fetchRouteTrips(selectedRoute);
        setTrips(tripData);
      }
      showAlert('Success', 'Data refreshed');
    } catch (error) {
      showAlert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={{ marginRight: 15 }}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {({ pressed }) => (
            <Ionicons
              name="refresh"
              size={24}
              color={refreshing ? '#888' : '#2f95dc'}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      ),
    });
  }, [navigation, refreshing, selectedRoute]);

  const handleSelectRoute = async (routeId: number) => {
    setSelectedRoute(routeId);
    setTripsLoading(true);
    try {
      const tripData = await fetchRouteTrips(routeId);
      setTrips(tripData);
    } catch (error) {
      showAlert('Error', 'Failed to load trips for this route');
    } finally {
      setTripsLoading(false);
    }
  };

  const handleSelectTrip = (tripInstanceId: number) => {
    router.push({
      pathname: '/trips/trip-details',
      params: { tripInstanceId },
    });
  };

  const parseTripDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes, seconds = 0] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const isTripDone = (trip: any) => {
    const tripEnd = parseTripDateTime(trip.ActualDate, trip.ActualEndTime);
    return tripEnd <= new Date();
  };

  const getTripStatusLabel = (trip: any) => {
    if (isTripDone(trip)) return 'Done';
    if (trip.availableSeats <= 0) return 'Full';
    return 'Active';
  };

  const getTripStatusStyle = (trip: any) => {
    if (isTripDone(trip)) return styles.statusDone;
    if (trip.availableSeats <= 0) return styles.statusFull;
    return styles.statusActive;
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.RouteName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedRoute) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Where to?</Text>

        {/* Search Input Field */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search routes..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </Pressable>
          )}
        </View>

        {schedulesLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2f95dc" />
          </View>
        ) : (
          <FlatList
            data={filteredSchedules}
            keyExtractor={(item) => item.ScheduleID.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No routes found</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={styles.routeCard}
                onPress={() => handleSelectRoute(item.RouteID)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="bus" size={24} color="#2f95dc" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.routeName}>{item.RouteName}</Text>
                  <Text style={styles.routeTime}>
                    {item.DepartureTime} → {item.ArrivalTime}
                  </Text>
                  <Text style={styles.daysOfWeek}>{item.DaysOfWeek}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </Pressable>
            )}
          />
        )}
      </View>
    );
  }

  // Show trips for selected route
  const selectedSchedule = schedules.find(s => s.RouteID === selectedRoute);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.backHeader}>
        <Pressable onPress={() => setSelectedRoute(null)}>
          <Ionicons name="chevron-back" size={28} color="#2f95dc" />
        </Pressable>
        <Text style={styles.backTitle}>{selectedSchedule?.RouteName}</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.subHeader}>Available Trips</Text>

      {tripsLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      ) : trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.TripInstanceID.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tripCard}
              onPress={() => handleSelectTrip(item.TripInstanceID)}
            >
              <View style={styles.tripTimeContainer}>
                <Text style={styles.tripTime}>{item.ActualStartTime}</Text>
                <View style={styles.tripDot} />
                <Text style={styles.tripTime}>{item.ActualEndTime}</Text>
              </View>

              <View style={styles.tripDetailsContainer}>
                <View>
                  <Text style={styles.busType}>{item.BusType}</Text>
                  <Text style={styles.plateNumber}>{item.PlateNumber}</Text>
                </View>

                <View style={styles.seatsContainer}>
                  <Ionicons name="people" size={16} color="#888" />
                  <Text style={styles.seatsText}>
                    {item.availableSeats}/{item.Capacity} seats
                  </Text>
                </View>

                <View style={[
                  styles.statusBadge,
                  getTripStatusStyle(item)
                ]}>
                  <Text style={[styles.statusText, isTripDone(item) && styles.statusTextDone]}>
                    {getTripStatusLabel(item)}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
          )}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-clear-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No trips available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 15 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subHeader: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 15 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },

  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  iconContainer: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  routeName: { fontSize: 16, fontWeight: '600', color: '#333' },
  routeTime: { fontSize: 13, color: '#666', marginTop: 2 },
  daysOfWeek: { fontSize: 12, color: '#999', marginTop: 2 },

  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  tripTimeContainer: { alignItems: 'center', marginRight: 15, minWidth: 60 },
  tripTime: { fontSize: 14, fontWeight: '600', color: '#2f95dc' },
  tripDot: { width: 2, height: 2, backgroundColor: '#ccc', marginVertical: 4 },

  tripDetailsContainer: { flex: 1, gap: 8 },
  busType: { fontSize: 14, fontWeight: '600', color: '#333' },
  plateNumber: { fontSize: 12, color: '#888' },

  seatsContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  seatsText: { fontSize: 12, color: '#666' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#e8f5e9', borderRadius: 6 },
  statusActive: { backgroundColor: '#e8f5e9' },
  statusDone: { backgroundColor: '#ffe0e0' },
  statusFull: { backgroundColor: '#ffebee' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#2e7d32' },
  statusTextDone: { color: '#c62828' },

  emptyText: { fontSize: 16, color: '#888', marginTop: 15, textAlign: 'center' },
});