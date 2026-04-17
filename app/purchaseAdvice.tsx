import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
type WardrobeItem = {
  _id: string;
  name: string;
  category: "tops" | "bottoms" | "shoes" | "accessories";
  color: string;
  brand?: string;
};
const categories = [
  { key: "tops", label: "👕 Tops" },
  { key: "bottoms", label: "👖 Bottoms" },
  { key: "shoes", label: "👟 Shoes" },
  { key: "accessories", label: "⌚ Accessories" },
] as const;

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

export default function PurchaseAdviceScreen() {
  const router = useRouter();

  const [itemName, setItemName] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState<
    "tops" | "bottoms" | "shoes" | "accessories"
  >("tops");
  const [result, setResult] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const getPurchaseAdvice = async () => {
    try {
      const saved = await AsyncStorage.getItem("wardrobeItems");
      console.log("saved wardrobe raw:", saved);
      const wardrobe: WardrobeItem[] = saved ? JSON.parse(saved) : [];

      if (!itemName || !color || !category) {
        Alert.alert(
          "Validation Error",
          "Please fill item name, color, and category.",
        );
        return;
      }

      if (!wardrobe || wardrobe.length === 0) {
        setMatchCount(0);
        setResult("Insufficient Data: upload your current wardrobe first.");
        return;
      }

      let matches = 0;

      wardrobe.forEach((item) => {
        let score = 0;

        if (item.color && item.color.toLowerCase() === color.toLowerCase()) {
          score += 1;
        }

        if (item.category === category) {
          score += 2;
        }

        if (score >= 2) {
          matches += 1;
        }
      });

      setMatchCount(matches);

      if (matches >= 5) {
        setResult(`Highly Recommended: matches ${matches} existing items.`);
      } else if (matches >= 2) {
        setResult(`Moderately Recommended: matches ${matches} existing items.`);
      } else {
        setResult(
          `Low Compatibility Warning: matches only ${matches} existing items and may lead to waste or returns.`,
        );
      }
    } catch (error) {
      console.log("Purchase advice error:", error);
      Alert.alert("Error", "Could not calculate purchase advice.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Purchase Advice</Text>
      <Text style={styles.subtitle}>
        Enter a potential item and see how well it fits your current wardrobe.
      </Text>

      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        placeholderTextColor="#555"
        value={itemName}
        onChangeText={setItemName}
      />

      <Text style={styles.label}>Color</Text>
      <View style={styles.optionRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorButton,
              { backgroundColor: c },
              color === c && styles.selectedColor,
            ]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>
      <Text style={styles.selectedText}>Selected color: {color}</Text>

      <Text style={styles.label}>Category</Text>
      <View style={styles.optionRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.optionButton,
              category === cat.key && styles.selectedOption,
            ]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={styles.optionText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={getPurchaseAdvice}>
        <Text style={styles.buttonText}>Get Purchase Advice</Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Recommendation</Text>
          <Text style={styles.resultText}>{result}</Text>
          <Text style={styles.resultText}>
            Compatible matches found: {matchCount}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/homeS")}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 40,
    marginBottom: 8,
    color: "#111",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  optionButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  selectedOption: {
    borderColor: "#111",
    backgroundColor: "#eaeaea",
  },

  optionText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },

  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },

  selectedColor: {
    borderColor: "#111",
  },

  selectedText: {
    fontSize: 14,
    color: "#333",
    marginTop: -4,
    marginBottom: 10,
  },
});
