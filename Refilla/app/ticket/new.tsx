// app/ticket/new.tsx

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { router, Stack } from "expo-router";
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import { useNewMarkerLoc } from "../../src/context/newMarkerLocation";
import { useAuth } from "../../src/context/auth";

import type { TicketCategory, TicketPriority } from "../../types/ticket";
import { createStation } from "../../src/db/stationsRepo";
import { createTicket } from "../../src/db/ticketsRepo";

import { getUser, incrementUserPoints } from "../../src/db/userRepo";
import { type OrganizationRow, listAllOrgIds, syncOrganizations } from "../../src/db/organizationRepo";
import { listOrganizationsForUser } from "../../src/db/userOrganizationsRepo";
import {
  ensureBuilding,
  listBuildingsForOrganization,
  syncBuildingsForOrganization,
  type BuildingOption,
} from "../../src/db/buildingsRepo";


import { useColors } from "../../src/theme/colors";
import ThemedText from "../../components/ThemedText";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedSubtext from '../../components/ThemedSubtext';




export default function NewTicket() {

  const c = useColors();
  const nml = useNewMarkerLoc();
  const { currentUser } = useAuth();


  // Ticket form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("NEW");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  const [orgId, setOrgId] = useState<number | null>(null);
  const [organizationPickerOpen, setOrganizationPickerOpen] = useState(false);
  const [organizationQuery, setOrganizationQuery] = useState("");
  const [buildingPickerOpen, setBuildingPickerOpen] = useState(false);
  const [buildingQuery, setBuildingQuery] = useState("");
  const [buildingVersion, setBuildingVersion] = useState(0);
  const [buildingAbre, setBuildingAbre] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [buildingDetails, setBuildingDetails] = useState("");
  const submittingProfile = currentUser ? getUser(currentUser.id) : null;
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [availableBuildings, setAvailableBuildings] = useState<BuildingOption[]>([]);
  
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOrganizations() {
      await syncOrganizations();
      const nextOrganizations = currentUser
        ? listOrganizationsForUser(currentUser.id)
        : listAllOrgIds();

      if (mounted) {
        setOrganizations(nextOrganizations);
      }
    }

    loadOrganizations();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    async function loadBuildings() {
      const buildings = await syncBuildingsForOrganization(orgId);
      if (mounted) {
        setAvailableBuildings(buildings);
      }
    }

    loadBuildings();

    return () => {
      mounted = false;
    };
  }, [orgId, buildingVersion]);

  const normalizedOrgQuery = organizationQuery.trim().toLowerCase();
  const matchingOrganizations = useMemo(() => {
    if (!normalizedOrgQuery) {
      return organizations.slice(0, 8);
    }

    return organizations
      .filter((organization) =>
        organization.name.toLowerCase().includes(normalizedOrgQuery)
      )
      .slice(0, 12);
  }, [normalizedOrgQuery, organizations]);
  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === orgId) ?? null,
    [orgId, organizations]
  );
  const normalizedBuildingQuery = buildingQuery.trim().toLowerCase();
  const matchingBuildings = useMemo(() => {
    if (!normalizedBuildingQuery) {
      return availableBuildings.slice(0, 8);
    }

    return availableBuildings
      .filter(
        (building) =>
          building.buildingName.toLowerCase().includes(normalizedBuildingQuery) ||
          building.buildingAbre.toLowerCase().includes(normalizedBuildingQuery)
      )
      .slice(0, 12);
  }, [availableBuildings, normalizedBuildingQuery]);
  const exactBuildingMatch = useMemo(
    () =>
      availableBuildings.find(
        (building) =>
          building.buildingName.toLowerCase() === normalizedBuildingQuery ||
          building.buildingAbre.toLowerCase() === normalizedBuildingQuery
      ) ?? null,
    [availableBuildings, normalizedBuildingQuery]
  );
  const hasBuildingSearchResults = matchingBuildings.length > 0;
  const canCreateBuilding = !!normalizedBuildingQuery && !hasBuildingSearchResults;

  const handleJoinNewOrgs = () => {
    router.replace("/account/profile");
  };

  const handleSelectOrganization = (nextOrgId: number | null) => {
    setOrgId(nextOrgId);
    setBuildingQuery("");
    setBuildingName("");
    setBuildingAbre("");
  };

  const handleCreateOrSelectBuilding = async () => {
    const normalizedName = buildingQuery.trim() || buildingName.trim();

    if (!normalizedName) {
      Alert.alert("Missing building", "Search for a building name or type a new one first.");
      return;
    }

    if (exactBuildingMatch) {
      setBuildingQuery(exactBuildingMatch.buildingName);
      setBuildingName(exactBuildingMatch.buildingName);
      setBuildingAbre(exactBuildingMatch.buildingAbre);
      return;
    }

    if (!canCreateBuilding) {
      Alert.alert("Choose an existing building", "Select one of the matching buildings from the results list.");
      return;
    }

    if (!buildingAbre.trim()) {
      Alert.alert(
        "Missing building abbreviation",
        "Add a building abbreviation before creating a new building."
      );
      return;
    }

    try {
      const createdBuilding = await ensureBuilding({
        organization_id: orgId,
        buildingName: normalizedName,
        buildingAbre: buildingAbre.trim().toUpperCase(),
      });

      setBuildingQuery(createdBuilding.buildingName);
      setBuildingName(createdBuilding.buildingName);
      setBuildingAbre(createdBuilding.buildingAbre);
      setBuildingVersion((value) => value + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Could not create building", message);
    }
  };

  const toggleDropdown = (
    setter: Dispatch<SetStateAction<boolean>>
  ) => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setter((value) => !value);
  };

  const showNewStationHelp = () => {
    Alert.alert(
      "New Station Help",
      "Use this screen to submit a ticket to create a new fountain.\n\n" +
        "• Map: long press to fine-tune the station location before submitting.\n" +
        "• Submitting profile: shows which profile will be saved as the ticket author.\n" +
        "• New station info: search for an existing building or create a new one, then add directions so people can find the fountain.\n" +
        "• Organization: choose Public to make the station visible to everyone, or select an organization to limit visibility to its members.\n" +
        "• Ticket details: add the title, description, category, and priority that explain why this station is being created.\n\n" +
        "When you submit, Refilla creates the station first and then saves the ticket under your current profile."
    );
  };


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

    if (!currentUser) {
      Alert.alert("Profile required", "Please choose a profile from the Profile tab before submitting a ticket.");
      router.push("/account/login/login");
      return;
    }

    const err = validate();
    if (err) {
      Alert.alert("Missing info", err);
      return;
    }

    try {
      await ensureBuilding({
        organization_id: orgId,
        buildingName: buildingName.trim(),
        buildingAbre: buildingAbre.trim().toUpperCase(),
      });

      const stationId = await createStation({
        lat: nml.markerLoc.latitude,
        lng: nml.markerLoc.longitude,
        organization_id: orgId,
        buildingAbre: buildingAbre.trim().toUpperCase(),
        buildingName: buildingName.trim(),
        buildingDetails: buildingDetails.trim(),
        filterStatus: "RED",
        stationStatus: "PENDING",
      });

      const ticketId = await createTicket({
        user_id: currentUser.id,
        author_profile_key: currentUser.profile_key,
        author_username: currentUser.username,
        author_avatar_emoji: currentUser.avatar_emoji,
        station_id: stationId,
        title: title.trim(),
        body: description.trim(),
        status: "OPEN",
        category,
        priority,
      });

      incrementUserPoints(currentUser.id, 10);
      Alert.alert("Submitted", `Your ticket (#${ticketId}) has been created.`);

      if (stationId) {
        router.replace({ pathname: `/station/${stationId}`});
      } else {
        router.back();
      }
    } catch (e) {
      Alert.alert(`Error`, "Could not submit ticket. Please try again.");
      console.log(e);
      
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
        headerRight: () => (
          <Pressable onPress={showNewStationHelp} hitSlop={10}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={c.text}
            />
          </Pressable>
        ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex:1 }}
        behavior="padding"
        keyboardVerticalOffset={-200}
      >
        <ScrollView style={[styles.screen, { backgroundColor: c.bg }]} contentContainerStyle={styles.content} automaticallyAdjustKeyboardInsets={true}>
          <ThemedText style={styles.title}>Add a New Station</ThemedText>
          <ThemedText style={styles.subtitle}>
            Create a ticket for an existing station, or add a new station and report the issue.
          </ThemedText>

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
                  This profile will be saved as the ticket author.
                </ThemedSubtext>
              </View>
            </View>
          </ThemedCard2>

          <ThemedCard2 style={styles.card}>
            <ThemedText style={styles.cardTitle}>New station info</ThemedText>
            


            {/* ========================================== */}
            {/*            ORGANiZATION PICKER             */}
            {/* ========================================== */}


            <Pressable
              onPress={() => toggleDropdown(setOrganizationPickerOpen)}
              style={styles.dropdownHeader}
            >
              <View style={styles.dropdownTitleWrap}>
                <ThemedText style={styles.label}>*Organization</ThemedText>
                <ThemedSubtext>
                  {organizationPickerOpen
                    ? "Hide organization search"
                    : "Show organization search"}
                </ThemedSubtext>
              </View>

              <Ionicons
                name={organizationPickerOpen ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
                color={c.text}
              />
            </Pressable>

            <View style={styles.selectedOrganizationWrap}>
              <Pressable
                onPress={() => handleSelectOrganization(null)}
                style={[
                  styles.pillSmall,
                  { backgroundColor: c.card2 },
                  orgId == null && styles.pillSmallActive,
                  orgId == null && { backgroundColor: c.ticketBubble },
                ]}
              >
                <Text
                  style={[
                    styles.pillSmallText,
                    { color: c.text },
                    orgId == null && { color: c.yes },
                  ]}
                >
                  Public
                </Text>
              </Pressable>

              {selectedOrganization ? (
                <Pressable
                  onPress={() => handleSelectOrganization(selectedOrganization.id)}
                  style={[
                    styles.pillSmall,
                    styles.pillSmallActive,
                    { backgroundColor: c.ticketBubble },
                  ]}
                >
                  <Text style={[styles.pillSmallText, { color: c.yes }]}>
                    {selectedOrganization.name}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {organizationPickerOpen ? (
              <View style={styles.dropdownSection}>
                <TextInput
                  value={organizationQuery}
                  onChangeText={setOrganizationQuery}
                  autoCorrect={false}
                  placeholder="Search your organizations"
                  placeholderTextColor={c.subtext}
                  style={[styles.input, { backgroundColor: c.bg, color: c.text }]}
                />

                <View style={styles.searchResultsWrap}>
                  {matchingOrganizations.map((organization) => {
                    const active = orgId === organization.id;

                    return (
                      <Pressable
                        key={organization.id}
                        onPress={() => handleSelectOrganization(organization.id)}
                        style={[
                          styles.searchResultRow,
                          { borderColor: c.border2, backgroundColor: c.bg },
                        ]}
                      >
                        <View style={styles.searchResultTextWrap}>
                          <ThemedText style={styles.searchResultTitle}>
                            {organization.name}
                          </ThemedText>
                          <ThemedSubtext>
                            {active ? "Selected organization" : "Tap to assign station"}
                          </ThemedSubtext>
                        </View>

                        <ThemedText style={styles.searchResultAction}>
                          {active ? "Selected" : "Use"}
                        </ThemedText>
                      </Pressable>
                    );
                  })}

                  {matchingOrganizations.length === 0 ? (
                    <>
                      <ThemedSubtext>No matching joined organizations found.</ThemedSubtext>
                  
                      <Pressable
                        style={[styles.secondaryActionButton, {marginTop: -20, marginBottom: 10}]}
                        onPress={handleJoinNewOrgs}
                      >
                        <ThemedText 
                          style={[
                            styles.secondaryActionButtonText, 
                            { color: c.yes,backgroundColor: c.ticketBubble }
                          ]}
                        >Want to join new Organizations?</ThemedText>
                      </Pressable>
                    </>
                  ) : null}
                </View>
              </View>
            ) : null}

            <ThemedSubtext style={{ fontStyle: "italic", fontSize: 12, marginTop: -3, marginBottom: 10, }}>
              Public stations are visible to everyone. Organization stations are only visible to members.
            </ThemedSubtext>


            {/* ========================================== */}
            {/*               BUILDING PICKER              */}
            {/* ========================================== */}

            <Pressable
              onPress={() => toggleDropdown(setBuildingPickerOpen)}
              style={styles.dropdownHeader}
            >
              <View style={styles.dropdownTitleWrap}>
                <ThemedText style={styles.label}>*Building</ThemedText>
                <ThemedSubtext>
                  {buildingPickerOpen ? "Hide building search" : "Show building search"}
                </ThemedSubtext>
              </View>

              <Ionicons
                name={buildingPickerOpen ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
                color={c.text}
              />
            </Pressable>

            <View style={[styles.selectedBuildingWrap, {backgroundColor: c.ticketBubble, borderColor: c.border}]}>
              {buildingName && (
                <View style={styles.selectedBuildingCard}>
                  <ThemedText style={[styles.selectedBuildingTitle, {color: c.bg}]}>
                    {buildingAbre || "N/A"} • {buildingName}
                  </ThemedText>
                  <ThemedSubtext style={{color: c.bg2}}>
                    {exactBuildingMatch ? "Existing building selected" : "New building draft"}
                  </ThemedSubtext>
                </View>
              )}
            </View>

            {buildingPickerOpen ? (
              <View style={styles.dropdownSection}>
                <View style={styles.organizationCreateRow}>
                  <TextInput
                    value={buildingQuery}
                    onChangeText={(value) => {
                      setBuildingQuery(value);
                      setBuildingName(value);

                      const exactMatch = availableBuildings.find(
                        (building) =>
                          building.buildingName.toLowerCase() === value.trim().toLowerCase() ||
                          building.buildingAbre.toLowerCase() === value.trim().toLowerCase()
                      );

                      if (exactMatch) {
                        setBuildingName(exactMatch.buildingName);
                        setBuildingAbre(exactMatch.buildingAbre);
                      } else {
                        setBuildingAbre("");
                      }
                    }}
                    autoCorrect={false}
                    placeholder="Search buildings"
                    placeholderTextColor={c.subtext}
                    style={[
                      styles.input,
                      styles.organizationInput,
                      { backgroundColor: c.bg, color: c.text },
                    ]}
                  />

                  <Pressable
                    style={styles.secondaryActionButton}
                    onPress={handleCreateOrSelectBuilding}
                  >
                    {canCreateBuilding &&
                    <ThemedText 
                      style={[
                        styles.secondaryActionButtonText, 
                        { color: c.yes,backgroundColor: c.ticketBubble }
                      ]}
                    >Create</ThemedText>
                    }
                  </Pressable>
                </View>

                <View style={styles.searchResultsWrap}>
                  {matchingBuildings.map((building: BuildingOption) => {
                    const active =
                      building.buildingName === buildingName &&
                      building.buildingAbre === buildingAbre;

                    return (
                      <Pressable
                        key={building.key}
                        onPress={() => {
                          setBuildingQuery(building.buildingName);
                          setBuildingName(building.buildingName);
                          setBuildingAbre(building.buildingAbre);
                        }}
                        style={[
                          styles.searchResultRow,
                          { borderColor: c.border2, backgroundColor: c.bg },
                        ]}
                      >
                        <View style={styles.searchResultTextWrap}>
                          <ThemedText style={styles.searchResultTitle}>
                            {building.buildingName}
                          </ThemedText>
                          <ThemedSubtext>{building.buildingAbre}</ThemedSubtext>
                        </View>

                        <ThemedText style={styles.searchResultAction}>
                          {active ? "Selected" : "Use"}
                        </ThemedText>
                      </Pressable>
                    );
                  })}

                  {canCreateBuilding ? (
                    <View style={styles.createBuildingWrap}>
                      <ThemedText style={styles.label}>*Building abbreviation</ThemedText>
                      <TextInput
                        value={buildingAbre}
                        onChangeText={setBuildingAbre}
                        placeholder="e.g. CAS"
                        placeholderTextColor={c.subtext}
                        style={[styles.input, { backgroundColor: c.bg, color: c.text }]}
                        autoCapitalize="characters"
                        />
                        <ThemedSubtext>
                          No buildings matched "{buildingQuery.trim()}". Add an abbreviation to create it.
                        </ThemedSubtext>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            <ThemedText style={styles.label}>*Directions / details</ThemedText>
            <TextInput
              value={buildingDetails}
              onChangeText={setBuildingDetails}
              placeholder= {buildingAbre == "" ? "Where is it exactly?" : `Where is it exactly in ${buildingAbre}?`}
              placeholderTextColor={c.subtext}
              style={[styles.input, styles.textArea, { backgroundColor: c.bg, color: c.text }]}
              multiline
            />


            
          </ThemedCard2>

          <ThemedCard2 style={styles.card}>
            <ThemedText style={styles.cardTitle}>Ticket details</ThemedText>

            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Short summary"
              placeholderTextColor={c.subtext}
              style={[styles.input, { backgroundColor: c.bg, color: c.text }]}
            />

            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Any helpful context?" 
              placeholderTextColor={c.subtext}
              style={[styles.input, styles.textArea, { backgroundColor: c.bg, color: c.text }]}
              multiline
            />

          </ThemedCard2>

          <Pressable onPress={submit} style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}>
            <Text style={styles.submitText}>Submit ticket</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

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
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: "#344e8b", borderColor: "#344e8b" },
  toggleText: { fontWeight: "800", color: "#131d34" },
  toggleTextActive: { color: "#ffffff" },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dropdownTitleWrap: {
    flex: 1,
    gap: 2,
  },
  dropdownSection: {
    gap: 12,
  },

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
  cardTitle: { fontSize: 14, fontWeight: "900" },

  label: { fontSize: 12, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  organizationCreateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  organizationInput: {
    flex: 1,
  },
  selectedOrganizationWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedBuildingWrap: {
    borderRadius: 15,
    gap: 8,
  },
  selectedBuildingCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedBuildingTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  searchResultsWrap: {
    gap: 8,
  },
  searchResultRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  searchResultTextWrap: {
    flex: 1,
    gap: 2,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  searchResultAction: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },
  secondaryActionButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionButtonText: {
    color: "#ffffff",
    padding: 10,
    borderRadius: 10,
    fontWeight: "700",
    fontSize: 14,
  },
  createBuildingWrap: {
    gap: 8,
    paddingTop: 4,
  },
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
