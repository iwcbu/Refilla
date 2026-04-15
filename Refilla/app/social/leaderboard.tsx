import { useColors } from "../../src/theme/colors";
import ThemedBg from "../../components/ThemedBg";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedText from "../../components/ThemedText";
import ThemedSubtext from "../../components/ThemedSubtext";

import { FlatList, StyleSheet, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "../../src/features/account/accountService";
import { useAuth } from "../../src/context/auth";
export default function Leaderboard() {
    const c = useColors();
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    useFocusEffect(
        useCallback(() => {
            setEntries(getLeaderboard());
        }, [])
    );

    return (
        <>
            <Stack.Screen
                options={{
                headerShown: true,
                headerStyle: { backgroundColor: c.card2 },
                headerTintColor: c.text,
                title: "Leaderboard",
                headerBackTitle: "Back",
                }}
            />
            <ThemedBg style={styles.screen}>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Leaderboard</ThemedText>
                    <ThemedSubtext style={styles.subtitle}>
                        See how you stack up against other local Refilla users.
                    </ThemedSubtext>
                </View>

                <FlatList
                    data={entries}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    renderItem={({ item }) => {
                        const isCurrentUser = item.id === currentUser?.id;

                        return (
                            <ThemedCard2 style={[styles.card, isCurrentUser && styles.activeCard]}>
                                <View style={styles.row}>
                                    <ThemedText style={styles.rank}>#{item.rank}</ThemedText>

                                    <View style={styles.userMeta}>
                                        <ThemedText style={styles.username}>@{item.username}</ThemedText>
                                        <ThemedSubtext>
                                            {item.ticketsSubmitted} tickets submitted
                                        </ThemedSubtext>
                                    </View>

                                    <ThemedText style={styles.points}>{item.points} pts</ThemedText>
                                </View>
                            </ThemedCard2>
                        );
                    }}
                    ListEmptyComponent={
                        <ThemedCard2 style={styles.card}>
                            <ThemedSubtext>No users are available yet.</ThemedSubtext>
                        </ThemedCard2>
                    }
                />
            </ThemedBg>
        </>
    );
} 

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    list: {
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    card: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 16,
    },
    activeCard: {
        borderColor: "#2563eb",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    rank: {
        fontSize: 18,
        fontWeight: "bold",
        width: 42,
    },
    userMeta: {
        flex: 1,
        gap: 2,
    },
    username: {
        fontSize: 18,
    },
    points: {
        fontSize: 16,
        fontWeight: "700",
    },
}); 
