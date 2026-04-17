import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ClothingItem = {
  _id: string;
  name: string;
  category: "tops" | "bottoms" | "shoes" | "accessories";
  color: string;
  brand?: string;
};

const mockWardrobe: ClothingItem[] = [
  {
    _id: "1",
    name: "White T-Shirt",
    category: "tops",
    color: "white",
    brand: "Uniqlo",
  },
  {
    _id: "2",
    name: "Blue Jeans",
    category: "bottoms",
    color: "blue",
    brand: "Levi's",
  },
  {
    _id: "3",
    name: "Black Sneakers",
    category: "shoes",
    color: "black",
    brand: "Nike",
  },
  {
    _id: "4",
    name: "Leather Jacket",
    category: "tops",
    color: "black",
    brand: "Zara",
  },
  {
    _id: "5",
    name: "Khaki Chinos",
    category: "bottoms",
    color: "beige",
    brand: "Gap",
  },
];

const categories: ClothingItem["category"][] = [
  "tops",
  "bottoms",
  "shoes",
  "accessories",
];
const colors = [
  "white",
  "black",
  "blue",
  "red",
  "green",
  "beige",
  "gray",
  "navy",
];

export default function WardrobeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({
    category: "tops",
    color: "white",
  });

  useEffect(() => {
    loadWardrobe();
  }, []);

  const loadWardrobe = async () => {
    try {
      const saved = await AsyncStorage.getItem("wardrobeItems");

      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(mockWardrobe);
        await AsyncStorage.setItem(
          "wardrobeItems",
          JSON.stringify(mockWardrobe),
        );
      }
    } catch (error) {
      console.log("Load wardrobe error:", error);
      setItems(mockWardrobe);
    }
  };

  // TODO: API call to save
  const addItem = async () => {
    console.log("addItem clicked");
    console.log("newItem before validation:", newItem);

    if (!newItem.name || !newItem.brand) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const item: ClothingItem = {
      _id: Date.now().toString(),
      name: newItem.name!,
      category: newItem.category!,
      color: newItem.color!,
      brand: newItem.brand!,
    };

    try {
      const updatedItems = [...items, item];
      setItems(updatedItems);
      await AsyncStorage.setItem("wardrobeItems", JSON.stringify(updatedItems));
      console.log("saved updated wardrobe:", updatedItems);

      setShowAddModal(false);
      setNewItem({ category: "tops", color: "white" });
    } catch (error) {
      console.log("Save wardrobe error:", error);
      Alert.alert("Error", "Could not save item.");
    }
  };

  const deleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedItems = items.filter((i) => i._id !== id);
            setItems(updatedItems);
            await AsyncStorage.setItem(
              "wardrobeItems",
              JSON.stringify(updatedItems),
            );
          } catch (error) {
            console.log("Delete wardrobe error:", error);
            Alert.alert("Error", "Could not delete item.");
          }
        },
      },
    ]);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      tops: "👕",
      bottoms: "👖",
      shoes: "👟",
      accessories: "⌚",
    };
    return icons[category] || "👔";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Wardrobe</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>{items.length} items</Text>
        <Text style={styles.statText}>
          {items.filter((i) => i.category === "tops").length} tops,{" "}
          {items.filter((i) => i.category === "bottoms").length} bottoms
        </Text>
      </View>

      {/* Items List */}
      <ScrollView style={styles.list}>
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;

          return (
            <View key={cat} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {getCategoryIcon(cat)} {cat}
              </Text>
              {catItems.map((item) => (
                <View key={item._id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.brand} • {item.color}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteItem(item._id)}>
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Blue Oxford Shirt"
              placeholderTextColor="#666"
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            />

            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ralph Lauren"
              placeholderTextColor="#666"
              onChangeText={(text) => setNewItem({ ...newItem, brand: text })}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.optionRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionButton,
                    newItem.category === cat && styles.selectedOption,
                  ]}
                  onPress={() => setNewItem({ ...newItem, category: cat })}
                >
                  <Text>{getCategoryIcon(cat)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Color</Text>
            <View style={styles.optionRow}>
              {colors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorButton,
                    { backgroundColor: c },
                    newItem.color === c && styles.selectedColor,
                  ]}
                  onPress={() => setNewItem({ ...newItem, color: c })}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelBtn]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveBtn]}
                onPress={addItem}
              >
                <Text style={styles.btnText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backArrow: { fontSize: 28, color: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  addButton: { fontSize: 32, color: "#4CAF50" },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  statText: { color: "#888", fontSize: 14 },
  list: { flex: 1, paddingHorizontal: 20 },
  categorySection: { marginBottom: 20 },
  categoryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: "#252542",
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemInfo: { flex: 1 },
  itemName: { color: "#fff", fontSize: 16, fontWeight: "500" },
  itemDetails: { color: "#888", fontSize: 12, marginTop: 4 },
  deleteText: { fontSize: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#252542",
    borderRadius: 20,
    padding: 25,
    width: "100%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: { color: "#888", marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
  },
  optionRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optionButton: {
    backgroundColor: "#1a1a2e",
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: { borderColor: "#4CAF50" },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedColor: { borderColor: "#4CAF50" },
  modalButtons: { flexDirection: "row", gap: 15, marginTop: 25 },
  modalButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center" },
  cancelBtn: { backgroundColor: "#333" },
  saveBtn: { backgroundColor: "#4CAF50" },
  btnText: { color: "#fff", fontWeight: "600" },
});
