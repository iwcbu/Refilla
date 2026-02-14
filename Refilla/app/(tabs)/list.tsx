import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import { useMemo, useState } from "react";
import { router } from "expo-router";

import { usePrefs } from "../../src/context/prefs";
import { useColors } from "../../src/theme/colors";
import { timeAgo } from "../../hooks/timeAgo";
import { meterstoMiles, haversineMeters, roundTo } from "../../hooks/distanceFromUser";


import { TabBarIcon } from "./_layout";

import type { Station } from "../../types/station";
import { Coords } from "../../types/location";
import { useLiveLocation } from "../../src/context/userLocation";
import { useNewMarkerLoc } from "../../src/context/newMarkerLocation";

function filterColor(status: string) {
  if (status === "GREEN") return "#16a34a";
  if (status === "YELLOW") return "#f59e0b";
  return "#ef4444";
}


export default function MapTab() {

  const userLoc = useLiveLocation();
  if (userLoc.coords === null) {
    userLoc.coords = { latitude: 0, longitude: 0}
  } 
  const userLocation = userLoc.coords
 
  const c = useColors();
  const metric = usePrefs();
  const { setNewMarkerLoc } = useNewMarkerLoc();

  const [stations] = useState<Station[]>([
    {
      id: "1",
      lat: 42.3505,
      lng: -71.1054,
      buildingAbre: "GSU",
      buildingName: "George Sherman Union",
      buildingDetails: "1st floor, middle of cafe",
      filterStatus: "GREEN",
      stationStatus: "ACTIVE",
      bottlesSaved: 1280,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "2",
      lat: 42.3493,
      lng: -71.1002,
      buildingAbre: "CAS",
      buildingName: "College of Arts and Science",
      buildingDetails: "Basement hallway near bathrooms",
      filterStatus: "YELLOW",
      stationStatus: "ACTIVE",
      bottlesSaved: 30000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "3",
      lat: 42.3241,
      lng: -71.105,
      buildingAbre: "CDS",
      buildingName: "College of Data and Computer Sciences",
      buildingDetails: "Basement hallway near bathrooms",
      filterStatus: "RED",
      stationStatus: "ACTIVE",
      bottlesSaved: 50000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "4",
      lat: 42.4533,
      lng: -71.1052,
      buildingAbre: "CDS",
      buildingName: "College of Data and Computer Sciences",
      buildingDetails: "Basement hallway near bathrooms",
      filterStatus: "GREEN",
      stationStatus: "ACTIVE",
      bottlesSaved: 10000,
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const activeStations = useMemo(
    () => stations.filter((s) => s.stationStatus === "ACTIVE"),
    [stations]
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>

      <View style={styles.header}>

        <View style={styles.textBox}>
          <Text style={[styles.title, { color: c.text }]}>Refilla</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>Stations nearby (demo)</Text>
        </View>

        <Pressable style={({ pressed }) => [
                styles.ticket,
                pressed && styles.ticketPressed,
              ]}
          onPress={() => {
            setNewMarkerLoc({ latitude: userLocation.latitude, longitude: userLocation.longitude })
            router.push(`/ticket/new`)
          }}>
            <View style={{ width: 30, height: 30, display: 'flex', justifyContent:'center', alignItems:'center' }}>
              <TabBarIcon name="plus" color="white" />
            </View>
        </Pressable>
      </View>

      <FlatList
        data={activeStations}
        numColumns={2}
        keyExtractor={(item) => item.id}
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
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.card2, borderColor: c.border2 },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.abbrev, { color: c.text }]}>{item.buildingAbre}</Text>

                <View style={[styles.badge, { borderColor: 'white', backgroundColor: fc }]}>
                  <Text style={[styles.badgeText, { color: 'white' }]}>
                    {item.filterStatus}
                  </Text>
                </View>
              </View>

              <Text style={[styles.buildingName, { color: c.subtext }]}>
                {item.buildingName}
              </Text>
              <Text style={[styles.buildingName, { color: c.subtext }]}>

                {/* this is a disgusting one liner I'm sorry to who is reading this */}
                {metric.prefs.metric 
                  ? roundTo((haversineMeters( {latitude: item.lat, longitude: item.lng}, { latitude: userLocation.latitude, longitude: userLocation.longitude })) / 100, 2) + " km"
                  : roundTo(meterstoMiles(haversineMeters( {latitude: item.lat, longitude: item.lng}, { latitude: userLocation.latitude, longitude: userLocation.longitude })), 2) + " mi" }
              </Text>

              <View style={[styles.footer, { borderColor: c.border }]}>
                <Text style={[styles.meta, { color: c.subtext }]}>
                    Updated: {timeAgo(item.lastUpdated)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f6f7fb",
  },

  header: {
    flexDirection: "row",
  },

  textBox: {
    marginTop: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  ticket: {
    marginLeft: "auto",
    marginRight: 20,
    alignSelf: "center",

    shadowOpacity: .2,
    shadowOffset: {width: 1, height: 1 },
    
    borderRadius: 140,
    padding: 12,
    backgroundColor: "#77a0ff"

  },
  ticketPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  grid: {
    paddingTop: 6,
    paddingBottom: 24,
    alignSelf: "center",
  },
  row: {
    gap: 12,
  },

  card: {
    width: 165,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  abbrev: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: 0.3,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  buildingName: {
    fontSize: 13,
    color: "#334155",
    marginTop: 2,
  },

  meta: {
    fontSize: 12,
    color: "#64748b",
  },

  footer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d9dce0",
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  footerLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
  },
  footerValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "900",
  },
});
