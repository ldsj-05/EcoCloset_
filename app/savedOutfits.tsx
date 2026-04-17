import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Outfit = {
  _id: string;
  name: string;
  items: any[];
  createdAt: string;
};

export default function SavedOutfitsScreen() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedOutfits');
      if (saved) {
        setOutfits(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Load error:', error);
    }
  };

  const deleteOutfit = async (id: string) => {
    Alert.alert('Delete Outfit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = outfits.filter((o) => o._id !== id);
          setOutfits(updated);
          await AsyncStorage.setItem('savedOutfits', JSON.stringify(updated));
        },
      },
    ]);
  };

  const getItemEmoji = (category: string) => {
    const icons: Record<string, string> = {
      tops: '👕', bottoms: '👖', shoes: '👟', accessories: '⌚',
    };
    return icons[category] || '👔';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Outfits</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Outfits List */}
      <ScrollView style={styles.list}>
        {outfits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👔</Text>
            <Text style={styles.emptyTitle}>No outfits yet</Text>
            <Text style={styles.emptyText}>Build your first outfit from the home screen!</Text>
            <TouchableOpacity
              style={styles.buildButton}
              onPress={() => router.push('//outfitBuilder')}
            >
              <Text style={styles.buildButtonText}>Build Outfit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          outfits.map((outfit) => (
            <View key={outfit._id} style={styles.outfitCard}>
              <View style={styles.outfitHeader}>
                <Text style={styles.outfitName}>{outfit.name}</Text>
                <TouchableOpacity onPress={() => deleteOutfit(outfit._id)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemsRow}>
                {outfit.items.map((item) => (
                  <View key={item._id} style={styles.itemBadge}>
                    <Text style={styles.badgeEmoji}>{getItemEmoji(item.category)}</Text>
                    <Text style={styles.badgeText}>{item.name}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.dateText}>
                Created {new Date(outfit.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Build New Button */}
      {outfits.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('//outfitBuilder')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backArrow: { fontSize: 28, color: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  placeholder: { width: 28 },
  list: { flex: 1, paddingHorizontal: 20 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyEmoji: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  buildButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buildButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  outfitCard: {
    backgroundColor: '#252542',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  outfitName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deleteText: { fontSize: 20 },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  itemBadge: {
    backgroundColor: '#3d3d6b',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeEmoji: { fontSize: 16 },
  badgeText: { color: '#fff', fontSize: 12 },
  dateText: { color: '#666', fontSize: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300' },
});