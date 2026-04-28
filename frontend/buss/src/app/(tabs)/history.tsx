import { View, Text, StyleSheet, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function History() {
  // Data grouped by sections
  const HISTORY_DATA = [
    {
      title: 'Today',
      data: [
        { id: '1', route: 'Line 04 - Downtown', time: '08:30 AM', price: '-$25.00', type: 'bus' },
        { id: '2', route: 'Line 12 - Airport', time: '05:15 PM', price: '-$60.00', type: 'train' },
      ],
    },
    {
      title: 'Yesterday',
      data: [
        { id: '3', route: 'Suburban Circle', time: '09:10 AM', price: '-$15.00', type: 'bus' },
        { id: '4', route: 'Central Station', time: '06:45 PM', price: '-$25.00', type: 'bus' },
      ],
    },
    {
      title: 'April 22, 2026',
      data: [
        { id: '5', route: 'University Shuttle', time: '10:00 AM', price: '-$10.00', type: 'bus' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip History</Text>

      <SectionList
        sections={HISTORY_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={[styles.iconBg, { backgroundColor: item.type === 'train' ? '#e1f0ff' : '#f0f0f0' }]}>
              <Ionicons name={item.type === 'train' ? 'train' : 'bus'} size={20} color="#555" />
            </View>
            <View style={styles.content}>
              <Text style={styles.routeText}>{item.route}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={styles.priceText}>{item.price}</Text>
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
  iconBg: { padding: 10, borderRadius: 12, marginRight: 15 },
  content: { flex: 1 },
  routeText: { fontSize: 16, fontWeight: '600', color: '#333' },
  timeText: { fontSize: 13, color: '#999', marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
});

