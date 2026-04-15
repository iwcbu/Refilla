import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";

import ThemedBg from "../../components/ThemedBg";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedSubtext from "../../components/ThemedSubtext";
import ThemedText from "../../components/ThemedText";
import { TicketCard } from "../../components/TicketCard";
import { useAuth } from "../../src/context/auth";
import { listTicketsForUser, syncTickets, type TicketRow } from "../../src/db/ticketsRepo";
import { timeAgo } from "../../hooks/timeAgo";
import { useColors } from "../../src/theme/colors";

export default function AccountTicketsScreen() {
  const c = useColors();
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setTickets([]);
      return;
    }

    try {
      await syncTickets();
    } catch (error) {
      console.log("Could not sync tickets", error);
    }

    setTickets(listTicketsForUser(currentUser.id));
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: c.card2 },
          headerTintColor: c.text,
          title: "Tickets Submitted",
          headerBackTitle: "Back",
        }}
      />

      <ThemedBg style={styles.screen}>
        <FlatList
          data={tickets}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <ThemedText style={styles.title}>Your tickets</ThemedText>
              <ThemedSubtext style={styles.subtitle}>
                Review issues you have submitted and jump back into moderation flows.
              </ThemedSubtext>
            </View>
          }
          renderItem={({ item }) => (
            <TicketCard
              item={item}
              c={c}
              timeAgo={timeAgo}
              onPress={() => {
                item.category === "REMOVE"
                  ? router.push(`/ticket/review/delete/${item.id}`)
                  : router.push(`/ticket/review/details/${item.id}`);
              }}
            />
          )}
          ListEmptyComponent={
            <>
              <ThemedCard2 style={styles.card}>
                <ThemedSubtext>No tickets have been submitted by this profile yet.</ThemedSubtext>
                <View style={styles.buttonBox}>
                  <Pressable onPress={() => router.push("/ticket/new")} style={styles.primaryButton}>
                    <ThemedText style={styles.buttonText}>Submit a New Station</ThemedText>
                  </Pressable>
                </View>
              </ThemedCard2>
            </>
          }
        />
      </ThemedBg>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  grid: {
    paddingTop: 6,
    paddingBottom: 28,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  headerBlock: { gap: 12, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  row: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  buttonBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent:"space-around",
    gap: 10,
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
