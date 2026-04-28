import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  // Mock data - eventually this will come from your MariaDB API
  const balance = "450.00"; 
  const recentTrips = [
    { id: '1', route: 'Line 04 - Downtown', date: 'Today, 08:30 AM', price: '-25.00' },
    { id: '2', route: 'Line 12 - Airport', date: 'Yesterday, 05:15 PM', price: '-60.00' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* 1. The Virtual Transport Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>Express Pass</Text>
          <Ionicons name="wifi" size={24} color="white" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${balance}</Text>
        <Text style={styles.cardNumber}>**** **** **** 1234</Text>
      </View>

      {/* 2. Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="qr-code" size={28} color="#2f95dc" />
          <Text style={styles.actionText}>Scan to Pay</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="add-circle" size={28} color="#2f95dc" />
          <Text style={styles.actionText}>Top Up</Text>
        </Pressable>
      </View>

      {/* 3. Mini History (Last 2 Trips) */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentTrips.map((trip) => (
          <View key={trip.id} style={styles.tripItem}>
            <View style={styles.tripIcon}>
              <Ionicons name="bus" size={22} color="#555" />
            </View>
            <View style={styles.tripInfo}>
              <Text style={styles.tripRoute}>{trip.route}</Text>
              <Text style={styles.tripDate}>{trip.date}</Text>
            </View>
            <Text style={styles.tripPrice}>{trip.price}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  card: {
    backgroundColor: '#2f95dc',
    borderRadius: 20,
    padding: 25,
    height: 200,
    justifyContent: 'space-between',
    elevation: 8, // Adds shadow on Android
    marginBottom: 25,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardType: { color: 'white', fontWeight: 'bold', fontSize: 18, opacity: 0.9 },
  balanceLabel: { color: 'white', fontSize: 14, opacity: 0.8 },
  balanceAmount: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  cardNumber: { color: 'white', letterSpacing: 2, opacity: 0.8 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  actionBtn: { alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 15, width: '45%', elevation: 2 },
  actionText: { marginTop: 8, fontWeight: '600', color: '#333' },

  historySection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  tripIcon: { backgroundColor: '#eee', padding: 10, borderRadius: 10, marginRight: 15 },
  tripInfo: { flex: 1 },
  tripRoute: { fontWeight: 'bold', fontSize: 15 },
  tripDate: { color: '#888', fontSize: 12 },
  tripPrice: { fontWeight: 'bold', color: '#e74c3c' },
});

