import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { ActivityIndicator } from "react-native";

import type { CreateStationPayload, CreateTicketPayload, TicketCategory, TicketPriority } from "../../types/ticket";

import { useColors } from "../../src/theme/colors";
import { getStation, StationRow } from '../../src/db/stationsRepo';
import { createTicket, TicketRow } from "../../src/db/ticketsRepo";



export default function ExistingStationTicket() {

    const { stationId }  = useLocalSearchParams<{ stationId: string }>();
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

    async function submit() {
        const err = validate();
        if (err) {
        Alert.alert("Missing info", err);
        return;
        }

        // Build payloads
        const ticket: CreateTicketPayload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        };


        try {

            ticket.stationId = stationId;

            // TODO: call API: const createdTicket = await api.createTicket(ticket)

            // const id = createTicket();
            
            Alert.alert("Submitted", "Your ticket has been created.");

            if (stationId) {
                router.replace({ pathname: `/station/${stationId}`, params: { id: stationId } });
            } else {
                router.back();
            }
        } catch (e) {
        Alert.alert("Error", "Could not submit ticket. Please try again.");
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
                }}
                />

            <ScrollView style={[styles.screen, { backgroundColor: c.bg } ]} contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: c.text } ]}>Report an issue</Text>
                <Text style={[styles.subtitle, { color: c.subtext } ]}>
                    Create a ticket for station #{ stationId }
                </Text>

            
                <View style={[styles.card, { backgroundColor: c.card2 } ]}>
                    <Text style={[styles.cardTitle, { color: c.text } ]}>Ticket details</Text>

                    <Text style={[styles.label, { color: c.subtext }]}>Title</Text>
                    <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Short summary"
                    placeholderTextColor={c.subtext}
                    style={[styles.input, { backgroundColor: c.bg }]}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Any helpful context?"
                    placeholderTextColor={c.subtext}
                    style={[styles.input, styles.textArea, { backgroundColor: c.bg }]}
                    multiline
                    />

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pills}>
                    {([ "STATION DETAILS", "LEAK", "BROKEN", "FILTER", "OTHER" ] as TicketCategory[]).map((cat) => {
                        const active = cat === category;
                        return (
                        <Pressable
                            key={cat}
                            onPress={() => setCategory(cat)}
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {cat}
                            </Text>
                        </Pressable>
                        );
                    })}
                    </View>

                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.pills}>
                    {(["LOW", "MEDIUM", "HIGH"] as TicketPriority[]).map((p) => {
                        const active = p === priority;
                        return (
                        <Pressable
                            key={p}
                            onPress={() => setPriority(p)}
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {p}
                            </Text>
                        </Pressable>
                        );
                    })}
                    </View>
                </View>

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
        backgroundColor: "#f6f7fb", 
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
        color: "#0f172a" 
    },
    subtitle: { 
        marginTop: -6, 
        fontSize: 14, 
        color: "#64748b", 
        lineHeight: 20 
    },

    toggleRow: { flexDirection: "row", gap: 10, marginTop: 6 },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    toggleBtnActive: { backgroundColor: "#344e8b", borderColor: "#344e8b" },
    toggleText: { fontWeight: "800", color: "#131d34" },
    toggleTextActive: { color: "#ffffff" },

    card: {
        backgroundColor: "#ffffff",
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
    cardTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a" },

    label: { fontSize: 12, fontWeight: "800", color: "#475569" },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#131d34",
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
