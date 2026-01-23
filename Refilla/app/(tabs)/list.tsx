import { useMemo, useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import type { Station } from "../../types/station";

function filterColor(status: string) {
  if (status === "GREEN") return "#16a34a";
  if (status === "YELLOW") return "#f59e0b";
  return "#ef4444";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) {
    if (minutes < 3) return "Just now";
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function MapTab() {
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
      bottlesSaved: 30000,
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
      bottlesSaved: 30000,
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const activeStations = useMemo(
    () => stations.filter((s) => s.stationStatus === "ACTIVE"),
    [stations]
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Refilla</Text>
        <Text style={styles.subtitle}>Stations nearby (demo)</Text>
      </View>

      <FlatList
        data={activeStations}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const c = filterColor(item.filterStatus);

          return (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: `/station/${item.id}`,
                  params: { id: item.id },
                });
              }}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.abbrev}>{item.buildingAbre}</Text>

                {/* small badge */}
                <View style={[styles.badge, { borderColor: c }]}>
                  <Text style={[styles.badgeText, { color: c }]}>
                    {item.filterStatus}
                  </Text>
                </View>
              </View>

              <Text style={styles.buildingName} numberOfLines={1}>
                {item.buildingName}
              </Text>

              <Text style={styles.meta}>SID: #{item.id}</Text>

              <Text style={styles.meta}>
                Updated: {timeAgo(item.lastUpdated)}
              </Text>

              <View style={styles.footer}>
                <Text style={styles.footerLabel}>Bottles</Text>
                <Text style={styles.footerValue}>{item.bottlesSaved}</Text>
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

  grid: {
    paddingTop: 6,
    paddingBottom: 24,
    alignSelf: "center", // centers the whole grid nicely
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
    borderTopColor: "#eef2f7",
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
