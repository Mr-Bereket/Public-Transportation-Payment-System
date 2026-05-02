import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { TripsProvider } from '../contexts/TripsContext';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripsProvider>
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name='auth/login' />
          <Stack.Screen name='auth/signup' />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="trips/trip-details" />
          <Stack.Screen name="wallet/deposit" />
        </Stack>
      </TripsProvider>
    </AuthProvider>
  );
}

