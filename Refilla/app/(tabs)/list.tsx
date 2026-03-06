// app/(tabs)/list.tsx

import { StyleSheet, View, Text, FlatList, Pressable, LayoutAnimation, Animated, Easing, RefreshControl, ActivityIndicator} from "react-native";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";

import { usePrefs } from "../../src/context/prefs";
import { useColors } from "../../src/theme/colors";
import { timeAgo } from "../../hooks/timeAgo";
import { meterstoMiles, haversineMeters, roundTo } from "../../hooks/distanceFromUser";


import { TabBarIcon } from "./_layout";

import { useLiveLocation } from "../../src/context/userLocation";
import { useNewMarkerLoc } from "../../src/context/newMarkerLocation";

import { listStations, StationRow } from '../../src/db/stationsRepo';
import { Ionicons } from '@expo/vector-icons';

import ThemedBg from "../../components/ThemedBg";
import ThemedBg2 from "../../components/ThemedBg";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedText from "../../components/ThemedText";
import ThemedSubtext from "../../components/ThemedSubtext";

function filterColor(status: string) {
  if (status === "GREEN") return "#16a34a";
  if (status === "YELLOW") return "#f59e0b";
  return "#ef4444";
}


export default function ListTab() {

  // ================= user location =================
  const userLoc = useLiveLocation();
  const userLocation = userLoc.coords ?? { latitude: 0, longitude: 0 }
  
  // ================= stations =================
  const [stations, setStations] = useState<StationRow[]>(() => listStations());
  
  const activeStations = useMemo(() => { 
     const active = stations.filter((s) => s.stationStatus === "ACTIVE")
     
     const coords = userLoc?.coords
     if (!coords) return active;

     const { latitude: uLat, longitude: uLng } = coords;

     return [...active].sort((a, b) => {
      const aLat = Number(a.lat);
      const aLng = Number(a.lng);
      const bLat = Number(b.lat);
      const bLng = Number(b.lng);

      const distA = haversineMeters(
        { latitude: uLat, longitude: uLng },
        { latitude: aLat, longitude: aLng }
      );
      const distB = haversineMeters(
        { latitude: uLat, longitude: uLng },
        { latitude: bLat, longitude: bLng }
      );
      return distA - distB
    
    });
  },  [stations, userLoc.coords]);



  const [includeAll, setIncludeAll] = useState(false);

  const stationsDisplayed = useMemo(
    () => includeAll ? listStations() : activeStations
    , [includeAll, activeStations, stations]
  )


  // ================= refresh =================
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    const start = Date.now();

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setStations(listStations());
    } finally {
      const elapsed = Date.now() - start;
      const remaining = 1000 - elapsed;

      if (remaining > 0) {
        setTimeout(() => setRefreshing(false), remaining);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => handleRefresh(), [handleRefresh]));
  
  
  
  // ================= misc =================
  const c = useColors();
  const metric = usePrefs();
  const { setNewMarkerLoc } = useNewMarkerLoc();
  
  return (
    <ThemedBg style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.textBox}>
          {
          refreshing 
              ? (
              <View style={styles.titleBox}>
                <ThemedText style={styles.title}>Refilla</ThemedText>
                <ActivityIndicator size={"small"} />
              </View>
              
            ) : (
              <View style={styles.titleBox}>
                <ThemedText style={styles.title}>Refilla</ThemedText>
                <Pressable onPress={handleRefresh}>
                  <Ionicons name="refresh" size={20} color={c.text} />
                </Pressable>
              </View>
            )
          }

          <View style={{ display: "flex", flexDirection: "row" }}>
            {
            refreshing 
                ? (
                <ThemedSubtext style={styles.subtitle}>Refreshing...</ThemedSubtext>
              ) : (
                <ThemedSubtext style={styles.subtitle}>Stations nearby</ThemedSubtext>
              )
            }
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.ticket, pressed && styles.ticketPressed]}
          onPress={() => {
            setNewMarkerLoc({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            });
            router.push(`/ticket/new`);
          }}
        >
          <View style={styles.iconBox}>
            <TabBarIcon name="plus" color="white" />
          </View>
        </Pressable>
      </View>

      <ThemedBg2 style={styles.toggleWrap}>
        <Pressable onPress={() => setIncludeAll(false)}>
          <ThemedText style={{ color: !includeAll ? c.text : c.subtext }}>
            Active Stations
          </ThemedText>
          {!includeAll && <View style={{ height: 2, backgroundColor: c.text }} />}
        </Pressable>

        <Pressable onPress={() => setIncludeAll(true)}>
          <ThemedText style={{ color: includeAll ? c.text : c.subtext }}>
            All Stations
          </ThemedText>
          {includeAll && <View style={{ height: 2, backgroundColor: c.text }} />}
        </Pressable>
      </ThemedBg2>

      <FlatList
        data={stationsDisplayed}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const fc = filterColor(item.filterStatus);

          return (
            <Pressable
              onPress={() => {
                router.push(`/station/${item.id}`);
              }}
              style={({ pressed }) => [pressed && styles.cardPressed]}
            >
              <ThemedCard2 style={styles.card}>
                <View style={styles.cardTop}>
                  <ThemedText style={styles.abbrev}>{item.buildingAbre}</ThemedText>

                  <View style={[styles.badge, { borderColor: "white", backgroundColor: fc }]}>
                    <Text style={[styles.badgeText, { color: "white" }]}>{item.filterStatus}</Text>
                  </View>
                </View>

                <ThemedSubtext style={styles.buildingName}>
                  {item.buildingName}
                </ThemedSubtext>

                <ThemedSubtext style={styles.buildingName}>
                  {metric.prefs.metric
                    ? roundTo(
                        haversineMeters(
                          { latitude: item.lat, longitude: item.lng },
                          {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                          }
                        ) / 1000,
                        2
                      ) + " km"
                    : roundTo(
                        meterstoMiles(
                          haversineMeters(
                            { latitude: item.lat, longitude: item.lng },
                            {
                              latitude: userLocation.latitude,
                              longitude: userLocation.longitude,
                            }
                          )
                        ),
                        2
                      ) + " mi"}
                </ThemedSubtext>

                <View style={[styles.footer, { borderColor: c.border }]}>
                  <ThemedSubtext style={styles.meta}>
                    Updated: {timeAgo(item.updated_at)}
                  </ThemedSubtext>
                </View>
              </ThemedCard2>
            </Pressable>
          );
        }}
      />
    </ThemedBg>
  );
}

const styles = StyleSheet.create({
  
  screen: { flex: 1, padding: 16, },
  
  // header 
  header: { flexDirection: "row" },
  textBox: { marginTop: 4, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800" },
  titleBox: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6 },
  subtitle: { marginTop: 4, fontSize: 14 },

  toggleWrap: { flexDirection: "row", gap: 10, marginTop: 5, marginBottom: 20 },

  // new ticket button
  iconBox: {
    width: 30,
    height: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  ticket: {
    marginLeft: "auto",
    marginRight: 20,
    alignSelf: "center",

    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },

    borderRadius: 140,
    padding: 12,
    backgroundColor: "#77a0ff",
  },

  ticketPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // list 
  grid: { paddingTop: 6, paddingBottom: 24, alignSelf: "center" },
  row: { gap: 12 },

  
  // station card
  card: {
    width: 165,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    gap: 6,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  abbrev: { fontSize: 18, fontWeight: "900", letterSpacing: 0.3 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeText: { fontSize: 12, fontWeight: "800" },
  buildingName: { fontSize: 13, marginTop: 2 },
  meta: { fontSize: 12 },

  footer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },

  footerLabel: { fontSize: 11, fontWeight: "700" },
  footerValue: { fontSize: 14, fontWeight: "900" },

});