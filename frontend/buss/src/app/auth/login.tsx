import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <Ionicons name="bus-outline" size={80} color="#2f95dc" />
          <Text style={styles.title}>TransitPay</Text>
          <Text style={styles.subtitle}>Smart public transport payment</Text>
        </View>

        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
        </View>

        <Pressable 
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.replace('/auth/signup')} disabled={loading}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },

  logoContainer: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 15 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },

  inputGroup: { marginBottom: 30 },
  input: { backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  passwordContainer: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 15 },

  loginBtn: { backgroundColor: '#2f95dc', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#888', fontSize: 14 },
  signupLink: { color: '#2f95dc', fontWeight: 'bold', fontSize: 14 },
  linkText: { color: '#2f95dc', fontWeight: 'bold' },
});
