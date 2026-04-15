// app/(tabs)/adminView.tsx

import { useMemo, useState, useCallback } from 'react';
import { 
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';


import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../src/theme/colors';
import { listTickets, TicketRow } from '../../../src/db/ticketsRepo';
import ThemedBg from '../../../components/ThemedBg';
import ThemedText from '../../../components/ThemedText';
import ThemedSubtext from '../../../components/ThemedSubtext';
import { db } from '../../../src/db/database';
import { migrate } from '../../../src/db/migrations';
import { TabBarIcon } from '../../(tabs)/_layout';
import { timeAgo } from '../../../hooks/timeAgo';
import { TicketCard } from '../../../components/TicketCard';


export default function TicketList() {
  const c = useColors();

  const [ticketList, setTicketList] = useState<TicketRow[]>(() => listTickets());
  const [includeAll, setIncludeAll] = useState(false);

  const openTickets = useMemo(
    () => ticketList.filter((t) => t.status !== "CLOSED"),
    [ticketList]
  );

  const ticketsDisplayed = useMemo(
    () => includeAll ? ticketList : openTickets,
    [includeAll, openTickets, ticketList]
  );

  // ================= refresh =================
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    const start = Date.now();

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTicketList([...listTickets()]);
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

  return (
    <ThemedBg style={styles.screen}>
      <View style={styles.header}>
        {refreshing ? (
          <View style={styles.textBox}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.title}>Tickets</ThemedText>
              <ActivityIndicator size="small" />
            </View>
            <ThemedSubtext style={styles.subtitle}>
              Refreshing tickets...
            </ThemedSubtext>
          </View>
        ) : (
          <View style={styles.textBox}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.title}>Tickets</ThemedText>
              <Pressable onPress={handleRefresh}>
                <Ionicons name="refresh" size={20} color={c.text} />
              </Pressable>
            </View>

            <ThemedSubtext style={styles.subtitle}>
              Recent tickets issued by users
            </ThemedSubtext>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.ticket,
            pressed && styles.ticketPressed,
          ]}
          onPress={() => {
            try {
              db.execSync(`
                DROP TABLE IF EXISTS tickets;
                DROP TABLE IF EXISTS stations;
              `);

              migrate(db);

              Alert.alert("DB reset", "Dropped tables and re-ran migrations.");
            } catch (e: any) {
              Alert.alert("DB reset failed", String(e?.message ?? e));
            }
          }}
        >
          <View style={styles.ticketIconWrap}>
            <TabBarIcon name="remove" color="white" />
          </View>
        </Pressable>
      </View>

      <View style={styles.toggleRow}>
        <Pressable onPress={() => setIncludeAll(false)}>
          <ThemedText style={{ color: !includeAll ? c.text : c.subtext }}>
            Open Tickets
          </ThemedText>
          {!includeAll && <View style={{ height: 2, backgroundColor: c.text }} />}
        </Pressable>

        <Pressable onPress={() => setIncludeAll(true)}>
          <ThemedText style={{ color: includeAll ? c.text : c.subtext }}>
            All Tickets
          </ThemedText>
          {includeAll && <View style={{ height: 2, backgroundColor: c.text }} />}
        </Pressable>
      </View>

      <FlatList
        data={ticketsDisplayed}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <TicketCard
              item={item}
              c={c}
              timeAgo={timeAgo}
              onPress={() => {
                item.category === "REMOVE"
                  ? router.push(`/ticket/review/delete/${item.id}`)
                  : router.push(`/ticket/review/details/${item.id}`);
              }}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.card2, borderColor: c.border2 },
                pressed && styles.cardPressed,
              ]}
            />
          );
        }}
      />
    </ThemedBg>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
  },

  textBox: {
    marginTop: 4,
    marginBottom: 12,
  },

  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },

  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
    marginBottom: 20,
  },

  ticket: {
    marginLeft: "auto",
    marginRight: 20,
    alignSelf: "center",

    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },

    borderRadius: 140,
    padding: 12,
    backgroundColor: "#ff7777",
  },

  ticketIconWrap: {
    width: 30,
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
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
    marginTop: 2,
  },

  meta: {
    fontSize: 12,
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
    fontWeight: "700",
  },

  footerValue: {
    fontSize: 14,
    fontWeight: "900",
  },
});