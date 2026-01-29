import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import type { Station } from "../../types/station";
import type {
  CreateStationPayload,
  CreateTicketPayload,
  TicketCategory,
  TicketPriority,
} from "../../types/ticket";

// demo stations replace with API fetch
const DEMO_STATIONS: Station[] = [
  {
    id: "1",
    lat: 42.3505,
    lng: -71.1054,
    buildingAbre: "GSU",
    buildingName: "George Sherman Union",
    buildingDetails: "1st floor, middle of cafe",
    filterStatus: "GREEN",
    stationStatus: "ACTIVE",
    bottlesSaved: 1280,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    lat: 42.3493,
    lng: -71.1002,
    buildingAbre: "CAS",
    buildingName: "CAS",
    buildingDetails: "Basement hallway near bathrooms",
    filterStatus: "YELLOW",
    stationStatus: "ACTIVE",
    bottlesSaved: 30000,
    lastUpdated: new Date().toISOString(),
  },
];

type Mode = "EXISTING" | "NEW";

export default function NewTicket() {
  const params = useLocalSearchParams<{ stationId?: string }>();

  const [stations] = useState<Station[]>(DEMO_STATIONS);

  // If user came from station detail, default to EXISTING + preselect stationId
  const initialMode: Mode = params.stationId ? "EXISTING" : "EXISTING";
  const [mode, setMode] = useState<Mode>(initialMode);

  const [selectedStationId, setSelectedStationId] = useState<string | undefined>(
    params.stationId
  );

  // Ticket form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("OTHER");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  // New station form (only if mode === NEW)
  const [buildingAbre, setBuildingAbre] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [buildingDetails, setBuildingDetails] = useState("");

  // If stationId param changes, reflect it
  useEffect(() => {
    if (params.stationId) {
      setSelectedStationId(params.stationId);
      setMode("EXISTING");
    }
  }, [params.stationId]);

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === selectedStationId),
    [stations, selectedStationId]
  );

  function validate(): string | null {
    if (!title.trim()) return "Please add a short title.";
    if (title.trim().length < 4) return "Title is too short.";
    if (!description.trim()) return "Please describe the issue.";
    if (description.trim().length < 10) return "Description is too short.";

    if (mode === "EXISTING") {
      if (!selectedStationId) return "Please select a station.";
    } else {
      if (!buildingAbre.trim()) return "Please enter a building abbreviation.";
      if (!buildingName.trim()) return "Please enter a building name.";
      if (!buildingDetails.trim()) return "Please add directions/details.";
    }

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

    let stationIdToUse = selectedStationId;

    try {
      if (mode === "NEW") {
        const stationPayload: CreateStationPayload = {
          buildingAbre: buildingAbre.trim().toUpperCase(),
          buildingName: buildingName.trim(),
          buildingDetails: buildingDetails.trim(),
        };

        // TODO: call API: const createdStation = await api.createStation(stationPayload)
        // stationIdToUse = createdStation.id
        stationIdToUse = "new_station_id_demo";
      }

      ticket.stationId = stationIdToUse;

      // TODO: call API: const createdTicket = await api.createTicket(ticket)
      const createdTicketId = "new_ticket_id_demo";

      Alert.alert("Submitted", "Your ticket has been created.");

      // Navigate to station detail if we have an id
      if (stationIdToUse) {
        router.replace({ pathname: `/station/${stationIdToUse}`, params: { id: stationIdToUse } });
      } else {
        router.back();
      }
    } catch (e) {
      Alert.alert("Error", "Could not submit ticket. Please try again.");
    }
  }

  return (


    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Report an issue</Text>
      <Text style={styles.subtitle}>
        Create a ticket for an existing station, or add a new station and report the issue.
      </Text>

      {/* Mode toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setMode("EXISTING")}
          style={[styles.toggleBtn, mode === "EXISTING" && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, mode === "EXISTING" && styles.toggleTextActive]}>
            Existing station
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("NEW")}
          style={[styles.toggleBtn, mode === "NEW" && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, mode === "NEW" && styles.toggleTextActive]}>
            New station
          </Text>
        </Pressable>
      </View>

      {/* Existing station selector */}
      {mode === "EXISTING" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select a station</Text>

          <View style={styles.pills}>
            {stations.map((s) => {
              const active = s.id === selectedStationId;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedStationId(s.id)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {s.buildingAbre}
                  </Text>
                  <Text style={[styles.pillSub, active && styles.pillSubActive]} numberOfLines={1}>
                    #{s.id}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedStation && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>{selectedStation.buildingName}</Text>
              <Text style={styles.previewBody}>{selectedStation.buildingDetails}</Text>
            </View>
          )}
        </View>
      )}

      {/* New station form */}
      {mode === "NEW" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New station info</Text>

          <Text style={styles.label}>*Building abbreviation</Text>
          <TextInput
            value={buildingAbre}
            onChangeText={setBuildingAbre}
            placeholder="e.g. CAS"
            autoCapitalize="characters"
            style={styles.input}
          />

          <Text style={styles.label}>*Building name</Text>
          <TextInput
            value={buildingName}
            onChangeText={setBuildingName}
            placeholder="e.g. College of Arts & Sciences"
            style={styles.input}
          />

          <Text style={styles.label}>*Directions / details</Text>
          <TextInput
            value={buildingDetails}
            onChangeText={setBuildingDetails}
            placeholder= {buildingAbre == "" ? "Where is it exactly?" : `Where is it exactly in ${buildingAbre}?`}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>
      )}

      {/* Ticket form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ticket details</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Short summary"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Any helpful context?"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pills}>
          {([ "NEW STATION", "STATION DETAILS", "LEAK", "BROKEN", "FILTER", "OTHER" ] as TicketCategory[]).map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.pillSmall, active && styles.pillSmallActive]}
              >
                <Text style={[styles.pillSmallText, active && styles.pillSmallTextActive]}>
                  {c}
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
                style={[styles.pillSmall, active && styles.pillSmallActive]}
              >
                <Text style={[styles.pillSmallText, active && styles.pillSmallTextActive]}>
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Submit */}
      <Pressable onPress={submit} style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}>
        <Text style={styles.submitText}>Submit ticket</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </ScrollView>

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
});
