import { useMemo, useState, useCallback } from 'react';
import { 
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    RefreshControl
} from 'react-native';
import { router } from 'expo-router';

import { useColors } from '../../src/theme/colors';
import { usePrefs } from '../../src/context/prefs';
import { FlatList } from 'react-native';
import { listTickets, TicketRow } from '../../src/db/ticketsRepo';
import { timeAgo } from '../../hooks/timeAgo';
import { TicketCard } from '../../components/TicketCard';
import { TabBarIcon } from './_layout';

// TEMPORARY
import { db } from '../../src/db/database';
import { migrate } from '../../src/db/migrations';
import { Alert } from 'react-native';

import { useEffect } from 'react';
import { reload } from 'expo-router/build/global-state/routing';

type PrefKey = 
    | 'dark'
    | 'metric'
    | 'pushNotifications'
    | 'showCallouts'

type Preferences = Record<PrefKey, boolean>;


export default function TicketList() {

  const c = useColors();

  

  const [refreshing, setRefreshing] = useState(false);
  const [allTickets,  setAllTickets] = useState<TicketRow[]>(() => listTickets());
  const [tickets,  setTickets] = useState<TicketRow[]>();

  const openTickets = useMemo(
    () => allTickets.filter((t) => t.status == "OPEN")
    ,[allTickets]
  );

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      setAllTickets(listTickets());
    } finally {
      setRefreshing(false)
    }
  }, []);



  return (
    <View style={[styles.screen, {backgroundColor: c.bg}]}>
        
      <View style={styles.header}>
        <View style={styles.textBox}>
          <Text style={[styles.title, { color: c.text }]}>Tickets</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>Recent tickets issued by users</Text>
        </View>
        
        <Pressable style={({ pressed }) => [
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
            }}>
              <View style={{ width: 30, height: 30, display: 'flex', justifyContent:'center', alignItems:'center' }}>
                <TabBarIcon name="remove" color="white" />
              </View>
              
          </Pressable>
      </View>

      <FlatList
          data={openTickets}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={reload}/>
          }
          
          renderItem={({ item }) => {
              return (
                
                <TicketCard 
                  item={item}
                  c={c}
                  timeAgo={timeAgo}
                  onPress={() => {
                
                  router.push(`/ticket/${item.id}`);
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
            
    </View>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    // backgroundColor: "#f6f7fb",
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
    backgroundColor: "#ff7777"

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
