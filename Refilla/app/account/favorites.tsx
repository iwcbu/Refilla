import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemedBg from "../../components/ThemedBg";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedSubtext from "../../components/ThemedSubtext";
import ThemedText from "../../components/ThemedText";
import { useAuth } from "../../src/context/auth";
import {
  isFavoriteStation,
  listFavoriteStationIdsForUser,
  toggleFavoriteStation,
} from "../../src/db/favoriteStationsRepo";
import { listStations, syncStations, type StationRow } from "../../src/db/stationsRepo";
import { useColors } from "../../src/theme/colors";
import { getVisibleStationsForUser } from "../../src/features/account/organizationService";
import { listOrganizationsForUser } from "../../src/db/userOrganizationsRepo";

type StationSection = {
  title: string;
  data: StationRow[];
};

export default function FavoriteStationsScreen() {
  const c = useColors();
  const { currentUser } = useAuth();
  const [stations, setStations] = useState<StationRow[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(() => currentUser ? currentUser.id : 1 )

  const refresh = useCallback(async () => {
    try {
      await syncStations();
    } catch (error) {
      console.log("Could not sync stations", error);
    }

    const nextStations = listStations();
    setStations(nextStations);

    if (currentUser) {
      setCurrentUserId(currentUser.id);
      setFavoriteIds(listFavoriteStationIdsForUser(currentUser.id));
    } else {
      setFavoriteIds([]);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const visibleStations = useMemo(() => {
    const stationsUserCanSee = getVisibleStationsForUser(stations, currentUser?.id);

    if (!showFavoritesOnly) {
      return stationsUserCanSee;
    }

    const favoriteSet = new Set(favoriteIds);
    return stationsUserCanSee.filter((station) => favoriteSet.has(station.id));
  }, [currentUser?.id, favoriteIds, showFavoritesOnly, stations]);

  const stationSections = useMemo<StationSection[]>(() => {
    const organizations = currentUser ? listOrganizationsForUser(currentUser.id) : [];
    const sections: StationSection[] = [];

    for (const organization of organizations) {
      const orgStations = visibleStations.filter(
        (station) => station.organization_id === organization.id 
      );

      if (orgStations.length > 0) {
        sections.push({
          title: organization.name,
          data: orgStations,
        });
      }
    }

    return sections;
  }, [currentUser, visibleStations]);

  const handleToggleFavorite = (stationId: number) => {
    if (!currentUser) {
      router.replace("/account/login/login");
      return;
    }

    toggleFavoriteStation(currentUser.id, stationId);
    setFavoriteIds(listFavoriteStationIdsForUser(currentUser.id));
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: c.card2 },
          headerTintColor: c.text,
          title: "Favorite Stations",
          headerBackTitle: "Back",
        }}
      />

      <ThemedBg style={styles.screen}>
        <SectionList
          sections={stationSections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <ThemedText style={styles.title}>Favorite stations</ThemedText>
              <ThemedSubtext style={styles.subtitle}>
                Save the stations you want to revisit quickly from your profile.
              </ThemedSubtext>

              <View style={styles.toggleRow}>
                <Pressable onPress={() => setShowFavoritesOnly(true)}>
                  <ThemedText style={{ color: showFavoritesOnly ? c.text : c.subtext }}>
                    Favorites only
                  </ThemedText>
                  {showFavoritesOnly ? <View style={[styles.underline, { backgroundColor: c.text }]} /> : null}
                </Pressable>

                <Pressable onPress={() => setShowFavoritesOnly(false)}>
                  <ThemedText style={{ color: !showFavoritesOnly ? c.text : c.subtext }}>
                    By organization
                  </ThemedText>
                  {!showFavoritesOnly ? <View style={[styles.underline, { backgroundColor: c.text }]} /> : null}
                </Pressable>
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            </View>
          )}
          renderItem={({ item }) => {
            const isFavorite = isFavoriteStation(currentUserId, item.id)

            return (
              <Pressable onPress={() => router.push(`/station/${item.id}`)}>
                <ThemedCard2 style={styles.card}>
                  <View style={styles.topRow}>
                    <Pressable
                      onPress={() => handleToggleFavorite(item.id)}
                      hitSlop={8}
                      style={styles.favoriteButton}
                    >
                      <Ionicons name={isFavorite ? "heart" : "heart-outline" } size={20} color={isFavorite ? "#ef8e8e" : "#b9b9b9"} />
                    </Pressable>

                    <View style={styles.stationHeader}>
                      <ThemedText style={styles.stationAbbrev}>
                        {item.buildingAbre || "N/A"} <ThemedText style={styles.stationId}>#{item.id}</ThemedText>
                      </ThemedText>
                      <ThemedSubtext style={styles.stationName}>
                        {item.buildingName || "Unnamed station"}
                      </ThemedSubtext>
                    </View>

                    <Ionicons
                      name="chevron-forward-outline"
                      size={18}
                      color={c.subtext}
                    />
                  </View>
                </ThemedCard2>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <ThemedCard2 style={styles.card}>
              <ThemedSubtext>
                {showFavoritesOnly
                  ? "You have not favorited any stations yet."
                  : "No stations are available in your joined organizations yet."}
              </ThemedSubtext>
            </ThemedCard2>
          }
        />
      </ThemedBg>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  headerBlock: { gap: 12, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  toggleRow: { flexDirection: "row", gap: 16 },
  underline: { height: 2, marginTop: 3 },
  sectionHeader: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    opacity: 0.75,
    letterSpacing: 0.8,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rowLeft: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent:'flex-start',

  },
  stationHeader: {
    paddingLeft: 5,
    flex: 1,
    gap: 10,
  },
  stationAbbrev: { fontSize: 17, fontWeight: "700" },
  stationId: { fontSize: 16, fontWeight: "600" },
  stationName: { fontSize: 14, marginTop: -10, },
  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 18,
  },
});
