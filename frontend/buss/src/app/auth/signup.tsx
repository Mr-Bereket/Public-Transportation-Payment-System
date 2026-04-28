import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join the network today</Text>

      <View style={styles.inputGroup}>
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <Pressable style={styles.signupBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.signupBtnText}>Sign Up</Text>
      </Pressable>

      <Pressable style={styles.footer} onPress={() => router.back()}>
        <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText}>Login</Text></Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: '#f8f9fa', padding: 18, borderRadius: 15, marginBottom: 15, fontSize: 16 },
  signupBtn: { backgroundColor: '#2f95dc', padding: 18, borderRadius: 15, alignItems: 'center' },
  signupBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#888' },
  linkText: { color: '#2f95dc', fontWeight: 'bold' },
});
