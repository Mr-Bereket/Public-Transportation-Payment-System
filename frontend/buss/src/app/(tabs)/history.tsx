import { View, Text, StyleSheet, SectionList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTrips } from '../../contexts/TripsContext';

interface BookingSection {
  title: string;
  data: any[];
}

export default function History() {
  const { bookings, bookingsLoading, fetchMyBookings, cancelBooking } = useTrips();
  const [sections, setSections] = useState<BookingSection[]>([]);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      await fetchMyBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking history');
    }
  };

  useEffect(() => {
    // Group bookings by date
    const grouped: { [key: string]: any[] } = {};

    bookings.forEach(booking => {
      const date = new Date(booking.ActualDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(booking);
    });

    const sectionData: BookingSection[] = Object.entries(grouped).map(([title, data]) => ({
      title,
      data
    }));

    setSections(sectionData);
  }, [bookings]);

  const handleCancelBooking = (tripInstanceId: number, transactionId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Your payment will be refunded.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            setCancelling(tripInstanceId);
            try {
              await cancelBooking(tripInstanceId);
              Alert.alert('Success', 'Booking cancelled and refunded');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            } finally {
              setCancelling(null);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (bookingsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Trip History</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No trips booked yet</Text>
          <Text style={styles.emptySubtext}>Start by booking a ticket</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip History</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.TransactionID.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={[styles.iconBg, { backgroundColor: item.BusType === 'Train' ? '#e1f0ff' : '#f0f0f0' }]}>
              <Ionicons name={item.BusType === 'Train' ? 'train' : 'bus'} size={20} color="#555" />
            </View>
            <View style={styles.content}>
              <Text style={styles.routeText}>{item.RouteName}</Text>
              <Text style={styles.timeText}>
                {item.ActualStartTime} • {new Date(item.bookedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} booked
              </Text>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.priceText}>-${item.Amount.toFixed(2)}</Text>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => handleCancelBooking(item.TripInstanceID, item.TransactionID)}
                disabled={cancelling === item.TripInstanceID}
              >
                {cancelling === item.TripInstanceID ? (
                  <ActivityIndicator size="small" color="#e74c3c" />
                ) : (
                  <Ionicons name="close-circle-outline" size={16} color="#e74c3c" />
                )}
              </Pressable>
            </View>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 8,
    elevation: 1,
  },
  
  iconBg: { 
    padding: 10, 
    borderRadius: 12, 
    marginRight: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  content: { flex: 1 },
  routeText: { fontSize: 16, fontWeight: '600', color: '#333' },
  timeText: { fontSize: 12, color: '#888', marginTop: 4 },
  
  rightContainer: { alignItems: 'center', gap: 8 },
  priceText: { fontSize: 14, fontWeight: '600', color: '#e74c3c' },
  cancelBtn: { padding: 5 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 15 },
  emptySubtext: { fontSize: 14, color: '#aaa', marginTop: 5 },
});

