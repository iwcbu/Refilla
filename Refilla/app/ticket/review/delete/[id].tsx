// app/ticket/review/delete[id].tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { ScrollView, Text, View, StyleSheet, Alert, Pressable, Modal, TextInput, Animated } from 'react-native';

import { Stack } from "expo-router";
import { getTicketById, updateTicket, deleteTicket, TicketRow } from '../../../../src/db/ticketsRepo';


import { useColors } from "../../../../src/theme/colors";
import { deleteStation, getStation, StationRow, updateStation } from "../../../../src/db/stationsRepo";
import StationPreview from "../../../../components/StationPreview";
import { FilterStatus, StationStatus } from '../../../../types/station';

import { Ionicons } from "@expo/vector-icons";
import { getUser } from "../../../../src/db/userRepo";


type StationForm = {
  buildingAbre: string;
  buildingName: string;
  buildingDetails: string;
  filterStatus: FilterStatus;
  stationStatus: StationStatus;
};

type FieldDef<K extends keyof StationForm> = {
  key: K;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

export default function TicketDetailScreen() {

    const c = useColors();
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const ticketId = Number(id);
    const [ticket, setTicket] = useState<TicketRow | null>(null);

    const [station, setStation] = useState<StationRow | null>(null);
    const [form, setForm] = useState<StationForm>({
        buildingAbre: "",
        buildingName: "",
        buildingDetails: "",
        filterStatus: "GREEN",
        stationStatus: "ACTIVE"
    })

    const [status, setStatus] = useState("OPEN");
    const [priority, setPriority] = useState("MEDIUM");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("RED");
    const [stationStatus, setStationStatus] = useState<StationStatus>("PENDING");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const author = ticket?.user_id != null ? getUser(ticket.user_id) : null;


    useEffect(() => {
        const t = getTicketById(ticketId);
        if (t) {
            setTicket(t);
            setStatus(t.status);
            setBody(t.body ?? "");
            const st = getStation(t.station_id);
            if (st) {
                setStation(st);
                
                setFilterStatus(st.filterStatus);
                setStationStatus(st.stationStatus);

                setForm((f) => ({ ...f, [form.filterStatus]: st.filterStatus }));
                setForm((f) => ({ ...f, [form.stationStatus]: st.stationStatus }));
            }
        }
        setLoading(false);
    }, [ticketId]);



    const handleApprove = () => {
        Alert.alert("Delete Station", "Are you sure?", [
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    if (station) {
                        deleteStation(station.id)
                        deleteTicket(ticketId);
                        router.navigate(`list`);
                        Alert.alert("Station succesfully deleted")
                    } else {
                        Alert.alert("Something went wrong, try again later...")
                    }
                },
            },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    
    const handleDelete = () => {
        Alert.alert("Keep Station", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Keep",
                style: "destructive",
                onPress: () => {
                    deleteTicket(ticketId);
                    router.navigate(`list`);
                    if (station) router.push(`/station/${station.id}`);
                },
            },
        ]);
    };

    const handleSave = () => {
        Alert.alert("Save Ticket", "This will override information saved previously", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Save",
                style: "default",
                onPress: () => {
                        if (!ticket) {
                            return
                        }
                        const patch: Partial<Pick<TicketRow, "priority" | "status">> = {};
                        
                        if (priority !== ticket.priority) patch.priority = priority;
                        if (status !== ticket.status) patch.status = status;
                        
                        
                        if (Object.keys(patch).length > 0) {
                            updateTicket(Number(ticketId), patch);
                    }
                    
                },
            },
        ])
    }


    const showTicInfHelp = () => {
        Alert.alert(
            "Ticket Information",
            "Use this panel to review and update a ticket.\n\n" +
            "• Status reflects the current progress of the issue.\n" +
            "  - Open: newly submitted and not yet handled.\n" +
            "  - WIP: actively being addressed.\n" +
            "  - Closed: resolved.\n\n" +
            "• Priority indicates urgency.\n" +
            "  - Low: minor inconvenience.\n" +
            "  - Medium: noticeable issue.\n" +
            "  - High: urgent problem affecting usability.\n\n" +
            "Press 'Save Ticket Information' to persist changes to the database."
        )
    }

    const showStaPreHelp = () => {

    }

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
    <View style={{padding: 30, backgroundColor: c.bg, flex: 1}}>
        <ScrollView contentContainerStyle={{ display: "flex", gap: 12}} showsVerticalScrollIndicator={false}>
            <View style={[styles.container, { backgroundColor: c.card2, borderColor: c.border2 }]}>
                <View style={{ display: 'flex', justifyContent:'space-between' }}>

                    <Text style={[styles.label, { color: c.text } ]}>Ticket Information</Text>

                    <Pressable onPress={showTicInfHelp} hitSlop={10}>
                            <Ionicons name="information-circle-outline" size={24} color={c.subtext} style={{ marginLeft:'auto' }} />
                    </Pressable>
                </View>
                <Text style={[styles.meta, { color: c.subtext } ]}>Ticket #{ticket.id}</Text>
                <Text style={[styles.meta, { color: c.subtext } ]}>Station ID: {ticket.station_id}</Text>
                <View style={styles.authorRow}>
                    <Text style={styles.authorEmoji}>{author?.avatar_emoji ?? "🙂"}</Text>
                    <View>
                        <Text style={[styles.meta, { color: c.subtext } ]}>
                            Submitted by: @{author?.username ?? `user${ticket.user_id}`}
                        </Text>
                        <Text style={[styles.meta, { color: c.subtext } ]}>Profile ID: {ticket.user_id}</Text>
                    </View>
                </View>
                <Text style={[styles.meta, { color: c.subtext } ]}>Created: {ticket.created_at}</Text>
                
                <Text style={[styles.label, { color: c.text } ]}>Status</Text>
                <View style={styles.pills}>
                    {(["OPEN", "WIP", "CLOSED"]).map((s) => {
                        const active = s === status;
                        return (
                        <Pressable
                            key={s}
                            onPress={() => setStatus(s)}
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {s == "WIP" ? "In Progress" : s == 'OPEN' ? 'Open' : 'Closed' }
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
                            {p == "LOW" ? "Low" : p == 'MEDIUM' ? 'Medium' : 'High' }
                            </Text>
                        </Pressable>
                        );
                    })}
                    </View>

                <Text style={[styles.label, { color: c.text } ]}>Body</Text>
                <Text style={{ color: c.subtext }}>{ body }</Text>


                <Pressable style={[styles.saveButton, {backgroundColor: c.ticketBubble}]} onPress={handleSave}>
                    <Text style={[styles.buttonText, {color: c.yes}]}>Save Ticket Information</Text>
                </Pressable>

            </View>



            <View style={[styles.container, { backgroundColor: c.card2, borderColor: c.border2 }]}>
                <View style={{ display: 'flex', flexDirection:'row-reverse', justifyContent:'space-between' }}>
                    <Pressable onPress={showStaPreHelp} hitSlop={10}>
                        <Ionicons name="information-circle-outline" size={24} color={c.subtext} style={{ marginLeft:'auto' }} />
                    </Pressable>
                    <Text style={[styles.label, { color: c.text } ]}>Station Preview</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[styles.label, { color: c.text, textAlign: "center" }]}></Text>
                </View>
                <View style={{ borderWidth: 2, borderRadius: 20, borderColor: c.border2, overflow: "hidden"  }}>
                    <StationPreview station={station}/>
                </View>


                <View style={styles.actions}>
                    <Pressable style={styles.declineButton} onPress={handleApprove}>
                    <Text style={styles.buttonText}>Delete</Text>
                    </Pressable>
                    <Pressable style={styles.saveButton} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Keep</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    </View>
    </>

    );

}

const styles = StyleSheet.create({



    // BASIC
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
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    authorEmoji: {
        fontSize: 24,
    },
    


    // INPUT
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



    // BUTTONS
    approveButton: {
        backgroundColor: "#44a03d",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    declineButton: {
        backgroundColor: "#ff4d4f",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: "#344e8b",
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        borderRadius: 8,
    },
     buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },



    // PILLS
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



    // MAP
    mapWrap: {
        marginTop: 14,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    map: {
        width: "100%",
        height: 220,
        alignSelf: "center",
    },



    // MODAL
    modalSheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 16,
        borderWidth: 1,
    },

    modalInput: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginTop: 6,
    },




});
