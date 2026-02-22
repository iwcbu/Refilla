// components/TicketCard.tsx

import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { TicketRow } from "../src/db/ticketsRepo";
import { type Colors } from "../src/theme/colors";



export function TicketCard({
  item,
  c,
  timeAgo,
  onPress,
  style
}: {
  item: TicketRow;
  c: Colors;
  timeAgo: (iso: string) => string;
  onPress?: (ticket: TicketRow) => void;
  style?: PressableProps["style"];
}) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.card2, borderColor: c.border2 },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.abbrev, { color: c.text }]}>T#{item.id}</Text>
        <Text style={[styles.stationTag, { color: c.subtext }]}>
          {item.category == "NEW" ? '' : `Station #${item.station_id}`}
        </Text>
      </View>

      <Text
        style={[styles.title, { color: c.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.title || "Untitled ticket"}
      </Text>

      <Text style={[styles.subtitle, { color: c.subtext }]} numberOfLines={1}>
        Submitted by user{item.user_id}
      </Text>

      <View style={[styles.footer, { borderColor: c.border }]}>
        <Text style={[styles.meta, { color: c.subtext }]}>
          Updated: {timeAgo(item.updated_at)}
        </Text>

        <View style={styles.chipsRow}>
          {!!item.status && (
            <Text style={[styles.chip, { color: item.status == "OPEN" ? 'green': 'orange', borderColor: item.status == "OPEN" ? 'green': 'orange' }]}>
              {item.status}
            </Text>
          )}
          {!!item.priority && (
            <Text style={[styles.chip, { color: item.priority == "MEDIUM" ? 'orange' : item.priority == "LOW" ? 'blue': 'red', borderColor: item.priority == "MEDIUM" ? 'orange' : item.priority == "LOW" ? 'blue': 'red' }]}>
              {item.priority}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  abbrev: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  stationTag: {
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "700",
  },
});