import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const menuItems = [
    { id: '1', icon: 'person-outline', label: 'Personal Information' },
    { id: '2', icon: 'card-outline', label: 'Payment Methods' },
    { id: '3', icon: 'notifications-outline', label: 'Travel Alerts' },
    { id: '4', icon: 'shield-checkmark-outline', label: 'Security & Privacy' },
    { id: '5', icon: 'help-circle-outline', label: 'Support & FAQ' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* 1. Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={50} color="#bbb" />
        </View>
        <Text style={styles.userName}>Redouane</Text>
        <Text style={styles.userEmail}>dev.student@transit.app</Text>
        <Pressable style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* 2. Account Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>124</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>Gold</Text>
          <Text style={styles.statLabel}>Tier</Text>
        </View>
      </View>

      {/* 3. Settings Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <Pressable key={item.id} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={22} color="#555" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </Pressable>
        ))}
      </View>

      {/* 4. Logout */}
      <Pressable style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'white' },
  avatarPlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 4 },
  editBtn: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },

  statsRow: { flexDirection: 'row', backgroundColor: 'white', paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#2f95dc' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { width: 1, height: '100%', backgroundColor: '#f0f0f0' },

  menuContainer: { marginTop: 20, backgroundColor: 'white', paddingHorizontal: 20 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f8f9fa' 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16, color: '#333' },

  logoutBtn: { margin: 30, padding: 18, borderRadius: 15, alignItems: 'center', backgroundColor: '#fff0f0' },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
});

