import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTrips } from '../../contexts/TripsContext';

export default function Deposit() {
  const router = useRouter();
  const { deposit, walletLoading } = useTrips();
  const [amount, setAmount] = useState('');

  const presets = [5, 10, 20, 50, 100];

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    try {
      await deposit(parseFloat(amount));
      Alert.alert('Success', `$${amount} added to your wallet!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Deposit Failed', error.message || 'Could not process deposit');
    }
  };

  const handlePreset = (preset: number) => {
    setAmount(preset.toString());
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#2f95dc" />
        </Pressable>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={60} color="#2f95dc" />
        </View>

        <Text style={styles.title}>Add Funds</Text>
        <Text style={styles.subtitle}>Enter the amount to add to your TransitPay wallet</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!walletLoading}
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Quick Amount Presets */}
        <Text style={styles.presetsLabel}>Quick Amount</Text>
        <View style={styles.presetsContainer}>
          {presets.map((preset) => (
            <Pressable
              key={preset}
              style={[
                styles.presetBtn,
                amount === preset.toString() && styles.presetBtnActive,
              ]}
              onPress={() => handlePreset(preset)}
              disabled={walletLoading}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  amount === preset.toString() && styles.presetBtnTextActive,
                ]}
              >
                ${preset}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2f95dc" />
          <Text style={styles.infoText}>
            Funds will be available immediately in your wallet
          </Text>
        </View>
      </View>

      {/* Deposit Button */}
      <Pressable
        style={[styles.depositBtn, walletLoading && styles.depositBtnDisabled]}
        onPress={handleDeposit}
        disabled={walletLoading}
      >
        {walletLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.depositBtnText}>
              Add ${amount || '0.00'} to Wallet
            </Text>
          </>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
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

  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 30 },

  iconContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 40 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#2f95dc',
  },
  currencySymbol: { fontSize: 28, fontWeight: 'bold', color: '#2f95dc', marginRight: 5 },
  input: { flex: 1, paddingVertical: 18, fontSize: 24, fontWeight: 'bold', color: '#333' },

  presetsLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 12 },
  presetsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  presetBtn: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  presetBtnActive: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  presetBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  presetBtnTextActive: { color: 'white' },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f0ff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: '#2f95dc', fontWeight: '500' },

  depositBtn: {
    margin: 20,
    marginTop: 30,
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
  depositBtnDisabled: { opacity: 0.6 },
  depositBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
