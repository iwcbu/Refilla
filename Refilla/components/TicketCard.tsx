// components/TicketCard.tsx

import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { TicketRow } from "../src/db/ticketsRepo";
import { type Colors } from "../src/theme/colors";
import ThemedText from "./ThemedText";
import ThemedSubtext from "./ThemedSubtext";
import { getUser } from "../src/db/userRepo";



export function TicketCard(
  { item, c, timeAgo, onPress, style }: {

  item: TicketRow;
  c: Colors;
  timeAgo: (iso: string) => string;
  onPress?: (ticket: TicketRow) => void;
  style?: PressableProps["style"];

}) {
  const fallbackAuthor =
    item.user_id != null ? getUser(item.user_id)?.username ?? `user${item.user_id}` : "unknown";

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.card2, borderColor: c.border2 },
        typeof style === "function" ? style({ pressed }) : style,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.headerRow}>
        <ThemedText style={styles.abbrev}>T#{item.id}</ThemedText>
        <ThemedSubtext style={styles.stationTag} numberOfLines={1}>
          {item.category == "NEW" ? '' : `Station #${item.station_id}`}
        </ThemedSubtext>
      </View>

      <ThemedText
        style={[styles.title, { color: c.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.title || "Untitled ticket"}
      </ThemedText>

      <ThemedSubtext style={styles.subtitle} numberOfLines={1}>
        Submitted by @{item.author_username ?? fallbackAuthor}
      </ThemedSubtext>

      <View style={[styles.footer, { borderColor: c.border }]}>
        <ThemedSubtext style={styles.meta}>
          Updated: {timeAgo(item.updated_at)}
        </ThemedSubtext>

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
    width: 165,
    minHeight: 150,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
    alignSelf: "flex-start",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  abbrev: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  stationTag: {
    flexShrink: 1,
    textAlign: "right",
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
    marginTop: "auto",
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
  },

  chipsRow: {
    flexDirection: "row",
    justifyContent:'center',
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,

    textAlign:'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "700",
  },
});
