// app/station/preview.tsx

import { ActivityIndicator, StyleSheet, View, Text, Pressable } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack, router } from "expo-router";;

import { useColors } from "../src/theme/colors";
import { TabBarIcon } from "../app/(tabs)/_layout";

import { StationRow } from "../src/db/stationsRepo";

import ThemedBg from "./ThemedBg";
import ThemedText from "./ThemedText";
import ThemedSubtext from "./ThemedSubtext";
import ThemedCard from "./ThemedCard";
import ThemedCard2 from "./ThemedCard2";

function filterColor(status: string) {
  if (status === "GREEN") return "#16a34a";
  if (status === "YELLOW") return "#f59e0b";
  return "#ef4444";
}

function statusColor(status: string) {
  if (status === "ACTIVE") return "#16a34a";
  if (status === "PENDING") return "#f59e0b";
  return "#ef4444";
}

function softBg(hex: string) {
  if (hex === "#16a34a") return "#dcfce7";
  if (hex === "#f59e0b") return "#fffbeb";
  return "#fee2e2";
}


type SpProps = {
    station: StationRow | null;
}

export default function StationPreview( { station }: SpProps) {

  // ================= station =================

  if (station === null) {
    return (
      <View style={styles.fetchingBox}>
          <Text style={styles.fetchingText}>Fetching, one moment...</Text>
          <ActivityIndicator size='large' />
      </View>
    )
  }

  // ================= misc =================
  const c = useColors();
  const fColor = filterColor(station.filterStatus);
  const sColor = statusColor(station.stationStatus);

  return (
    <>
      <Stack.Screen
            options={{ 
              headerShown: true, 
              headerStyle: { backgroundColor: c.card2 },
              headerTintColor: c.text,
              title: "Station",
              headerBackTitle: "Back",
            }}
      />
    <ThemedBg style={styles.screen}>
      
      <View style={styles.header}>
        <ThemedText style={styles.title}>Station Details</ThemedText>
        <ThemedSubtext style={styles.subtitle}>
          {station.buildingName} • {station.buildingAbre}
        </ThemedSubtext>
      </View>

      <ThemedCard style={[styles.card, { backgroundColor: c.card2 } ]}>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.label}>Station ID</ThemedText>
            <ThemedText style={styles.value}>#{station.id}</ThemedText>
          </View>

          <ThemedCard2 style={styles.statPill}>
            <Pressable 
              style={({ pressed }) => [
                pressed && styles.ticketPressed,
              ]}
              >
                <View style={styles.gearIcon}>
                  <TabBarIcon name="gear" color={ c.no == '#000000' ? '#969696' : c.no } />
                </View>
              </Pressable>
          </ThemedCard2>
        </View>


        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: (c.yes == '#00000') ? softBg(fColor) : c.card2, borderColor: fColor }]}>
            <ThemedText style={styles.badgeKey}>Filter</ThemedText>
            <ThemedText style={styles.badgeVal}>{station.filterStatus}</ThemedText>
          </View>

          <View style={[styles.badge, { backgroundColor: (c.yes == '#00000') ? softBg(fColor) : c.card2, borderColor: sColor }]}>
            <ThemedText style={styles.badgeKey}>Status</ThemedText>
            <ThemedText style={styles.badgeVal}>{station.stationStatus}</ThemedText>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Where to go</ThemedText>
          <ThemedText style={[styles.details, { color: c.text } ]}>
            <ThemedText style={[styles.detailsStrong, { color: c.text } ]}>{station.buildingAbre}:</ThemedText>{" "}
            {station.buildingDetails}
          </ThemedText>
          <ThemedText style={[styles.meta, { color: c.subtext } ]}>Last updated: {station.updated_at}</ThemedText>
        </View>


        <View style={styles.mapWrap}>
            <MapView
                style={styles.map}
                initialRegion={{
                  latitude: Number(station.lat),
                  longitude: Number(station.lng),
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                >
                <Marker
                    key={station.id}
                    coordinate={{
                      latitude: Number(station.lat),
                      longitude: Number(station.lng),
                    }}
                    
                    />
            </MapView>
        
        </View>
      </ThemedCard>
    </ThemedBg>
  </>
  );
}



// ===================================
//
//              STYLING
//
// ===================================


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f6f7fb",
  },

  header: {
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  label: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  statPill: {
    padding: 3,
    borderRadius: 14,
    alignItems: "flex-end",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  badge: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  badgeKey: {
    fontSize: 11,
    color: "#475569",
  },
  badgeVal: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
  },

  section: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  detailsStrong: {
    fontWeight: "800",
    color: "#0f172a",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#94a3b8",
  },

  mapWrap: {
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  map: {
    width: "100%",
    height: 220,
    alignSelf: "center",
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
  fetchingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    transform: [{ translateY: -40 }],

  },
  fetchingText: {
    fontSize: 16,
    opacity: 0.8,
  },
  gearIcon: { 
    width: 30, 
    height: 30, 

    display: 'flex', 
    justifyContent:'center', 
    alignItems:'center' 
  }
});
