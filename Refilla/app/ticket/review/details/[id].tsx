// app/ticket/[id].tsx

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
import ThemedBg from "../../../../components/ThemedBg";
import ThemedCard2 from "../../../../components/ThemedCard2";
import ThemedText from "../../../../components/ThemedText";
import ThemedCard from "../../../../components/ThemedCard";
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
    const [notes, setNotes] = useState("");
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
        if (station) {
            updateStation(
                station.id, 
                {
                    "buildingAbre": form.buildingAbre,
                    "buildingName": form.buildingName,
                    "buildingDetails": form.buildingDetails,
                    "filterStatus": filterStatus,
                    "stationStatus": stationStatus,
                }
            )
            Alert.alert("Approved", "Changes have now been added, ticket has been deleted");
            deleteTicket(ticketId)
            router.navigate(`list`)
            router.push(`/station/${station.id}`)
        }
        else {
            Alert.alert("Something went wrong, please try again...")
        }
    };

    
    const handleDelete = () => {
        Alert.alert("Delete Ticket", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    if (station && ticket?.category == "NEW") deleteStation(station.id)
                    deleteTicket(ticketId);
                    router.navigate(`adminView`);
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

    // editing station
    const [editOpen, setEditOpen] = useState(false);
    const openEdit = () => {
        setForm({
            buildingAbre: station?.buildingAbre ?? "",
            buildingName: station?.buildingName ?? "",
            buildingDetails: station?.buildingDetails ?? "",
            filterStatus: station?.filterStatus ?? "GREEN",
            stationStatus: station?.stationStatus ?? "ACTIVE"
        });
        setEditOpen(true);
    }


    // modal
    const FILTER_STATUSES: FilterStatus[] = ["GREEN", "YELLOW", "RED", "NA"];
    const STATION_STATUSES: StationStatus[] = ["ACTIVE", "PENDING", "REMOVED", "NA"];


    const translateY = useRef(new Animated.Value(40)).current; // edit form
    const opacity = useRef(new Animated.Value(0)).current; // background

    useEffect(() => {
        if (!editOpen) return;

        translateY.setValue(300);
        opacity.setValue(0);

        Animated.parallel([
            Animated.timing(translateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
            }),
            Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
            }),
        ]).start();
    }, [editOpen]);

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
            "Press Save to persist changes to the database."
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
    <ThemedBg style={{padding: 30, flex: 1 }}>
        <ScrollView contentContainerStyle={{ display: "flex", gap: 20}} showsVerticalScrollIndicator={false}>
            <ThemedCard2 style={[styles.container, { borderColor: c.border2 }]}>
                <View style={{ display: 'flex', justifyContent:'space-between' }}>

                    <ThemedText style={styles.label}>Ticket Information</ThemedText>

                    <Pressable onPress={showTicInfHelp} hitSlop={10}>
                            <Ionicons name="information-circle-outline" size={24} color={c.subtext} style={{ marginLeft:'auto' }} />
                    </Pressable>
                </View>
                <ThemedText style={styles.meta}>Ticket #{ticket.id}</ThemedText>
                <ThemedText style={styles.meta}>Station ID: {ticket.station_id}</ThemedText>
                <View style={styles.authorRow}>
                    <ThemedText style={styles.authorEmoji}>{author?.avatar_emoji ?? "🙂"}</ThemedText>
                    <View>
                        <ThemedText style={styles.meta}>
                            Submitted by: @{author?.username ?? `user${ticket.user_id}`}
                        </ThemedText>
                        <ThemedText style={styles.meta}>Profile ID: {ticket.user_id}</ThemedText>
                    </View>
                </View>
                <ThemedText style={styles.meta}>Created: {ticket.created_at}</ThemedText>

                <ThemedText style={[styles.label, { color: c.text } ]}>Status</ThemedText>
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

                <Text style={[]}></Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  autoCorrect={false}
                  placeholder="Put ticket notes here"
                  placeholderTextColor={c.subtext}
                  style={[styles.input, { backgroundColor: c.bg, color: c.text }]}
                />


                <Pressable style={[styles.saveButton, {backgroundColor: c.ticketBubble}]} onPress={handleSave}>
                    <Text style={[styles.buttonText, {color: c.yes}]}>Save Ticket Information</Text>
                </Pressable>

            </ThemedCard2>



            <View style={[styles.container, { backgroundColor: c.card2, borderColor: c.border2 }]}>
                <View style={{ display: 'flex', flexDirection:'row-reverse', justifyContent:'space-between' }}>
                    <Pressable onPress={showStaPreHelp} hitSlop={10}>
                        <Ionicons name="information-circle-outline" size={24} color={c.subtext} style={{ marginLeft:'auto' }} />
                    </Pressable>
                    <Text style={[styles.label, { color: c.text } ]}>Station Preview</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[styles.label, { color: c.text, textAlign: "center" }]}></Text>

                    <Pressable onPress={openEdit} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                        <Text style={{ color: c.text, fontWeight: "800" }}>Edit</Text>
                    </Pressable>
                </View>
                <View style={{ borderWidth: 2, borderRadius: 20, borderColor: c.border2, overflow: "hidden"  }}>
                    <StationPreview station={station}/>
                </View>


                <View style={styles.actions}>
                    <Pressable style={styles.approveButton} onPress={handleApprove}>
                    <Text style={styles.buttonText}>Approve</Text>
                    </Pressable>
                    <Pressable style={styles.declineButton} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Decline</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    </ThemedBg>


    <Modal
        visible={editOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setEditOpen(false)}
        >
        <Pressable
            onPress={() => setEditOpen(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
            />
        <Animated.View style={{ position: "absolute", left: 0, right: 0, bottom: 0, transform: [{ translateY }] }}>
            <View style={ [styles.modalSheet, { backgroundColor: c.bg, borderColor: c.border2 }] }>

                <Text style={{ color: c.text, fontSize: 18, fontWeight: "900", marginBottom: 12 }}>Edit Station</Text>
                <Text style={{ color: c.text, fontSize: 12, marginBottom: 12 }}>*Only visually changes the station information for the preview unless ticket is approved. If canceled or backed out, the ticket keeps the previously stored station information</Text>

                {([
                    {
                        key: "buildingAbre",
                        label: "Building Abbreviation",
                        placeholder: "GSU",
                        multiline: false,
                    },
                    {
                        key: "buildingName",
                        label: "Bulding Name",
                        placeholder: "George Sherman Union",
                        multiline: false,
                    },
                    {
                        key: "buildingDetails",
                        label: "Location Details",
                        placeholder: "e.g. 2nd floor near restrooms",
                        multiline: true,
                    },
                ] as FieldDef<keyof StationForm>[]).map((field) => (
                    <View key={field.key}>
                            <Text
                            style={{
                                color: c.subtext,
                                fontWeight: "800",
                                marginTop: 12,
                            }}
                            >
                            {field.label}
                            </Text>

                            <TextInput
                            value={form[field.key]}
                            onChangeText={(v) =>
                                setForm((f) => ({ ...f, [field.key]: v }))
                            }
                            placeholder={field.placeholder}
                            placeholderTextColor={c.subtext}
                            multiline={field.multiline}
                            style={[
                                styles.modalInput,
                                {
                                borderColor: c.border2,
                                color: c.text,
                                backgroundColor: c.card2,
                                minHeight: field.multiline ? 90 : undefined,
                                textAlignVertical: field.multiline ? "top" : "center",
                                },
                            ]}
                            />
                        </View>
                    ))
                }

                <Text
                    style={{
                        color: c.subtext,
                        fontWeight: "800",
                        marginBottom: 12,
                        marginTop: 10,
                    }}
                    >
                    Filter Status
                </Text>
                <View style={styles.pills}>
                    {FILTER_STATUSES.map((fs) => {
                        const active = fs === filterStatus;
                        return (
                        <Pressable
                            key={fs}
                            onPress={() => setFilterStatus(fs) }
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {fs == "GREEN" ? "GREEN" : fs == 'YELLOW' ? 'YELLOW' : fs == "RED" ? "RED" : "NA" }
                            </Text>
                        </Pressable>
                        );
                    })}
                </View>

                <Text
                    style={{
                        color: c.subtext,
                        fontWeight: "800",
                        marginBottom: 12,
                        marginTop: 10,
                    }}
                    >
                    Station Status
                </Text>
                <View style={styles.pills}>
                    {STATION_STATUSES.map((ss: StationStatus) => {
                        const active = ss === stationStatus;
                        return (
                        <Pressable
                            key={ss}
                            onPress={() => setStationStatus(ss) }
                            style={[styles.pillSmall, { backgroundColor: c.card2 }, active && styles.pillSmallActive, active && { backgroundColor: c.ticketBubble, } ]}
                        >
                            <Text style={[styles.pillSmallText, { color: c.text }, active && styles.pillSmallTextActive, active && { color: c.yes } ]}>
                            {ss == "ACTIVE" ? "ACTIVE" : ss == 'PENDING' ? 'PENDING': ss == "REMOVED" ? "REMOVED" : "NA" }
                            </Text>
                        </Pressable>
                        );
                    })}
                </View>

                <View style={{ flexDirection: "row", gap: 12, margin: 30 }}>
                <Pressable
                    onPress={() => setEditOpen(false)}
                    style={({ pressed }) => [
                    {
                        flex: 1,
                        padding: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: c.border2,
                        alignItems: "center",
                        opacity: pressed ? 0.75 : 1,
                    },
                    ]}
                >
                    <Text style={{ color: c.text, fontWeight: "900" }}>Cancel</Text>
                </Pressable>

                <Pressable
                    onPress={async () => {
                        setStation((s) => {
                            if (!s) {
                            Alert.alert("Station is null");
                            return s;
                            }
                            return {
                            ...s,
                            buildingAbre: form.buildingAbre,
                            buildingName: form.buildingName,
                            buildingDetails: form.buildingDetails,
                            filterStatus: filterStatus,
                            stationStatus: stationStatus,
                            };
                        });

                        setEditOpen(false)
                    }}
                    style={({ pressed }) => [
                    {
                        flex: 1,
                        padding: 12,
                        borderRadius: 14,
                        alignItems: "center",
                        backgroundColor: c.text,
                        opacity: pressed ? 0.85 : 1,
                    },
                    ]}
                >
                    <Text style={{ color: c.bg, fontWeight: "900" }}>Save</Text>
                </Pressable>
                </View>
            </View>
        </Animated.View>
        </Modal>
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
        marginTop: 20,
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
