import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { signup, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signup(name, email, phone, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="bus-outline" size={60} color="#2f95dc" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join TransitPay today</Text>
        </View>

        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            value={name} 
            onChangeText={setName}
            editable={!loading}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Phone Number" 
            value={phone} 
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
          />
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <Pressable 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
            </Pressable>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <Pressable 
          style={[styles.signupBtn, loading && styles.signupBtnDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signupBtnText}>Sign Up</Text>
          )}
        </Pressable>

        <Pressable 
          style={styles.footer} 
          onPress={() => router.replace('/auth/login')}
          disabled={loading}
        >
          <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText}>Login</Text></Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },

  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  passwordContainer: { position: 'relative', marginBottom: 12 },
  eyeIcon: { position: 'absolute', right: 15, top: 15 },

  signupBtn: { backgroundColor: '#2f95dc', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  signupBtnDisabled: { opacity: 0.6 },
  signupBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#888', fontSize: 14 },
  linkText: { color: '#2f95dc', fontWeight: 'bold' },
});
