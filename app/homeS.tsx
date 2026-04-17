import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const userIcon = require("../assets/usei.jpg");

type CardItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
};

const menuCards: CardItem[] = [
  {
    id: "1",
    title: "Build Outfit",
    subtitle: "Create new outfit combinations",
    icon: "👔",
    route: "/outfitBuilder",
    color: "#4CAF50",
  },
  {
    id: "2",
    title: "My Wardrobe",
    subtitle: "Manage your clothing items",
    icon: "👕",
    route: "/wardrobe",
    color: "#2196F3",
  },
  {
    id: "3",
    title: "Saved Outfits",
    subtitle: "View your outfit collection",
    icon: "👗",
    route: "/savedOutfits",
    color: "#9C27B0",
  },
  {
    id: "4",
    title: "Purchase Advice",
    subtitle: "Check compatibility before buying",
    icon: "🛍️",
    route: "/purchaseAdvice",
    color: "#FF9800",
  },
];

const CARD_WIDTH = screenWidth * 0.75;
const SPACING = 10;

export default function HomeScreen() {
  const router = useRouter();
  const [profileName, setProfileName] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem("profile");
      if (saved) {
        const profile = JSON.parse(saved);
        setProfileName(profile.name);
      }
    } catch (error) {
      console.log("Load error:", error);
    }
  };

  const renderCard = ({ item, index }: { item: CardItem; index: number }) => {
    const isActive = index === activeIndex;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: item.color },
          isActive && styles.activeCard,
        ]}
        onPress={() => router.push(item.route as any)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardIcon}>{item.icon}</Text>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <Text style={styles.cardHint}>Tap to open →</Text>
      </TouchableOpacity>
    );
  };

  const onScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + SPACING * 2));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Header with profile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{profileName || "Fashionista"}!</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/")}
        >
          <Image source={userIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Welcome message */}
      <Text style={styles.welcomeText}>What would you like to do today?</Text>

      {/* Sliding cards */}
      <FlatList
        data={menuCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {menuCards.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>

      <Text style={styles.swipeHint}>← Swipe to explore →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#888",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  profileButton: {
    padding: 5,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  welcomeText: {
    fontSize: 18,
    color: "#ccc",
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2 - SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: 350,
    borderRadius: 20,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  activeCard: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  cardIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 30,
  },
  cardHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#444",
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#4CAF50",
    width: 30,
  },
  swipeHint: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    fontSize: 14,
    color: "#666",
  },
});
