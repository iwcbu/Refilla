
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from "expo-router";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Map" }} />
      <Tabs.Screen name="add" options={{ title: "List" }} />
      
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: "Settings", 
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} /> 
        }} 
      />

    </Tabs>
  );
}
