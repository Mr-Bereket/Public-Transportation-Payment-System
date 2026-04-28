import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BuyTicket() {
  const [searchQuery, setSearchQuery] = useState('');

  const allRoutes = [
    { id: '1', name: 'Downtown Express', price: 25.00, type: 'Bus' },
    { id: '2', name: 'Airport Link', price: 60.00, type: 'Train' },
    { id: '3', name: 'Suburban Circle', price: 15.00, type: 'Bus' },
    { id: '4', name: 'University Shuttle', price: 10.00, type: 'Bus' },
  ];

  // Logic to filter the list based on search input
  const filteredRoutes = allRoutes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Where to?</Text>

      {/* Search Input Field */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stations or lines..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No routes found.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.routeCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.type === 'Bus' ? 'bus' : 'train'} size={24} color="#2f95dc" />
            </View>
            <View style={styles.info}>
              <Text style={styles.routeName}>{item.name}</Text>
              <Text style={styles.routeType}>{item.type}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Pressable style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Quick Purchase</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    height: 50,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },

  routeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
  },
  iconContainer: { backgroundColor: '#e1f0ff', padding: 10, borderRadius: 12, marginRight: 15 },
  info: { flex: 1 },
  routeName: { fontSize: 16, fontWeight: 'bold' },
  routeType: { color: '#888', fontSize: 13 },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', marginRight: 10, color: '#2f95dc' },

  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },

  footer: { paddingVertical: 20 },
  buyBtn: { backgroundColor: '#2f95dc', padding: 18, borderRadius: 15, alignItems: 'center' },
  buyBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

