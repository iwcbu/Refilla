
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from "expo-router";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ }} {...props} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#2a80ea",
        tabBarInactiveTintColor: "#8899a1",

        tabBarStyle: { height: 72, paddingVertical: 10 },
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
        name="settings" 
        options={{ 
          title: "Settings", 
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} /> 
        }} 
      />

    </Tabs>
  );
}
