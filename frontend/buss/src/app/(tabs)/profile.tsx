import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTrips } from '../../contexts/TripsContext';
import { showAlert } from '../../services/alert';

export default function Profile() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { wallet, refreshWallet } = useTrips();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.Name || '');
  const [editPhone, setEditPhone] = useState(user?.PhoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
        style: 'destructive'
      }
    ]);
  };

  const handleEditProfile = async () => {
    if (!editName || !editPhone) {
      showAlert('Validation Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Note: You would need to add updateUser to the useAuth hook
      // For now, just close the modal
      setEditModalVisible(false);
      showAlert('Success', 'Profile updated successfully');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWallet();
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
  }, [navigation, refreshing]);

  const joinDate = user?.JoinDate ? new Date(user.JoinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <ScrollView style={styles.container}>
      {/* 1. Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={50} color="#bbb" />
        </View>
        <Text style={styles.userName}>{user?.Name || 'Passenger'}</Text>
        <Text style={styles.userEmail}>{user?.PhoneNumber || 'N/A'}</Text>
        <Pressable 
          style={styles.editBtn}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* 2. Wallet Summary */}
      <View style={styles.walletSummary}>
        <View style={styles.walletCard}>
          <Ionicons name="wallet" size={24} color="#2f95dc" />
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>${wallet?.balance != null ? wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
        </View>
        <View style={styles.walletCard}>
          <Ionicons name="calendar" size={24} color="#27ae60" />
          <Text style={styles.walletLabel}>Member Since</Text>
          <Text style={styles.walletAmount}>{joinDate}</Text>
        </View>
      </View>

      {/* 3. Account Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="ticket" size={24} color="#2f95dc" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Ionicons name="star" size={24} color="#f39c12" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Tier</Text>
        </View>
      </View>

      {/* 4. Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Pressable 
          style={styles.actionItem}
          onPress={() => router.push('/wallet/deposit')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle-outline" size={24} color="#27ae60" />
          </View>
          <Text style={styles.actionLabel}>Top Up Wallet</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>

        <Pressable 
          style={styles.actionItem}
          onPress={() => router.push('/wallet/transactions')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="receipt-outline" size={24} color="#2f95dc" />
          </View>
          <Text style={styles.actionLabel}>View All Transactions</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>
      </View>

      {/* 5. Settings Menu */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Pressable style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={22} color="#555" />
            <Text style={styles.menuLabel}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>

        <Pressable style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#555" />
            <Text style={styles.menuLabel}>Security & Privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>

        <Pressable style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="help-circle-outline" size={22} color="#555" />
            <Text style={styles.menuLabel}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>

        <Pressable style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="information-circle-outline" size={22} color="#555" />
            <Text style={styles.menuLabel}>About TransitPay</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>
      </View>

      {/* 6. Logout */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                editable={!loading}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />

              <Pressable
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={handleEditProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'white', marginBottom: 20 },
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

  walletSummary: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginBottom: 20 },
  walletCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 1,
  },
  walletLabel: { fontSize: 12, color: '#888', marginTop: 10 },
  walletAmount: { fontSize: 16, fontWeight: 'bold', color: '#2f95dc', marginTop: 5 },

  statsRow: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 25, paddingHorizontal: 20, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#2f95dc', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { width: 1, backgroundColor: '#f0f0f0' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginBottom: 12 },

  actionsContainer: { marginBottom: 20 },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
  },
  actionIcon: { marginRight: 15 },
  actionLabel: { fontSize: 15, color: '#333', fontWeight: '500', flex: 1 },

  menuContainer: { marginBottom: 20, backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: 20, borderRadius: 12 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16, color: '#333' },

  logoutBtn: { margin: 20, marginBottom: 40, padding: 18, borderRadius: 12, alignItems: 'center', backgroundColor: '#fff0f0', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalBody: { paddingHorizontal: 20, paddingVertical: 25 },

  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20, fontSize: 16 },

  saveBtn: { backgroundColor: '#2f95dc', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

