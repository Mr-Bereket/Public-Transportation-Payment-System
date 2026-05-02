import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTrips } from '../../contexts/TripsContext';
import { useAuth } from '../../contexts/AuthContext';
import { TripDetail } from '../../services/api';

export default function TripDetails() {
  const router = useRouter();
  const { tripInstanceId } = useLocalSearchParams();
  const { fetchTripDetails, buyTicket, wallet } = useTrips();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadTripDetails();
  }, []);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      if (tripInstanceId) {
        const tripData = await fetchTripDetails(parseInt(tripInstanceId as string));
        setTrip(tripData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = async () => {
    if (!trip || !wallet) return;

    const ticketPrice = 5.0;
    if (wallet.balance < ticketPrice) {
      Alert.alert(
        'Insufficient Balance',
        `You need $${ticketPrice} to buy a ticket. Your balance: $${wallet.balance.toFixed(2)}`,
        [{ text: 'Top Up', onPress: () => router.push('/wallet/deposit') }, { text: 'Cancel' }]
      );
      return;
    }

    if (trip.availableSeats <= 0) {
      Alert.alert('Trip Full', 'This trip has no available seats');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Purchase ticket for $${ticketPrice.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            setPurchasing(true);
            try {
              await buyTicket(trip.TripInstanceID);
              Alert.alert('Success', 'Ticket purchased successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/history') },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to purchase ticket');
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centerContainer}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  const ticketPrice = 5.0;
  const tripDate = new Date(trip.ActualDate);
  const formattedDate = tripDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#2f95dc" />
        </Pressable>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Route & Time Information */}
      <View style={styles.tripCard}>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineStart}>
            <View style={styles.timelineDot} />
            <Text style={styles.timelineLabel}>Depart</Text>
            <Text style={styles.timelineTime}>{trip.ActualStartTime}</Text>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineEnd}>
            <View style={[styles.timelineDot, styles.timelineDotEnd]} />
            <Text style={styles.timelineLabel}>Arrive</Text>
            <Text style={styles.timelineTime}>{trip.ActualEndTime}</Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{trip.RouteID}</Text>
          <Text style={styles.busInfo}>{trip.BusType} • {trip.PlateNumber}</Text>
        </View>
      </View>

      {/* Date Information */}
      <View style={styles.dateCard}>
        <Ionicons name="calendar" size={20} color="#2f95dc" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.dateLabel}>Date</Text>
          <Text style={styles.dateValue}>{formattedDate}</Text>
        </View>
      </View>

      {/* Seats & Availability */}
      <View style={styles.seatsCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.seatsLabel}>Available Seats</Text>
          <Text style={styles.seatsValue}>{trip.availableSeats} / {trip.Capacity}</Text>
        </View>
        <View style={[
          styles.availabilityBadge,
          trip.availableSeats === 0 && styles.availabilityFull
        ]}>
          <Text style={styles.availabilityText}>
            {trip.availableSeats > 0 ? 'Available' : 'Full'}
          </Text>
        </View>
      </View>

      {/* Driver Information */}
      <View style={styles.driverCard}>
        <Ionicons name="person-circle" size={40} color="#2f95dc" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.driverLabel}>Driver</Text>
          <Text style={styles.driverName}>{trip.DriverName}</Text>
        </View>
      </View>

      {/* Ticket Price & Buy Button */}
      <View style={styles.priceSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Ticket Price</Text>
          <Text style={styles.priceValue}>${ticketPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.walletInfo}>
          <Ionicons name="wallet" size={16} color="#666" />
          <Text style={styles.walletBalance}>
            Wallet: ${wallet?.balance?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>

      {/* Buy Button */}
      <Pressable
        style={[
          styles.buyBtn,
          (purchasing || trip.availableSeats === 0) && styles.buyBtnDisabled
        ]}
        onPress={handleBuyTicket}
        disabled={purchasing || trip.availableSeats === 0}
      >
        {purchasing ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="ticket" size={20} color="white" />
            <Text style={styles.buyBtnText}>
              {trip.availableSeats > 0 ? 'Buy Ticket' : 'Trip Full'}
            </Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },

  tripCard: {
    margin: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
  },
  timelineContainer: { marginBottom: 15 },
  timelineStart: { marginBottom: 10 },
  timelineEnd: { marginTop: 10 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2f95dc', marginBottom: 5 },
  timelineDotEnd: { backgroundColor: '#27ae60' },
  timelineLine: { width: 2, height: 30, backgroundColor: '#e0e0e0', marginLeft: 5, marginVertical: 5 },
  timelineLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  timelineTime: { fontSize: 14, fontWeight: '600', color: '#333' },

  routeInfo: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15, marginTop: 15 },
  routeName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  busInfo: { fontSize: 13, color: '#888', marginTop: 4 },

  dateCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  dateLabel: { fontSize: 12, color: '#888' },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },

  seatsCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  seatsLabel: { fontSize: 12, color: '#888' },
  seatsValue: { fontSize: 18, fontWeight: 'bold', color: '#2f95dc', marginTop: 2 },
  availabilityBadge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e8f5e9', borderRadius: 8 },
  availabilityFull: { backgroundColor: '#ffebee' },
  availabilityText: { fontSize: 12, fontWeight: '600', color: '#2e7d32' },

  driverCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  driverLabel: { fontSize: 12, color: '#888' },
  driverName: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },

  priceSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 1,
  },
  priceContainer: { marginBottom: 12 },
  priceLabel: { fontSize: 12, color: '#888' },
  priceValue: { fontSize: 24, fontWeight: 'bold', color: '#2f95dc', marginTop: 4 },
  walletInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletBalance: { fontSize: 12, color: '#666' },

  buyBtn: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#2f95dc',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
  },
  buyBtnDisabled: { opacity: 0.5 },
  buyBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
