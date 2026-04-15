// app/(tabs)/account.tsx

import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../../src/theme/colors';
import { usePrefs } from '../../src/context/prefs';
import { useAuth } from '../../src/context/auth';
import { getAccountSummary } from '../../src/features/account/accountService';

import ThemedBg from '../../components/ThemedBg';
import ThemedCard2 from '../../components/ThemedCard2';
import ThemedText from '../../components/ThemedText';
import ThemedSubtext from '../../components/ThemedSubtext';

function AccountRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const c = useColors();

  const content = (
    <View style={styles.rowContent}>
      <View style={styles.rowTextWrap}>
        <ThemedText style={styles.prefBoxText}>{label}</ThemedText>
        {value ? <ThemedSubtext style={styles.rowValue}>{value}</ThemedSubtext> : null}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward-outline" size={20} color={c.border2} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return <View style={styles.prefBox}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={styles.prefBox}>
      {content}
    </Pressable>
  );
}

export default function Settings() {
  const c = useColors();
  const { prefs, setPref } = usePrefs();
  const { currentUser, isReady, signOut } = useAuth();
  const [refreshTick, setRefreshTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshTick((value) => value + 1);
    }, [])
  );

  if (!isReady) {
    return (
      <ThemedBg style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="small" color={c.text} />
        <ThemedSubtext>Loading your profile...</ThemedSubtext>
      </ThemedBg>
    );
  }

  if (!currentUser) {
    return (
      <ThemedBg style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedCard2 style={styles.profileAvatar}>
              <Ionicons name="person-outline" size={28} color={c.text} />
            </ThemedCard2>

            <View style={styles.profileTextBox}>
              <ThemedText style={styles.profilePageTitle}>Signed out</ThemedText>
              <ThemedSubtext style={styles.profileSubtitle}>
                Select or create a local profile to manage favorites and tickets.
              </ThemedSubtext>
            </View>
          </View>

          <ThemedCard2 style={styles.card}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/account/login/login')}>
              <ThemedText style={styles.primaryButtonText}>Open profile center</ThemedText>
            </Pressable>
          </ThemedCard2>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
            <ThemedCard2 style={styles.card}>
              <View style={styles.prefBox2}>
                <ThemedText style={styles.prefBoxText}>Dark Mode</ThemedText>
                <Switch value={prefs.dark} onValueChange={(v) => setPref('dark', v)} />
              </View>

              <View style={styles.prefBox2}>
                <ThemedText style={styles.prefBoxText}>Metric Units</ThemedText>
                <Switch value={prefs.metric} onValueChange={(v) => setPref('metric', v)} />
              </View>

              <View style={styles.prefBox2}>
                <ThemedText style={styles.prefBoxText}>Push Notifications</ThemedText>
                <Switch
                  value={prefs.pushNotifications}
                  onValueChange={(v) => setPref('pushNotifications', v)}
                />
              </View>
            </ThemedCard2>
          </View>
        </ScrollView>
      </ThemedBg>
    );
  }

  const summary = getAccountSummary(currentUser.id);
  void refreshTick;

  const handleLogout = () => {
    Alert.alert('Log out?', 'You can choose a profile again from the Profile tab at any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <ThemedBg style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedCard2 style={styles.profileAvatar}>
            <ThemedText style={styles.avatarEmoji}>
              {currentUser.avatar_emoji}
            </ThemedText>
          </ThemedCard2>

          <View style={styles.profileTextBox}>
            <ThemedText style={styles.profilePageTitle}>@{currentUser.username}</ThemedText>
            <ThemedSubtext style={styles.profileSubtitle}>
              {summary.rank
                ? `Ranked #${summary.rank} of ${summary.totalUsers} users`
                : 'Profile preferences below'}
            </ThemedSubtext>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile</ThemedText>

          <ThemedCard2 style={styles.card}>
            <AccountRow label="Username" value={`@${currentUser.username}`} />
            <AccountRow label="Profile Emoji" value={currentUser.avatar_emoji} />
            <AccountRow
              label="Organizations"
              value={
                summary.organizationCount > 0
                  ? summary.organizations.map((org) => org.name).join(", ")
                  : "No organizations joined"
              }
            />
            <AccountRow
              label="Profile Settings"
              value="Edit your local profile details"
              onPress={() => router.push('/account/profile')}
            />
            <AccountRow
              label="Favorite Stations"
              value={`${summary.favoriteStations} saved`}
              onPress={() => router.push('/account/favorites')}
            />
          </ThemedCard2>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Social</ThemedText>

          <ThemedCard2 style={styles.card}>
            <AccountRow label="FillaPoints" value={`${currentUser.points} points`} />
            <AccountRow
              label="Tickets Submitted"
              value={`${summary.ticketsSubmitted} tickets`}
              onPress={() => router.push('/account/tickets')}
            />
            <AccountRow
              label="Leaderboard"
              value={summary.rank ? `Currently #${summary.rank}` : 'See all users'}
              onPress={() => router.push('/social/leaderboard')}
            />
          </ThemedCard2>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

          <ThemedCard2 style={styles.card}>
            <View style={styles.prefBox2}>
              <ThemedText style={styles.prefBoxText}>Dark Mode</ThemedText>
              <Switch value={prefs.dark} onValueChange={(v) => setPref('dark', v)} />
            </View>

            <View style={styles.prefBox2}>
              <ThemedText style={styles.prefBoxText}>Metric Units</ThemedText>
              <Switch value={prefs.metric} onValueChange={(v) => setPref('metric', v)} />
            </View>

            <View style={styles.prefBox2}>
              <ThemedText style={styles.prefBoxText}>Push Notifications</ThemedText>
              <Switch
                value={prefs.pushNotifications}
                onValueChange={(v) => setPref('pushNotifications', v)}
              />
            </View>
          </ThemedCard2>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Session</ThemedText>
          <ThemedCard2 style={styles.card}>
            <AccountRow
              label="Switch Profile"
              value="Choose or create another local profile"
              onPress={() => router.push('/account/login/login')}
            />
            <Pressable onPress={handleLogout} style={styles.prefBox}>
              <View style={styles.rowContent}>
                <View style={styles.rowTextWrap}>
                  <ThemedText style={[styles.prefBoxText, { color: '#dc2626' }]}>Log Out</ThemedText>
                  <ThemedSubtext style={styles.rowValue}>Clear the current local session</ThemedSubtext>
                </View>
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>
            </Pressable>
          </ThemedCard2>
        </View>
        <View style={styles.footer} />
      </ScrollView>
    </ThemedBg>
  );
}

const styles = StyleSheet.create({

    //screen
    container: { paddingBottom: 28 },
    screen: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 16, },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    footer: {
      marginBottom: 200,
    },

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
    avatarEmoji: { fontSize: 28, fontWeight: '800' },
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
        justifyContent:'space-between',
        marginTop: 5,
    },
    prefBox2: {
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop: 5,
    },
    prefBoxText: { fontSize: 18, padding: 5 },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    rowTextWrap: {
        flex: 1,
        paddingVertical: 5,
    },
    rowValue: {
        marginTop: 2,
        paddingHorizontal: 5,
    },
    primaryButton: {
        borderRadius: 14,
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
