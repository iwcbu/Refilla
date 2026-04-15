import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, router } from "expo-router";

import ThemedBg from "../../../components/ThemedBg";
import ThemedCard2 from "../../../components/ThemedCard2";
import ThemedSubtext from "../../../components/ThemedSubtext";
import ThemedText from "../../../components/ThemedText";
import { useAdminAuth } from "../../../src/context/adminAuth";
import { useColors } from "../../../src/theme/colors";

export default function AdminLoginScreen() {
  const c = useColors();
  const {
    adminUser,
    isReady,
    isConfigured,
    isAdminSignedIn,
    signInWithPassword,
    signOut,
  } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    setIsSubmitting(true);

    try {
      const result = await signInWithPassword(email, password);
      if (!result.ok) {
        Alert.alert("Admin sign-in failed", result.error);
        return;
      }

      setPassword("");
      router.replace("/adminView");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);

    try {
      await signOut();
      setPassword("");
      Alert.alert("Signed out", "The admin session has been cleared.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: c.card2 },
          headerTintColor: c.text,
          title: "Admin Login",
          headerBackTitle: "Back",
        }}
      />

      <ThemedBg style={styles.screen}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>Admin access</ThemedText>
          <ThemedSubtext style={styles.subtitle}>
            Sign in with your Supabase admin email and password to unlock review tools.
          </ThemedSubtext>

          {!isConfigured ? (
            <ThemedCard2 style={styles.card}>
              <ThemedText style={styles.cardTitle}>Supabase not configured</ThemedText>
              <ThemedSubtext>
                Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` before using admin login.
              </ThemedSubtext>
            </ThemedCard2>
          ) : !isReady ? (
            <ThemedCard2 style={styles.card}>
              <View style={styles.loadingRow}>
                <ActivityIndicator />
                <ThemedSubtext>Loading admin session...</ThemedSubtext>
              </View>
            </ThemedCard2>
          ) : isAdminSignedIn ? (
            <ThemedCard2 style={styles.card}>
              <ThemedText style={styles.cardTitle}>Admin session active</ThemedText>
              <ThemedSubtext>
                Signed in as {adminUser?.email ?? "unknown admin"}.
              </ThemedSubtext>

              <Pressable style={styles.primaryButton} onPress={() => router.replace("/adminView")}>
                <ThemedText style={styles.primaryButtonText}>Open admin tools</ThemedText>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={handleSignOut}
                disabled={isSubmitting}
              >
                <ThemedText style={styles.secondaryButtonText}>Sign out</ThemedText>
              </Pressable>
            </ThemedCard2>
          ) : (
            <ThemedCard2 style={styles.card}>
              <ThemedText style={styles.cardTitle}>Supabase admin sign-in</ThemedText>

              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="admin@email.com"
                placeholderTextColor={c.subtext}
                style={[
                  styles.input,
                  { backgroundColor: c.bg, color: c.text, borderColor: c.border2 },
                ]}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Password"
                placeholderTextColor={c.subtext}
                style={[
                  styles.input,
                  { backgroundColor: c.bg, color: c.text, borderColor: c.border2 },
                ]}
              />

              <Pressable
                style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
                onPress={handleSignIn}
                disabled={isSubmitting}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </ThemedText>
              </Pressable>

              <ThemedSubtext>
                Passwords are verified by Supabase Auth and stored hashed there, not in local SQLite.
              </ThemedSubtext>
            </ThemedCard2>
          )}
        </View>
      </ThemedBg>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
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
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
