import { StyleSheet, View, Text, Pressable } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack, router } from "expo-router";;

import { useColors } from "../../src/theme/colors";
import { TabBarIcon } from "../(tabs)/_layout";

import { Station } from "../../types/station";


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

export default function StationDetail() {

  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const station: Station = {
    id: id ?? "unknown",
    lat: 42.3493,
    lng: -71.1002,
    buildingAbre: "TST",
    buildingName: "TESTSTATION",
    buildingDetails: "Test description, describes where to go",
    filterStatus: "GREEN",
    stationStatus: "PENDING",
    bottlesSaved: 300,
    lastUpdated: "Test",
  };

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
    <View style={[styles.screen, { backgroundColor: c.bg } ]}>
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text } ]}>Station Details</Text>
        <Text style={[styles.subtitle, { color: c.subtext } ]}>
          {station.buildingName} • {station.buildingAbre}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: c.card2 } ]}>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: c.subtext } ]}>Station ID</Text>
            <Text style={[styles.value, { color: c.text } ]}>#{station.id}</Text>
          </View>

          <View style={[styles.statPill, { backgroundColor: c.card2 } ]}>
            <Pressable 
              style={({ pressed }) => [
                pressed && styles.ticketPressed,
              ]}
              onPress={() => {
                router.push(`/ticket/existing`)
              }}>
                <View style={{ width: 30, height: 30, display: 'flex', justifyContent:'center', alignItems:'center' }}>
                  <TabBarIcon name="gear" color={ c.no == '#000000' ? '#969696' : c.no } />
                </View>
              </Pressable>
          </View>
        </View>


        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: (c.yes == '#00000') ? softBg(fColor) : c.card2, borderColor: fColor }]}>
            <Text style={[styles.badgeKey, { color: c.text } ]}>Filter</Text>
            <Text style={[styles.badgeVal, { color: fColor }]}>{station.filterStatus}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: (c.yes == '#00000') ? softBg(fColor) : c.card2, borderColor: sColor }]}>
            <Text style={[styles.badgeKey, { color: c.text } ]}>Status</Text>
            <Text style={[styles.badgeVal, { color: sColor }]}>{station.stationStatus}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text } ]}>Where to go</Text>
          <Text style={[styles.details, { color: c.text } ]}>
            <Text style={[styles.detailsStrong, { color: c.text } ]}>{station.buildingAbre}:</Text>{" "}
            {station.buildingDetails}
          </Text>
          <Text style={[styles.meta, { color: c.subtext } ]}>Last updated: {station.lastUpdated}</Text>
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
      </View>
    </View>
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
});
