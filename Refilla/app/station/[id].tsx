// app/station/[id].tsx

import { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Pressable, ScrollView, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack, router } from "expo-router";;

import { useColors } from "../../src/theme/colors";
import { useAuth } from "../../src/context/auth";

import { TabBarIcon } from "../(tabs)/_layout";
import { Ionicons } from '@expo/vector-icons';

import { getStation } from "../../src/db/stationsRepo";


import { canUserAccessStation } from '../../src/features/account/organizationService';
import { getOrg } from '../../src/db/organizationRepo';
import {
  isFavoriteStation,
  toggleFavoriteStation,
} from '../../src/db/favoriteStationsRepo';

import ThemedCard2 from "../../components/ThemedCard2";
import ThemedBg from "../../components/ThemedBg";
import ThemedText from "../../components/ThemedText";
import ThemedSubtext from "../../components/ThemedSubtext";

function filterColor(status: string) {
  if (status === "GREEN") return "#16a34a";
  if (status === "YELLOW") return "#f59e0b";
  if (status === "RED") return "#ef4444";
  return "#00000041";
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
  const { currentUser } = useAuth();

  // ================= station =================
  const { id } = useLocalSearchParams<{ id: string }>();
  const station = getStation(Number(id));
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
  const organization = station.organization_id ? getOrg(station.organization_id) : null;
  const fColor = filterColor(station.filterStatus);
  const sColor = statusColor(station.stationStatus);
  const canAccess = canUserAccessStation(station, currentUser?.id);
  const [isFavorite, setIsFavorite] = useState(currentUser ? isFavoriteStation(currentUser.id, station.id) : false);

  if (!canAccess) {
    return (
      <ThemedBg style={[styles.screen, styles.accessDeniedWrap]}>
        <ThemedCard2 style={styles.accessDeniedCard}>
          <ThemedText style={styles.title}>Organization-only fountain</ThemedText>
          <ThemedSubtext style={styles.subtitle}>
            This fountain is only available to members of {organization?.name ?? "the linked organization"}.
          </ThemedSubtext>
          <Pressable onPress={() => router.replace("/account/profile")} style={styles.joinOrgButton}>
            <ThemedText style={styles.joinOrgButtonText}>Manage organizations</ThemedText>
          </Pressable>
        </ThemedCard2>
      </ThemedBg>
    );
  }

  const handleDirections = (station: any) => {

    const lat = station.lat;
    const lng = station.lng;

    if (Platform.OS === 'ios') {
      router.push(`http://maps.apple.com/?daddr=${lat},${lng}`);
    } else {
      router.push(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  }
  
  const handleAddToFavs = (stationId: number) => {
    if (!currentUser) {
      Alert.alert("Profile required", "Please choose a profile from the Profile tab to save favorites.");
      router.push("/account/login/login");
      return;
    }

    setIsFavorite(!isFavorite);
    const newIsFavorite = toggleFavoriteStation(currentUser.id, stationId);
  
  }

  useEffect(() => {
    setIsFavorite(currentUser ? isFavoriteStation(currentUser.id, station.id) : false)
  }, [isFavorite]);

  return (
    <>
      <Stack.Screen
            options={{ 
              headerShown: true, 
              headerStyle: { backgroundColor: c.card2 },
              headerTintColor: c.text,
              title: 'Station Details',
              headerBackTitle: "Back",
            }}
      />
    <ThemedBg style={[styles.screen, { backgroundColor: c.bg } ]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{station.buildingName} • {station.buildingAbre} </ThemedText>
        <ThemedSubtext style={[styles.subtitle, { fontWeight: 'bold' }]}>
          {organization?.name ?? "Available to all users"}
        </ThemedSubtext>
      </View>

      <ThemedCard2 style={[styles.card, { backgroundColor: c.card2 } ]}>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.label}>Station ID</ThemedText>
            <ThemedText style={styles.value}>#{station.id}</ThemedText>
          </View>

          <ThemedCard2 style={styles.statPill}>
            <Pressable
            onPress={() => {
              Alert.alert('Station Details', 'This pages shows detailed information about the station, including its status, filter condition, and location. You can also get directions to the station or add the station to your favorites. \
                \n \n Filters condition guide: \nGreen: Good \n Yellow: Replace Soon \n Red: Replace Now \n NA: Not Applicable \
                \n \n If you have any issues with this station, please report it by tapping the "Report an Issue" button at the bottom of the page. Your feedback helps us maintain the quality of your water bottle filling experience!');
            }}
              style={({ pressed }) => [
                pressed && styles.ticketPressed,
              ]}
              >
                <Ionicons name="information-circle-outline" size={24} color={c.subtext} style={{ marginLeft:'auto' }} />
              </Pressable>
          </ThemedCard2>
        </View>


        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: (c.yes == '#00000') ? softBg(fColor) : c.card2, borderColor: fColor == "#00000041" ? c.subtext : fColor }]}>
            <ThemedText style={styles.badgeKey}>Filter</ThemedText>
            <Text style={[styles.badgeVal, { color: fColor == "#00000041" ? c.subtext : fColor }]}>{station.filterStatus}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: (c.yes == '#00000') ? softBg(fColor) : c.card2, borderColor: sColor }]}>
            <ThemedText style={styles.badgeKey}>Status</ThemedText>
            <Text style={[styles.badgeVal, { color: sColor }]}>{station.stationStatus}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Where to go</ThemedText>
          <ThemedText style={styles.details}>
            <ThemedText style={styles.detailsStrong}>{station.buildingAbre}:</ThemedText>{" "}
            {station.buildingDetails}
          </ThemedText>
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
      </ThemedCard2 >
      <ThemedText style={styles.meta}>Last updated: {station.updated_at}</ThemedText>
      
      <View style={{ marginTop: 30, flexDirection:'row', justifyContent:'space-evenly', gap: 12 }}>
        <View style={{ alignItems:'center', gap: 6, width: 110 }}>
          <Pressable 
                  style={({ pressed }) => [
                    pressed && styles.ticketPressed,
                  ]}
                  onPress={() => {
                    router.push({ 
                      pathname: `/ticket/existing`,
                      params: { stationId: station.id}
                    })
                  }}>      
            <ThemedCard2 style={styles.footerTabs}>
              <View style={styles.ticketIcon}>
                <TabBarIcon name="exclamation-circle" color={ c.no == '#000000' ? '#969696' : c.no }/>
              </View>
            </ThemedCard2>
          </Pressable>
          <ThemedText>Report an Issue</ThemedText>
        </View>
        <View style={{ alignItems:'center', gap: 6, width: 110 }}>
          <Pressable 
                  style={({ pressed }) => [
                    pressed && styles.ticketPressed,
                  ]}
                  onPress={() => handleDirections(station) }
            >      
            <ThemedCard2 style={styles.footerTabs}>
              <View style={styles.ticketIcon}>
                <Ionicons name="walk" color={ c.no == '#000000' ? '#969696' : c.no } size={30} />
              </View>
            </ThemedCard2>
          </Pressable>
          <ThemedText>Directions</ThemedText>
        </View>
        <View style={{ alignItems:'center', gap: 6, width: 110 }}>
          <Pressable 
                  style={({ pressed }) => [
                    pressed && styles.ticketPressed,
                  ]}
                  onPress={() => handleAddToFavs(station.id) }
          > 
            <ThemedCard2 style={styles.footerTabs}>     
              <View style={styles.ticketIcon}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline" } size={30} color={isFavorite ? "#ef8e8e" : "#b9b9b9"} />
              </View>
            </ThemedCard2>
          </Pressable>
          <ThemedText>{isFavorite ? "Saved" : "Add to Favorites"}</ThemedText>
        </View>
      </View>

        

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
  accessDeniedWrap: {
    justifyContent: "center",
  },
  accessDeniedCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  joinOrgButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  joinOrgButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  header: {
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },

  card: {
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
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
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
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsStrong: {
    fontWeight: "800",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
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
  ticketIcon: { 
    width: 30, 
    height: 30,

    display: 'flex', 
    justifyContent:'center', 
    alignItems:'center' 
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
  footerTabs: {
    width: 75,
    height: 75,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  }
});
