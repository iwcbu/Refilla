import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  UIManager,
  View,
  KeyboardAvoidingView,

} from "react-native";


import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemedBg from "../../components/ThemedBg";
import ThemedCard2 from "../../components/ThemedCard2";
import ThemedSubtext from "../../components/ThemedSubtext";
import ThemedText from "../../components/ThemedText";
import { useAuth } from "../../src/context/auth";
import { getAccountSummary } from "../../src/features/account/accountService";
import { PROFILE_EMOJIS } from "../../src/features/account/profileEmojis";
import {
  createAndJoinOrganization,
  getOrganizationSummaryForUser,
} from "../../src/features/account/organizationService";
import { useColors } from "../../src/theme/colors";
import { getUserByUsername, updateUser } from "../../src/db/userRepo";
import { listAllOrgIds, OrganizationRow, syncOrganizations } from "../../src/db/organizationRepo";
import {
  listOrganizationIdsForUser,
  toggleOrganizationMembership,
} from "../../src/db/userOrganizationsRepo";

export default function AccountProfileScreen() {
  const c = useColors();
  const { currentUser, refreshCurrentUser } = useAuth();
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [avatarEmoji, setAvatarEmoji] = useState(currentUser?.avatar_emoji ?? "🙂");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [organizationPickerOpen, setOrganizationPickerOpen] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState<string>("");
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<number[]>([]);
  const [availableOrganizations, setAvailableOrganizations] = useState<OrganizationRow[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getAccountSummary>> | null>(null);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOrganizations() {
      await syncOrganizations();
      const organizations = listAllOrgIds();
      if (mounted) {
        setAvailableOrganizations(organizations);
      }
    }

    loadOrganizations();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUsername(currentUser?.username ?? "");
    setAvatarEmoji(currentUser?.avatar_emoji ?? "🙂");
    setSelectedOrganizationIds(
      currentUser ? listOrganizationIdsForUser(currentUser.id) : []
    );
  }, [currentUser?.avatar_emoji, currentUser?.username]);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      if (!currentUser) {
        if (mounted) {
          setSummary(null);
        }
        return;
      }

      const nextSummary = await getAccountSummary(currentUser.id);
      if (mounted) {
        setSummary(nextSummary);
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, [currentUser, selectedOrganizationIds]);

  const normalizedOrgQuery = newOrganizationName.trim().toLowerCase();  
  
  const matchingOrganizations = useMemo(() => {
    if (!normalizedOrgQuery) {
      return availableOrganizations.slice(0, 8);
    }

    return availableOrganizations
      .filter((organization: OrganizationRow) =>
        organization.name == null ? true : organization.name.toLowerCase().includes(normalizedOrgQuery)
      )
      .slice(0, 12);
  }, [availableOrganizations, normalizedOrgQuery]);



  const exactOrganizationMatch = useMemo(
    () =>
      availableOrganizations.find(
        (organization: OrganizationRow) =>
          organization.name ? organization.name.toLowerCase() === normalizedOrgQuery : false
      ) ?? null,
    [availableOrganizations, normalizedOrgQuery]
  );



  const organizationSummary = useMemo(
    () => (currentUser ? getOrganizationSummaryForUser(currentUser.id) : null),
    [currentUser, selectedOrganizationIds, availableOrganizations]
  );



  const toggleDropdown = (setter: Dispatch<SetStateAction<boolean>>) => {
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

  const handleToggleOrganization = (organizationId: number) => {
    if (!currentUser) {
      router.replace("/account/login/login");
      return;
    }

    toggleOrganizationMembership(currentUser.id, organizationId);
    setSelectedOrganizationIds(listOrganizationIdsForUser(currentUser.id));
  };

  const handleCreateOrganization = async () => {
    if (!currentUser) {
      router.replace("/account/login/login");
      return;
    }

    if (!newOrganizationName.trim()) {
      Alert.alert("Missing organization name", "Enter an organization name to create or join it.");
      return;
    }

    try {
      if (exactOrganizationMatch) {
        toggleOrganizationMembership(currentUser.id, exactOrganizationMatch.id);
      } else {
        await createAndJoinOrganization(currentUser.id, newOrganizationName);
      }

      setNewOrganizationName("");
      await syncOrganizations();
      setAvailableOrganizations(listAllOrgIds());
      setSelectedOrganizationIds(listOrganizationIdsForUser(currentUser.id));
    } catch (error) {
      Alert.alert("Could not join organization", "Please try again.");
    }
  };

  const handleSave = () => {
    if (!currentUser) {
      router.replace("/account/login/login");
      return;
    }

    const normalizedUsername = username.trim().replace(/^@+/, "").replace(/\s+/g, "_");

    if (!normalizedUsername) {
      Alert.alert("Missing username", "Please enter a username.");
      return;
    }

    const existingUser = getUserByUsername(normalizedUsername);
    if (existingUser && existingUser.id !== currentUser.id) {
      Alert.alert("Username unavailable", "That username is already in use.");
      return;
    }

    updateUser(currentUser.id, {
      username: normalizedUsername,
      avatar_emoji: avatarEmoji,
    });
    refreshCurrentUser();
    Alert.alert("Profile updated", "Your profile details have been saved.");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: c.card2 },
          headerTintColor: c.text,
          title: "Profile Settings",
          headerBackTitle: "Back",
        }}
      />

      <ThemedBg style={styles.screen}>
        <KeyboardAvoidingView
          style={{ flex:1 }}
          behavior="padding"
          keyboardVerticalOffset={-200}
        >
          <ScrollView 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false} 
            
          >
            <ThemedText style={styles.title}>Profile settings</ThemedText>
            <ThemedSubtext style={styles.subtitle}>
              Update the local profile details shown across Refilla.
            </ThemedSubtext>

            <ThemedCard2 style={styles.card}>
              <Pressable
                onPress={() => toggleDropdown(setEmojiPickerOpen)}
                style={styles.dropdownHeader}
              >
                <View style={styles.dropdownTitleWrap}>
                  <ThemedText style={styles.cardTitle}>Profile emoji</ThemedText>
                  <ThemedSubtext>
                    {emojiPickerOpen ? "Hide emoji choices" : "Show emoji choices"}
                  </ThemedSubtext>
                </View>

                <Ionicons
                  name={emojiPickerOpen ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20}
                  color={c.text}
                />
              </Pressable>

              <View style={styles.selectedEmojiWrap}>
                <ThemedText style={styles.selectedEmoji}>{avatarEmoji}</ThemedText>
                <ThemedSubtext>Pick the emoji that represents you best.</ThemedSubtext>
              </View>

              {emojiPickerOpen ? (
                <View style={styles.emojiGrid}>
                  {PROFILE_EMOJIS.map((emoji) => {
                    const active = emoji === avatarEmoji;

                    return (
                      <Pressable
                        key={emoji}
                        onPress={() => setAvatarEmoji(emoji)}
                        style={[
                          styles.emojiButton,
                          { backgroundColor: c.bg, borderColor: c.border2 },
                          active && styles.emojiButtonActive,
                        ]}
                      >
                        <ThemedText style={styles.emojiButtonText}>{emoji}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </ThemedCard2>

            <ThemedCard2 style={styles.card}>
              <ThemedText style={styles.cardTitle}>Username</ThemedText>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="username"
                placeholderTextColor={c.subtext}
                style={[styles.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border2 }]}
              />

              <Pressable style={styles.primaryButton} onPress={handleSave}>
                <ThemedText style={styles.primaryButtonText}>Save profile</ThemedText>
              </Pressable>
            </ThemedCard2>

            <ThemedCard2 style={styles.card}>
              <Pressable
                onPress={() => toggleDropdown(setOrganizationPickerOpen)}
                style={styles.dropdownHeader}
              >
                <View style={styles.dropdownTitleWrap}>
                  <ThemedText style={styles.cardTitle}>Organizations</ThemedText>
                  <ThemedSubtext>
                    {organizationPickerOpen
                      ? "Hide org search and join tools"
                      : "Show org search and join tools"}
                  </ThemedSubtext>
                </View>

                <Ionicons
                  name={organizationPickerOpen ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20}
                  color={c.text}
                />
              </Pressable>

              <ThemedText style={styles.sectionLabel}>Joined organizations</ThemedText>
              <View style={styles.orgChipWrap}>
                {organizationSummary?.organizations.map((organization) => (
                  <Pressable
                    key={organization.id}
                    onPress={() => handleToggleOrganization(organization.id)}
                    style={[
                      styles.orgChip,
                      { borderColor: c.border2, backgroundColor: c.bg },
                      styles.orgChipActive,
                    ]}
                  >
                    <ThemedText style={[styles.orgChipText, styles.orgChipTextActive]}>
                      {organization.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {organizationSummary?.count ? (
                <ThemedSubtext>
                  Joined organizations: {organizationSummary.count}
                </ThemedSubtext>
              ) : (
                <ThemedSubtext>No organizations joined yet.</ThemedSubtext>
              )}

              {organizationPickerOpen ? (
                <View style={styles.dropdownSection}>
                  <ThemedSubtext>
                    Join organizations to view fountains restricted to those groups.
                  </ThemedSubtext>

                  <View style={styles.organizationCreateRow}>
                    <TextInput
                      value={newOrganizationName}
                      onChangeText={setNewOrganizationName}
                      autoCorrect={false}
                      placeholder="Search organizations"
                      placeholderTextColor={c.subtext}
                      style={[
                        styles.input,
                        styles.organizationInput,
                        { backgroundColor: c.bg, color: c.text, borderColor: c.border2 },
                      ]}
                    />

                    <Pressable style={styles.secondaryButton} onPress={handleCreateOrganization}>
                      <ThemedText style={styles.secondaryButtonText}>
                        {exactOrganizationMatch ? "Join" : "Create"}
                      </ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.searchResultsWrap}>
                    {matchingOrganizations.map((organization) => {
                      const active = selectedOrganizationIds.includes(organization.id);

                      return (
                        <Pressable
                          key={organization.id}
                          onPress={() => handleToggleOrganization(organization.id)}
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
                              {active ? "Joined organization" : "Tap to join"}
                            </ThemedSubtext>
                          </View>

                          <ThemedText style={styles.searchResultAction}>
                            {active ? "Joined" : "Join"}
                          </ThemedText>
                        </Pressable>
                      );
                    })}

                    {matchingOrganizations.length === 0 && normalizedOrgQuery ? (
                      <ThemedSubtext>
                        No matching organizations found. Use Create to add "{newOrganizationName.trim()}".
                      </ThemedSubtext>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </ThemedCard2>

            <ThemedCard2 style={styles.card}>
              <ThemedText style={styles.cardTitle}>Profile activity</ThemedText>
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Points</ThemedText>
                <ThemedText>{currentUser?.points ?? 0}</ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Tickets submitted</ThemedText>
                <ThemedText>{summary?.ticketsSubmitted ?? 0}</ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Favorite stations</ThemedText>
                <ThemedText>{summary?.favoriteStations ?? 0}</ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Organizations joined</ThemedText>
                <ThemedText>{summary?.organizationCount ?? 0}</ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Leaderboard rank</ThemedText>
                <ThemedText>{summary?.rank ? `#${summary.rank}` : "Unranked"}</ThemedText>
              </View>
            </ThemedCard2>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedBg>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
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
    paddingTop: 6,
  },
  selectedEmojiWrap: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  selectedEmoji: {
    fontSize: 42,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  emojiButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiButtonActive: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },
  emojiButtonText: {
    fontSize: 24,
  },
  organizationCreateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  organizationInput: {
    flex: 1,
  },
  orgChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
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
  orgChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  orgChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
  },
  orgChipText: {
    fontWeight: "600",
  },
  orgChipTextActive: {
    color: "#1d4ed8",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
