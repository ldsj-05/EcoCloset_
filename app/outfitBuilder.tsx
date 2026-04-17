import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://168.122.130.102:5000';

type ClothingItem = {
  _id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  color: string;
  imageUri?: string;
};

type Outfit = {
  _id: string;
  name: string;
  items: ClothingItem[];
  userId: string;
  createdAt: string;
};

const mockWardrobe: ClothingItem[] = [
  { _id: '1', name: 'White T-Shirt', category: 'tops', color: 'white' },
  { _id: '2', name: 'Blue Jeans', category: 'bottoms', color: 'blue' },
  { _id: '3', name: 'Black Sneakers', category: 'shoes', color: 'black' },
  { _id: '4', name: 'Leather Jacket', category: 'tops', color: 'black' },
  { _id: '5', name: 'Khaki Chinos', category: 'bottoms', color: 'beige' },
  { _id: '6', name: 'Running Shoes', category: 'shoes', color: 'white' },
  { _id: '7', name: 'Silver Watch', category: 'accessories', color: 'silver' },
  { _id: '8', name: 'Red Hoodie', category: 'tops', color: 'red' },
];

const categories: ClothingItem['category'][] = ['tops', 'bottoms', 'shoes', 'accessories'];

export default function OutfitBuilderScreen() {
  const router = useRouter();
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ClothingItem['category']>('tops');
  const [outfitName, setOutfitName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadWardrobe();
    loadUserId();
  }, []);

  const loadWardrobe = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/wardrobe/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWardrobe(data);
      } else {
        setWardrobe(mockWardrobe);
      }
    } catch (error) {
      setWardrobe(mockWardrobe);
    }
  };

  const loadUserId = async () => {
    try {
      const profile = await AsyncStorage.getItem('profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        setUserId(parsed._id || 'temp-user-id');
      }
    } catch (error) {
      setUserId('temp-user-id');
    }
  };

  const handleBack = () => {
    if (hasChanges && selectedItems.length > 0) {
      setShowExitModal(true);
    } else {
      router.back();
    }
  };

  const addItem = (item: ClothingItem) => {
    const isSelected = selectedItems.find((i) => i._id === item._id);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter((i) => i._id !== item._id));
    } else {
      const sameCategory = selectedItems.find((i) => i.category === item.category);
      if (sameCategory) {
        setSelectedItems([
          ...selectedItems.filter((i) => i.category !== item.category),
          item,
        ]);
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    }
    setHasChanges(true);
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i._id !== itemId));
    setHasChanges(true);
  };

  const resetBuilder = () => {
    setSelectedItems([]);
    setOutfitName('');
    setHasChanges(false);
    setIsSaving(false);
  };

  const saveOutfit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }
    if (!outfitName.trim()) {
      Alert.alert('Error', 'Please name your outfit');
      return;
    }

    setIsSaving(true);

    const outfitData = {
      name: outfitName.trim(),
      items: selectedItems.map(item => ({
        _id: item._id,
        name: item.name,
        category: item.category,
        color: item.color,
        imageUri: item.imageUri || null,
      })),
      userId: userId,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/outfits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outfitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save');
      }

      setShowSaveModal(false);
      resetBuilder();

      Alert.alert(
        'Success! 🎉',
        'Outfit saved!',
        [
          { text: 'View Outfits', onPress: () => router.push('/savedOutfits') },
          { text: 'Build Another', onPress: () => {} },
          { text: 'Home', onPress: () => router.push('/homeS') },
        ]
      );

    } catch (error) {
      console.error('Save failed:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const discardAndExit = () => {
    setShowExitModal(false);
    router.back();
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      tops: '👕', bottoms: '👖', shoes: '👟', accessories: '⌚',
    };
    return icons[category] || '👔';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Build Outfit</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Your Outfit</Text>
        <View style={styles.previewContainer}>
          {selectedItems.length === 0 ? (
            <Text style={styles.emptyText}>Tap items below to build your outfit</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedItems.map((item) => (
                <View key={item._id} style={styles.previewItem}>
                  <Text style={styles.previewEmoji}>{getCategoryIcon(item.category)}</Text>
                  <Text style={styles.previewName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item._id)}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <View style={styles.categoryTabs}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryTab, activeCategory === cat && styles.activeTab]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={styles.categoryEmoji}>{getCategoryIcon(cat)}</Text>
            <Text style={[styles.categoryText, activeCategory === cat && styles.activeText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>
          {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
        </Text>
        <View style={styles.itemsGrid}>
          {wardrobe
            .filter((item) => item.category === activeCategory)
            .map((item) => {
              const isSelected = selectedItems.find((i) => i._id === item._id);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.itemCard, isSelected && styles.selectedCard]}
                  onPress={() => addItem(item)}
                >
                  <Text style={styles.itemEmoji}>{getCategoryIcon(item.category)}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemColor}>{item.color}</Text>
                  {isSelected && <View style={styles.checkmark}><Text>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, selectedItems.length === 0 && styles.disabledButton]}
        onPress={() => setShowSaveModal(true)}
        disabled={selectedItems.length === 0}
      >
        <Text style={styles.saveButtonText}>
          {selectedItems.length > 0 
            ? `Save Outfit (${selectedItems.length})` 
            : 'Add items'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Outfit</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g., Casual Friday"
              placeholderTextColor="#666"
              value={outfitName}
              onChangeText={setOutfitName}
              autoFocus
              editable={!isSaving}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, isSaving && styles.disabled]}
                onPress={() => setShowSaveModal(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, isSaving && styles.disabled]}
                onPress={saveOutfit}
                disabled={isSaving}
              >
                <Text style={styles.confirmText}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showExitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unsaved Changes</Text>
            <Text style={styles.modalSubtitle}>Save your outfit first?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.discardButton]}
                onPress={discardAndExit}
              >
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowExitModal(false);
                  setShowSaveModal(true);
                }}
              >
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  previewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  previewContainer: {
    backgroundColor: '#252542',
    borderRadius: 15,
    padding: 15,
    minHeight: 100,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  previewItem: {
    backgroundColor: '#3d3d6b',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  previewEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  previewName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 70,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryTab: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#252542',
    minWidth: 70,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryText: {
    color: '#888',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  activeText: {
    color: '#fff',
    fontWeight: '600',
  },
  itemsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#252542',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#2d3b2d',
  },
  itemEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  itemColor: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#252542',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  nameInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  discardButton: {
    backgroundColor: '#ff4444',
  },
  discardText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});