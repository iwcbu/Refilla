import { FontAwesome } from "@expo/vector-icons";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="station/[id]" 
        options={{ 
          headerShown: true, 
          title: "Station",
          headerBackTitle: "Back",
          }}
      />
    </Stack>
  );
}
