import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService, Transaction } from '../../services/api';
import { showAlert } from '../../services/alert';

export default function TransactionHistory() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransactionHistory();
      setTransactions(data);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const date = new Date(item.TimeStamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const isDeposit = item.Type === 'deposit';
    const itemColor = isDeposit ? '#2e7d32' : '#c62828';

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: isDeposit ? '#e8f5e9' : '#fdecea' }]}>
            <Ionicons name={isDeposit ? 'add-circle-outline' : 'remove-circle-outline'} size={24} color={itemColor} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>{item.Type === 'deposit' ? 'Wallet Top-Up' : 'Trip Fare'}</Text>
            <Text style={styles.transactionDate}>{formattedDate} · {formattedTime}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { color: itemColor }]}> {isDeposit ? '+' : '-'}{formatCurrency(item.Amount)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#2f95dc" />
        </Pressable>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>Your wallet activity will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.TransactionID.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderTransaction}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 15 },
  emptySubtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, elevation: 1 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transactionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: 15, fontWeight: '700', color: '#333' },
  transactionDate: { fontSize: 12, color: '#777', marginTop: 4 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
});
