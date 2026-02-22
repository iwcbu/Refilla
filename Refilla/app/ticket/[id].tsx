import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TextInput, Alert, Pressable, } from "react-native";

import { Stack } from "expo-router";
import { db } from "../../src/db/database";
import { getTicketById, updateTicket, deleteTicket, TicketRow } from "../../src/db/ticketsRepo";
import { Picker } from "@react-native-picker/picker";
import { useColors } from "../../src/theme/colors";

export default function TicketDetailScreen() {

    const c = useColors();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const ticketId = Number(id);

    const [ticket, setTicket] = useState<TicketRow | null>(null);
    const [status, setStatus] = useState("OPEN");
    const [priority, setPriority] = useState("MEDIUM");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = getTicketById(ticketId);
        if (t) {
        setTicket(t);
        setStatus(t.status);
        setBody(t.body ?? "");
        }
        setLoading(false);
    }, [ticketId]);

    const handleSave = () => {
        updateTicket(ticketId, { status, body });
        Alert.alert("Saved", "Ticket updated.");
        router.back();
    };

    const handleDelete = () => {
        Alert.alert("Delete Ticket", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
            text: "Delete",
            style: "destructive",
            onPress: () => {
            deleteTicket(ticketId);
            router.replace("/tickets");
            },
        },
        ]);
    };

    if (loading || !ticket) {
        return <Text style={{ padding: 20 }}>Loading ticket...</Text>;
    }

  return (

    <>
      <Stack.Screen
            options={{ 
              headerShown: true, 
              headerStyle: { backgroundColor: c.card2 },
              headerTintColor: c.text,
              title: "Tickets",
              headerBackTitle: "Cancel",
            }}
      />
        <View style={{ padding: 30, backgroundColor: c.bg, flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.card2, borderColor: c.border2 }]}>
                <Text style={[styles.label, { color: c.text } ]}>Ticket #{ticket.id}</Text>
                <Text style={[styles.meta, { color: c.subtext } ]}>Station ID: {ticket.station_id}</Text>
                <Text style={[styles.meta, { color: c.subtext } ]}>Submitted by: user{ticket.user_id}</Text>
                <Text style={[styles.meta, { color: c.subtext } ]}>Created: {ticket.created_at}</Text>
                
                <Text style={[styles.label, { color: c.text } ]}>Status</Text>
                <View style={styles.pills}>
                    {(["OPEN", "IN_PROGRESS", "CLOSED"]).map((s) => {
                        const active = s === status;
                        return (
                        <Pressable
                            key={s}
                            onPress={() => setStatus(s)}
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {s == "IN_PROGRESS" ? "In Progress" : s == 'OPEN' ? 'Open' : 'Closed' }
                            </Text>
                        </Pressable>
                        );
                    })}
                    </View>

                <Text style={[styles.label, { color: c.text } ]}>Priority</Text>

                <View style={styles.pills}>
                    {(["LOW", "MEDIUM", "HIGH"]).map((p) => {
                        const active = p === priority;
                        return (
                        <Pressable
                            key={p}
                            onPress={() => setPriority(p)}
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {p == "LOW" ? "Low" : p == 'MEDIUM' ? 'Medium' : 'Closed' }
                            </Text>
                        </Pressable>
                        );
                    })}
                    </View>

                <Text style={[styles.label, { color: c.text } ]}>Body</Text>
                <TextInput
                    value={body}
                    onChangeText={setBody}
                    style={styles.input}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />

                <View style={styles.actions}>
                    <Pressable style={styles.approveButton} onPress={handleSave}>
                    <Text style={styles.approveText}>Approve</Text>
                    </Pressable>
                    <Pressable style={styles.declineButton} onPress={handleDelete}>
                    <Text style={styles.declineText}>Decline</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    </>
  );

}const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12,
        borderRadius: 15,
        borderWidth: 1,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 12,
    },
    meta: {
        fontSize: 13,
        color: "#666",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: "#fff",
    },
    actions: {
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        flexDirection: "row",
        gap: 12,
    },
    approveButton: {
        backgroundColor: "#44a03d",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    approveText: {
        color: "#fff",
        fontWeight: "bold",
    },
    declineButton: {
        backgroundColor: "#ff4d4f",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    declineText: {
        color: "#fff",
        fontWeight: "bold",
    },

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

});