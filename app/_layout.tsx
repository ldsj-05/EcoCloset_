import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="homeS" options={{ headerShown: false }} />
      <Stack.Screen name="outfitBuilder" options={{ headerShown: false }} />
      <Stack.Screen name="wardrobe" options={{ headerShown: false }} />
      <Stack.Screen name="savedOutfits" options={{ headerShown: false }} />
      <Stack.Screen name="purchaseAdvice" options={{ headerShown: false }} />
    </Stack>
  );
}
