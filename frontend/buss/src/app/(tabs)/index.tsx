import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrips } from '../../contexts/TripsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Home() {
  const { wallet, bookings, walletLoading, bookingsLoading, refreshWallet, fetchMyBookings } = useTrips();
  const { user } = useAuth();
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([refreshWallet(), fetchMyBookings()]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const handleTopUp = () => {
    router.push('/wallet/deposit');
  };

  const recentBookings = bookings.slice(0, 3);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={undefined}>
      {/* Header: Greeting */}
      <View style={styles.headerGreeting}>
        <View>
          <Text style={styles.greetingText}>Welcome back, {user?.Name || 'Passenger'}!</Text>
          <Text style={styles.dateText}>Have a great trip today</Text>
        </View>
        <Ionicons name="bus" size={32} color="#2f95dc" />
      </View>

      {/* Virtual Transport Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>Express Pass</Text>
          <Ionicons name="wifi" size={24} color="white" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${wallet?.balance || '0.00'}</Text>
        <Text style={styles.cardNumber}>**** **** **** {wallet?.card_id?.slice(-4) || '0000'}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={handleTopUp}>
          <Ionicons name="add-circle" size={28} color="#2f95dc" />
          <Text style={styles.actionText}>Top Up</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleRefresh}>
          <Ionicons name="refresh" size={28} color="#2f95dc" />
          <Text style={styles.actionText}>Refresh</Text>
        </Pressable>
      </View>

      {/* Recent Bookings */}
      <View style={styles.bookingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <Pressable onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {bookingsLoading ? (
          <ActivityIndicator size="small" color="#2f95dc" />
        ) : recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <View key={booking.TransactionID} style={styles.bookingItem}>
              <View style={styles.bookingIcon}>
                <Ionicons name={booking.BusType === 'Train' ? 'train' : 'bus'} size={20} color="#555" />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingRoute}>{booking.RouteName}</Text>
                <Text style={styles.bookingDate}>
                  {new Date(booking.ActualDate).toLocaleDateString()} {booking.ActualStartTime}
                </Text>
              </View>
              <Text style={styles.bookingPrice}>-${booking.Amount}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Pressable style={styles.browseBtn} onPress={() => router.push('/(tabs)/ticket')}>
              <Text style={styles.browseBtnText}>Browse Tickets</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerGreeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greetingText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 13, color: '#888', marginTop: 2 },

  card: {
    backgroundColor: '#2f95dc',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#2f95dc',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardType: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 5 },
  balanceAmount: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 15 },
  cardNumber: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  actionRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  actionBtn: { flex: 1, backgroundColor: 'white', paddingVertical: 15, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', elevation: 2 },
  actionText: { fontSize: 12, color: '#2f95dc', marginTop: 5, fontWeight: '500' },

  bookingSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAll: { fontSize: 12, color: '#2f95dc', fontWeight: '600' },

  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  bookingIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  bookingInfo: { flex: 1 },
  bookingRoute: { fontSize: 14, fontWeight: '600', color: '#333' },
  bookingDate: { fontSize: 12, color: '#888', marginTop: 2 },
  bookingPrice: { fontSize: 14, fontWeight: '600', color: '#e74c3c' },

  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, color: '#888', marginTop: 10 },
  browseBtn: { marginTop: 15, backgroundColor: '#2f95dc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  browseBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
});

