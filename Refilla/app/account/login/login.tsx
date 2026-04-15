import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Image
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";

import ThemedBg from "../../../components/ThemedBg";
import ThemedCard2 from '../../../components/ThemedCard2';
import ThemedSubtext from "../../../components/ThemedSubtext";
import ThemedText from '../../../components/ThemedText';
import { useAuth } from "../../../src/context/auth";
import { listUsers, type UserRow } from "../../../src/db/userRepo";
import { useColors } from "../../../src/theme/colors";

export default function AccountLoginScreen() {
  const c = useColors();
  const { currentUser, createAccount, signIn } = useAuth();
  const [users, setUsers] = useState<UserRow[]>(() => listUsers());
  const [username, setUsername] = useState("");

  const refreshUsers = useCallback(() => {
    setUsers(listUsers());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUsers();
    }, [refreshUsers])
  );

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users]
  );
  const canCreateProfile = users.length < 2;

  const handleCreateAccount = async () => {
    const result = await createAccount(username);

    if (!result.ok) {
      Alert.alert("Could not create profile", result.error);
      return;
    }

    setUsername("");
    refreshUsers();
    router.replace("/(tabs)/account");
  };

  const handleSignIn = async (userId: number) => {
    await signIn(userId);
    router.replace("/(tabs)/account");
  };



  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: c.card2 },
          headerTintColor: c.text,
          title: "Profile Center",
          headerBackTitle: "Back",
        }}
      />

      <ThemedBg style={styles.screen}>
        <FlatList
          data={sortedUsers}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <View style={styles.titleBox}>
                <ThemedText style={styles.title}>Choose a profile</ThemedText>
                <Pressable
                  onPress={() => router.push('./adminLogin')}
                >
                  <Image
                    source={ !c.yes ? require('../../../assets/admin-icons/lightmode.png') : require('../../../assets/admin-icons/darkmode.png')}
                    style={{ width: 50, height: 50, borderRadius: 10, }}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
              <ThemedSubtext style={styles.subtitle}>
                Switch between local profiles or create a new one for this device.
              </ThemedSubtext>

              {canCreateProfile ? (
                <ThemedCard2 style={styles.card}>
                  <ThemedText style={styles.cardTitle}>Create a new profile</ThemedText>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="username"
                    placeholderTextColor={c.subtext}
                    style={[styles.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border2 }]}
                  />

                  <Pressable style={styles.primaryButton} onPress={handleCreateAccount}>
                    <ThemedText style={styles.primaryButtonText}>Create profile</ThemedText>
                  </Pressable>

                  {currentUser ? (
                    <ThemedSubtext style={styles.currentText}>
                      Current profile: @{currentUser.username}
                    </ThemedSubtext>
                  ) : (
                    <ThemedSubtext style={styles.currentText}>
                      No profile is currently selected.
                    </ThemedSubtext>
                  )}
                  <ThemedSubtext style={styles.currentText}>
                    This device is limited to 2 local profiles.
                  </ThemedSubtext>
                </ThemedCard2>
              ) : (
                <ThemedCard2 style={styles.card}>
                  <ThemedText style={styles.cardTitle}>Profile limit reached</ThemedText>
                  <ThemedSubtext>
                    This device already has 2 local profiles saved, so new profile creation is hidden.
                  </ThemedSubtext>
                </ThemedCard2>
              )}

              <ThemedText style={styles.sectionTitle}>Existing profiles</ThemedText>
            </View>
          }
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const isCurrentUser = currentUser?.id === item.id;

            return (
              <Pressable onPress={() => handleSignIn(item.id)}>
                <ThemedCard2 style={[styles.card, isCurrentUser && styles.activeCard]}>
                  <View style={styles.userRow}>
                    <View style={styles.userMeta}>
                      <ThemedText style={styles.username}>@{item.username}</ThemedText>
                      <ThemedSubtext>
                        {item.points} points
                      </ThemedSubtext>
                    </View>

                    <ThemedText style={styles.signInLabel}>
                      {isCurrentUser ? "Current" : "Sign in"}
                    </ThemedText>
                  </View>
                </ThemedCard2>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <ThemedCard2 style={styles.card}>
              <ThemedSubtext>No local profiles exist yet.</ThemedSubtext>
            </ThemedCard2>
          }
        />
      </ThemedBg>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  headerBlock: { gap: 12, marginBottom: 12 },
  titleBox: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',},
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  activeCard: {
    borderColor: "#2563eb",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
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
    fontSize: 15,
    fontWeight: "700",
  },
  currentText: {
    marginTop: 2,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  userMeta: {
    gap: 4,
  },
  username: {
    fontSize: 17,
    fontWeight: "700",
  },
  signInLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },
});
