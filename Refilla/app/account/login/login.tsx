import { useMemo, useState } from "react";
import {
  Alert,
  Image,
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
import { useAuth } from "../../../src/context/auth";
import { useColors } from "../../../src/theme/colors";

type Mode = "sign_in" | "create";

export default function AccountLoginScreen() {
  const c = useColors();
  const { currentUser, createAccount, signIn } = useAuth();
  const [mode, setMode] = useState<Mode>("sign_in");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "sign_in" ? "Sign in to your profile" : "Create a new profile"),
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === "sign_in"
        ? "Use your email and password to open your Refilla profile on this device."
        : "Create a Supabase-backed profile so your tickets and points can follow you across devices.",
    [mode]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (mode === "sign_in") {
        const result = await signIn(email, password);
        if (!result.ok) {
          Alert.alert("Could not sign in", result.error);
          return;
        }
      } else {
        const result = await createAccount({ email, password, username });
        if (!result.ok) {
          Alert.alert("Could not create profile", result.error);
          return;
        }
      }

      setPassword("");
      router.replace("/(tabs)/account");
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
          title: "Profile Center",
          headerBackTitle: "Back",
        }}
      />

      <ThemedBg style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <View style={styles.titleBox}>
              <ThemedText style={styles.title}>Profile center</ThemedText>
              <Pressable onPress={() => router.push("./adminLogin")}>
                <Image
                  source={
                    !c.yes
                      ? require("../../../assets/admin-icons/lightmode.png")
                      : require("../../../assets/admin-icons/darkmode.png")
                  }
                  style={styles.adminIcon}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            <ThemedSubtext style={styles.subtitle}>
              {currentUser
                ? `Signed in as @${currentUser.username}.`
                : "Use your Supabase-backed profile to access synced tickets, points, and station activity."}
            </ThemedSubtext>
          </View>

          <View style={styles.toggleRow}>
            <Pressable onPress={() => setMode("sign_in")}>
              <ThemedText style={{ color: mode === "sign_in" ? c.text : c.subtext }}>
                Sign in
              </ThemedText>
              {mode === "sign_in" ? (
                <View style={[styles.underline, { backgroundColor: c.text }]} />
              ) : null}
            </Pressable>

            <Pressable onPress={() => setMode("create")}>
              <ThemedText style={{ color: mode === "create" ? c.text : c.subtext }}>
                Create profile
              </ThemedText>
              {mode === "create" ? (
                <View style={[styles.underline, { backgroundColor: c.text }]} />
              ) : null}
            </Pressable>
          </View>

          <ThemedCard2 style={styles.card}>
            <ThemedText style={styles.cardTitle}>{title}</ThemedText>
            <ThemedSubtext>{subtitle}</ThemedSubtext>

            {mode === "create" ? (
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="username"
                placeholderTextColor={c.subtext}
                style={[
                  styles.input,
                  { backgroundColor: c.bg, color: c.text, borderColor: c.border2 },
                ]}
              />
            ) : null}

            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="email"
              placeholderTextColor={c.subtext}
              style={[
                styles.input,
                { backgroundColor: c.bg, color: c.text, borderColor: c.border2 },
              ]}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="password"
              placeholderTextColor={c.subtext}
              style={[
                styles.input,
                { backgroundColor: c.bg, color: c.text, borderColor: c.border2 },
              ]}
            />

            <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={isSubmitting}>
              <ThemedText style={styles.primaryButtonText}>
                {isSubmitting
                  ? mode === "sign_in"
                    ? "Signing in..."
                    : "Creating..."
                  : mode === "sign_in"
                    ? "Sign in"
                    : "Create profile"}
              </ThemedText>
            </Pressable>
          </ThemedCard2>
        </View>
      </ThemedBg>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  headerBlock: { gap: 12 },
  titleBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminIcon: { width: 50, height: 50, borderRadius: 10 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  toggleRow: { flexDirection: "row", gap: 16 },
  underline: { height: 2, marginTop: 3 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
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
});
