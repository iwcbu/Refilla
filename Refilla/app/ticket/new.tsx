import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert, } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { useColors } from "../../src/theme/colors";
import { MarkerLoc, useNewMarkerLoc } from "../../src/context/newMarkerLocation";

import type { Station } from "../../types/station";
import type { CreateStationPayload, CreateTicketPayload, TicketCategory, TicketPriority, } from "../../types/ticket";
import { createStation } from "../../src/db/stationsRepo";
import { createTicket, TicketRow } from "../../src/db/ticketsRepo";


export default function NewTicket() {

  const c = useColors();
  const nml = useNewMarkerLoc();


  // Ticket form
  const [id, setId] = useState<number | null>(null)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("NEW");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [buildingAbre, setBuildingAbre] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [buildingDetails, setBuildingDetails] = useState("");


  function validate(): string | null {
    
    if (!title.trim()) return "Please add a short title.";
    if (title.trim().length < 4) return "Title is too short.";
    if (!description.trim()) return "Please describe the issue.";
    if (description.trim().length < 5) return "Description is too short.";
    if (!buildingAbre.trim()) return "Please enter a building abbreviation.";
    if (!buildingName.trim()) return "Please enter a building name.";
    if (!buildingDetails.trim()) return "Please add directions/details.";

    return null;
  }

  async function submit() {

    if (nml.markerLoc?.latitude == null || nml.markerLoc?.longitude == null) {
      Alert.alert("Missing info please set a location");
      return
    }

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
        const stationPayload: CreateStationPayload = {
          buildingAbre: buildingAbre.trim().toUpperCase(),
          buildingName: buildingName.trim(),
          buildingDetails: buildingDetails.trim(),
        };

        // TODO: call API: const createdStation = await api.createStation(stationPayload)
        // stationIdToUse = createdStation.id

        const id = createStation({
          lat: nml.markerLoc?.latitude,
          lng: nml.markerLoc?.longitude,

          buildingAbre: buildingAbre,
          buildingName: buildingName,
          buildingDetails: buildingDetails,

          filterStatus: 'RED',
          stationStatus: 'PENDING',
        })
        
      ticket.stationId

      // TODO: call API: const createdTicket = await api.createTicket(ticket)
      const ticketId = createTicket({
        user_id: 1, 
        station_id: id,
        title: ticket.title,
        body: ticket.description,
        status: "OPEN",
        category: ticket.category,
        priority: ticket.priority,
      });

      Alert.alert(`Submitted", "Your ticket (#${ticketId}) has been created.`);

      if (id) {
        router.replace({ pathname: `/station/${id}`});
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
                title: "New Station",
                headerBackTitle: "Back",
                }}
      />
      <ScrollView style={[styles.screen, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>Add a New Station</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>
          Create a ticket for an existing station, or add a new station and report the issue.
        </Text>

        <View style={styles.mapWrap}>
            <MapView
                showsUserLocation
                style={styles.map}
                initialRegion={{
                  latitude: Number(nml.markerLoc?.latitude),
                  longitude: Number(nml.markerLoc?.longitude),
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onLongPress={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  nml.setNewMarkerLoc({latitude, longitude})
                }
              }

                >
                <Marker
                    coordinate={{
                      latitude: Number(nml.markerLoc?.latitude),
                      longitude: Number(nml.markerLoc?.longitude),
                    }}
                    image={require("../../assets/station-icon.png")}
                    />
            </MapView>
        
        </View>

        <View style={[styles.card, { backgroundColor: c.card2 }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>New station info</Text>

            <Text style={[styles.label, { color: c.subtext }]}>*Building abbreviation</Text>
            <TextInput
              value={buildingAbre}
              onChangeText={setBuildingAbre}
              placeholder="e.g. CAS"
              placeholderTextColor={c.subtext}
              style={[styles.input, { backgroundColor: c.bg }]}
              autoCapitalize="characters"
            />

            <Text style={[styles.label, { color: c.subtext }]}>*Building name</Text>
            <TextInput
              value={buildingName}
              onChangeText={setBuildingName}
              placeholder="e.g. College of Arts & Sciences"
              placeholderTextColor={c.subtext}
              style={[styles.input, { backgroundColor: c.bg }]}
            />

            <Text style={[styles.label, { color: c.subtext }]}>*Directions / details</Text>
            <TextInput
              value={buildingDetails}
              onChangeText={setBuildingDetails}
              placeholder= {buildingAbre == "" ? "Where is it exactly?" : `Where is it exactly in ${buildingAbre}?`}
              placeholderTextColor={c.subtext}
              style={[styles.input, styles.textArea, { backgroundColor: c.bg }]}
              multiline
            />
          </View>

        <View style={[styles.card, { backgroundColor: c.card2 }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Ticket details</Text>

          <Text style={[styles.label, { color: c.subtext }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Short summary"
            placeholderTextColor={c.subtext}
            style={[styles.input, { backgroundColor: c.bg }]}
          />

          <Text style={[styles.label, { color: c.text }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Any helpful context?" 
            placeholderTextColor={c.subtext}
            style={[styles.input, styles.textArea, { backgroundColor: c.bg }]}
            multiline
          />

        </View>

        <Pressable onPress={submit} style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}>
          <Text style={styles.submitText}>Submit ticket</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
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
});
