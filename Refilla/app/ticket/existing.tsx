// app/ticket/existing.tsx

import { useEffect, useState } from "react";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { ActivityIndicator } from "react-native";

import type { TicketCategory, TicketPriority } from "../../types/ticket";

import { useColors } from "../../src/theme/colors";
import { getStation } from '../../src/db/stationsRepo';
import { createTicket } from "../../src/db/ticketsRepo";
import { useAuth } from "../../src/context/auth";
import { getUser, incrementUserPoints } from "../../src/db/userRepo";
import ThemedText from "../../components/ThemedText";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedSubtext from "../../components/ThemedSubtext";
import { Ionicons } from "@expo/vector-icons";



export default function ExistingStationTicket() {

    const { stationId }  = useLocalSearchParams<{ stationId: string }>();
    const { currentUser } = useAuth();
    const submittingProfile = currentUser ? getUser(currentUser.id) : null;
    const station = getStation(Number(stationId));
    if (station == null) {
        return (
            <View style={styles.fetchingBox}>
            <Text style={styles.fetchingText}>Fetching, one moment...</Text>
            <ActivityIndicator size='large' />
        </View>
        )
    }

    const c = useColors();

// Ticket form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<TicketCategory>("OTHER");
    const [priority, setPriority] = useState<TicketPriority>("MEDIUM");


    function validate(): string | null {
        if (!title.trim()) return "Please add a short title.";
        if (title.trim().length < 4) return "Title is too short.";
        if (!description.trim()) return "Please describe the issue.";
        if (description.trim().length < 10) return "Description is too short.";

        return null;
    }

    const [submitting, setSubmitting] = useState(false);

    const showExistingStationHelp = () => {
      Alert.alert(
        'Help to Report an Issue',
        'Use this screen to report an issue on an existing station or submit a ticket to remove a station.\n\n' +
        "• Submitting profile: shows which profile will be saved as the ticket author.\n" +
        "• Ticket details: add the title, description, category, and priority that explain why this station is being created.\n\n" +
        '• Category: select the category that matches the issue most; if a category does not apply, select other and explain the issue further in the description.\n'
      )
    }

    async function submit() {
        const err = validate();
        if (err) {
            Alert.alert("Missing info", err);
            return;
        }

        if (!currentUser) {
            Alert.alert("Profile required", "Please choose a profile from the Profile tab before submitting a ticket.");
            router.push("/account/login/login");
            return;
        }

        if (submitting) return;
        setSubmitting(true);

        const ticket = {
            user_id: currentUser.id,
            station_id: Number(stationId),
            title: title.trim(),
            body: description.trim() || null,
            status: 'OPEN',
            category,
            priority,
        };

        try {
            createTicket(ticket)
            incrementUserPoints(currentUser.id, 5);
            Alert.alert("Submitted", "Your ticket has been created.");
            router.back();
        } catch (e) {
            Alert.alert("Error", "Could not submit ticket. Please try again.");
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Stack.Screen
                options={{
                headerShown: true,
                headerStyle: { backgroundColor: c.card2 },
                headerTintColor: c.text,
                title: "Issue a Ticket",
                headerBackTitle: "Back",
                headerRight: () => (
                  <Pressable onPress={showExistingStationHelp} hitSlop={10}>
                    <Ionicons
                      name="information-circle-outline"
                      size={24}
                      color={c.text}
                    />
                  </Pressable>
                ),
                
                }}
                />

            <ScrollView style={[styles.screen, { backgroundColor: c.bg } ]} contentContainerStyle={styles.content}>
                <ThemedText style={styles.title}>Report an issue</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Create a ticket for station #{ stationId }
                </ThemedText>

                <ThemedCard2 style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Submitting profile</ThemedText>
                    <View style={styles.profileRow}>
                        <ThemedText style={styles.profileEmoji}>
                            {submittingProfile?.avatar_emoji ?? "🙂"}
                        </ThemedText>
                        <View style={styles.profileMeta}>
                            <ThemedText style={styles.profileName}>
                                @{submittingProfile?.username ?? "choose_a_profile"}
                            </ThemedText>
                            <ThemedSubtext>
                                This profile will appear as the ticket author.
                            </ThemedSubtext>
                        </View>
                    </View>
                </ThemedCard2>

            
                <ThemedCard2 style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Ticket details</ThemedText>

                    <ThemedSubtext style={[styles.label, { color: c.subtext }]}>Title</ThemedSubtext>
                    <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Short summary"
                    placeholderTextColor={c.subtext}
                    style={[styles.input, { backgroundColor: c.bg, color: c.text }]}
                    />

                    <ThemedSubtext style={styles.label}>Description</ThemedSubtext>
                    <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Any helpful context?"
                    placeholderTextColor={c.subtext}
                    style={[styles.input, styles.textArea, { backgroundColor: c.bg, color: c.text }]}
                    multiline
                    />

                    <ThemedSubtext style={styles.label}>Category</ThemedSubtext>
                    <View style={styles.pills}>
                    {([ "STATION DETAILS", "LEAK", "BROKEN", "FILTER", "REMOVE", "OTHER" ] as TicketCategory[]).map((cat) => {
                        const active = cat === category;
                        return (
                        <Pressable
                            key={cat}
                            onPress={() => {
                              setCategory(cat)

                              if (cat == 'BROKEN' || cat == 'LEAK') {
                                setPriority("HIGH")
                              } else if (cat == 'FILTER' || cat == 'OTHER') {
                                setPriority('MEDIUM')
                              } else { 
                                setPriority('LOW')
                              }
                            }}
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {cat}
                            </Text>
                        </Pressable>
                        );
                    })}
                    </View>

                </ThemedCard2>

                <Pressable onPress={submit} style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}>
                    <Text style={styles.submitText}>Submit ticket</Text>
                </Pressable>

                <Pressable onPress={() => router.back()} style={styles.cancel}>
                    <Text style={[styles.cancelText, { color: c.subtext }]}>Cancel</Text>
                </Pressable>
            </ScrollView>
        </>
    );
    }

const styles = StyleSheet.create({

    screen: { 
        flex: 1,
        paddingTop: 40 
    },
    content: { 
        padding: 16, 
        paddingBottom: 28, 
        gap: 12 
    },

    title: { 
        fontSize: 26, 
        fontWeight: "900", 
    },
    subtitle: { 
        marginTop: -6, 
        fontSize: 14, 
        lineHeight: 20 
    },

    toggleRow: { flexDirection: "row", gap: 10, marginTop: 6 },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        alignItems: "center",
    },
    toggleBtnActive: { backgroundColor: "#344e8b", borderColor: "#344e8b" },
    toggleText: { fontWeight: "800", color: "#131d34" },
    toggleTextActive: { color: "#ffffff" },

    card: {
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        gap: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    cardTitle: { fontSize: 14, fontWeight: "900", },

    label: { fontSize: 12, fontWeight: "800" },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    textArea: { minHeight: 90, textAlignVertical: "top" },

    pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    pill: {
        width: 92,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
    },
    pillActive: { backgroundColor: "#344e8b", borderColor: "#344e8b" },
    pillText: { fontSize: 14, fontWeight: "900", color: "#131d34" },
    pillTextActive: { color: "#ffffff" },
    pillSub: { fontSize: 12, color: "#64748b" },
    pillSubActive: { color: "#cbd5e1" },

    pillSmall: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
    },
    pillSmallActive: { backgroundColor: "#344e8b", borderColor: "#344e8b" },
    pillSmallText: { fontSize: 12, fontWeight: "900", color: "#131d34" },
    pillSmallTextActive: { color: "#ffffff" },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    profileEmoji: {
        fontSize: 30,
    },
    profileMeta: {
        flex: 1,
        gap: 2,
    },
    profileName: {
        fontSize: 16,
        fontWeight: "700",
    },

    preview: {
        padding: 12,
        borderRadius: 14,
        backgroundColor: "#f1f5f9",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        gap: 4,
    },
    previewTitle: { fontSize: 13, fontWeight: "900", color: "#0f172a" },
    previewBody: { fontSize: 13, color: "#334155" },

    submit: {
        marginTop: 6,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: "#16a34a",
        alignItems: "center",
    },
    submitPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    submitText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },

    cancel: { alignItems: "center", paddingVertical: 10 },
    cancelText: { color: "#64748b", fontWeight: "800" },
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
});
