import { useMemo, useState } from 'react';
import { 
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch
} from 'react-native';

import { useColors } from '../../src/theme/colors';
import { usePrefs } from '../../src/context/prefs';
import { FlatList } from 'react-native';
import { listTickets } from '../../src/db/ticketsRepo';
import { timeAgo } from '../../hooks/timeAgo';

type PrefKey = 
    | 'dark'
    | 'metric'
    | 'pushNotifications'
    | 'showCallouts'

type Preferences = Record<PrefKey, boolean>;


export default function Settings() {

    const c = useColors();
    const { prefs, setPref } = usePrefs();
    
    const tickets = listTickets();
    const openTickets = useMemo(
        () => tickets.filter((t) => t.status == "OPEN")
        ,[tickets]
    );

    return (
        <View>
            <FlatList
                data={openTickets}
                numColumns={2}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {

        
                    return (
                    <Pressable
                        onPress={() => {
                        
                        // router.push(`/station/${item.id}`);
                        }}
                        style={({ pressed }) => [
                        styles.card,
                        { backgroundColor: c.card2, borderColor: c.border2 },
                        pressed && styles.cardPressed,
                        ]}
                    >
                        <View style={styles.cardTop}>
                        <Text style={[styles.abbrev, { color: c.text }]}>Ticket number: #{item.id} | Station: {item.station_id}</Text>
        
                        <View style={styles.badge}>
                            <Text style={[styles.badgeText, { color: 'white' }]}>
                            Submitted by: {item.user_id}
                            </Text>
                        </View>
                        </View>
        
                        <Text style={[styles.buildingName, { color: c.subtext }]}>
                        {item.body}
                        </Text>
        
                        <View style={[styles.footer, { borderColor: c.border }]}>
                        <Text style={[styles.meta, { color: c.subtext }]}>
                            Updated: {timeAgo(item.updated_at)}
                        </Text>
                        </View>
                    </Pressable>
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
