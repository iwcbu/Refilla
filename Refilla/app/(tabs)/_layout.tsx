// app/(tabs)/_layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from "expo-router";

import { useAdminAuth } from '../../src/context/adminAuth';
import { useColors } from '../../src/theme/colors';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
export function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

export default function TabsLayout() {
  const c = useColors();
  const { isAdminSignedIn } = useAdminAuth();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.card2 },
        headerTitleStyle: { color: c.text },
        headerTintColor: c.text,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#2a80ea",
        tabBarInactiveTintColor: c.subtext , // "#8899a1"

        tabBarStyle: { height: 72, paddingVertical: 10, backgroundColor: c.card2 },
        tabBarItemStyle: { marginHorizontal: 12, borderRadius: 16 },
      }}
    >
      
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Map", 
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} /> 
        }} 
      />

      <Tabs.Screen 
        name="list" 
        options={{ 
          title: "List", 
          tabBarIcon: ({ color }) => <TabBarIcon name="list-ul" color={color} /> 
        }} 
      />

      <Tabs.Screen 
        name="account" 
        options={{ 
          title: "Profile", 
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> 
        }} 
      />

      <Tabs.Screen 
        name="adminView" 
        options={{ 
          title: "Admin", 
          href: isAdminSignedIn ? "/adminView" : null,
          tabBarIcon: ({ color }) => <TabBarIcon name="hdd-o" color={color} /> 
        }} 
      />
      
    
    </Tabs>
  );
}
