import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import PrefsContext, {DEFAULT_PREFS, type Prefs } from "../src/context/prefs";
import { useColors } from "../src/theme/colors";
import { LocationProvider } from "../src/context/userLocation";
import { NewMarkerLocProvider } from '../src/context/newMarkerLocation';

import "../src/db/database";

const STORAGE_KEY = 'prefs';

export default function RootLayout() {

  const c = useColors();
  
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw !== null) setPrefs({...DEFAULT_PREFS, ...JSON.parse(raw)});
    })();
  }, []);

  const setPref = async <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    
    // animate screen only when darkmode preference changes
    if (key == 'dark') {
      Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true}).start(() => {
        setPrefs((p) => {
          const next = { ...p, [key]: value};
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true}).start();
          return next;
        });
      });
      return;
    };

    
    setPrefs((p) => {
      const next = { ...p, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(next));
      return next;
    });
  };

  return (
    <LocationProvider>
      <NewMarkerLocProvider>
        <PrefsContext.Provider value={{ prefs, setPref }}>
          <Animated.View style={{ flex: 1, opacity: fade }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="station/[id]" 
                options={{ 
                  headerShown: true, 
                  headerStyle: { backgroundColor: c.card2 },
                  headerTintColor: c.text,
                  title: "Station",
                  headerBackTitle: "Back",
                }}
                />
              <Stack.Screen
                name="ticket/new"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: c.card2 },
                  headerTintColor: c.text,
                  title: "New Station",
                  headerBackTitle: "Back",
                }}
                />
              <Stack.Screen
                name="ticket/existing"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: c.card2 },
                  headerTintColor: c.text,
                  title: "Issue a Ticket",
                  headerBackTitle: "Back",
                }}
                />
            </Stack>
          </Animated.View>
        </PrefsContext.Provider>
      </NewMarkerLocProvider>
    </LocationProvider>
  );
}
