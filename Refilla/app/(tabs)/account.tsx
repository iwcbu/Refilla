// app/(tabs)/account.tsx

import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';

import { useColors } from '../../src/theme/colors';
import { usePrefs } from '../../src/context/prefs';
import { Ionicons } from '@expo/vector-icons';

import ThemedBg from '../../components/ThemedBg';
import ThemedCard2 from '../../components/ThemedCard2';
import ThemedText from '../../components/ThemedText';
import ThemedSubtext from '../../components/ThemedSubtext';

type PrefKey =
  | 'dark'
  | 'metric'
  | 'pushNotifications'
  | 'showCallouts';

type Preferences = Record<PrefKey, boolean>;

export default function Settings() {
  const c = useColors();
  const { prefs, setPref } = usePrefs();
  

  const handleLogout = () => {
    // Implement logout logic here, e.g., clearing auth tokens, navigating to login screen, etc.
    console.log('User logged out');
  }

  return (
    <ThemedBg style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
            <ThemedCard2 style={styles.profileAvatar}>
                <ThemedText style={styles.avatarEmoji}>🐧</ThemedText>
            </ThemedCard2>

            <View style={styles.profileTextBox}>
                <ThemedText style={styles.profilePageTitle}>@iwc</ThemedText>
                <ThemedSubtext style={styles.profileSubtitle}>
                Account preferences below
                </ThemedSubtext>
            </View>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Profile</ThemedText>

                <ThemedCard2 style={styles.card}>
                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Username: @iwc</ThemedText>
                    </View>

                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Profile Settings</ThemedText>
                    <Ionicons name="chevron-forward-outline" size={24} color={c.border2} />
                    </View>

                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Tickets Submitted: 1</ThemedText>
                    <Ionicons name="chevron-forward-outline" size={24} color={c.border2} />
                    </View>
                </ThemedCard2>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Social</ThemedText>

                <ThemedCard2 style={styles.card}>
                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>FillaPoints: 75</ThemedText>
                    </View>

                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Leaderboard</ThemedText>
                    <Ionicons name="chevron-forward-outline" size={24} color={c.border2} />
                    </View>
                </ThemedCard2>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

                <ThemedCard2 style={styles.card}>
                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Dark Mode</ThemedText>
                    <Switch
                        value={prefs.dark}
                        onValueChange={(v) => setPref('dark', v)}
                    />
                    </View>

                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Metric Units</ThemedText>
                    <Switch
                        value={prefs.metric}
                        onValueChange={(v) => setPref('metric', v)}
                    />
                    </View>

                    <View style={styles.prefBox}>
                    <ThemedText style={styles.prefBoxText}>Push Notifications</ThemedText>
                    <Switch
                        value={prefs.pushNotifications}
                        onValueChange={(v) => setPref('pushNotifications', v)}
                    />
                    </View>
                </ThemedCard2>
            </View>
            <View style={styles.section}>
                <Pressable onPress={ () => handleLogout() }>
                    <ThemedText style={styles.sectionTitle}>Logout</ThemedText>
                </Pressable>
            </View>
            
        </ScrollView>
    </ThemedBg>
  );
}

const styles = StyleSheet.create({

    //screen
    container: { paddingBottom: 28 },
    screen: { flex: 1, padding: 16, gap: 16 },

    // profile header
    textBox: { marginTop: 4, marginBottom: 12, },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 6,
    },
    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 30 },
    profileTextBox: {justifyContent: 'center'},
    profilePageTitle: { fontSize: 22, fontWeight: '700' },
    profileSubtitle: { fontSize: 14, marginTop: 2 },

    // sections
    section: { gap: 8, marginTop: 20 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    card: { padding: 14, borderRadius: 14, overflow: 'hidden' },

    // preferences
    prefBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    prefBoxText: { fontSize: 18, padding: 5 },
});