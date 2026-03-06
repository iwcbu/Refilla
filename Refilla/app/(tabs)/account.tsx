// app/(tabs)/account.tsx

import { useMemo, useState } from 'react';
import { 
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch
} from 'react-native';

import { useColors } from '../../src/theme/colors';
import { usePrefs } from '../../src/context/prefs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type PrefKey = 
    | 'dark'
    | 'metric'
    | 'pushNotifications'
    | 'showCallouts'

type Preferences = Record<PrefKey, boolean>;


export default function Settings() {

    const c = useColors();
    const { prefs, setPref } = usePrefs();


    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.bg }]}>
            
            <View style={styles.header}>
                <View style={[styles.profileAvatar, { backgroundColor: c.card2, borderColor: c.border2 }]}>
                    <Text style={styles.avatarEmoji}>🐧</Text>
                </View>

                <View style={styles.profileTextBox}>
                    <Text style={[styles.profilePageTitle, { color: c.text }]}>@iwc</Text>
                    <Text style={[styles.profileSubtitle, { color: c.subtext }]}>
                    Account preferences below
                    </Text>
                </View>
                </View>
                
           
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Profile</Text>
                <View style={[styles.card, { backgroundColor: c.card2, borderColor: c.border2 }]}>
                    <View style={ styles.prefBox }>
                        <Text style={[styles.prefBoxText, { color: c.text }]}>Username: @iwc</Text>
                    </View>
                    <View style={ styles.prefBox }>
                        <Text style={[styles.prefBoxText, { color: c.text }]}>Profile Settings</Text>
                        <Ionicons name='chevron-forward-outline' size={24} color={c.border2} />
                    </View>
                    <View style={ styles.prefBox }>
                        <Text style={[styles.prefBoxText, { color: c.text }]}>Tickets Submitted: 1</Text>
                        <Ionicons name='chevron-forward-outline' size={24} color={c.border2} />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Social</Text>
                <View style={[styles.card, { backgroundColor: c.card2, borderColor: c.border2 }]}>

                                <View style={ styles.prefBox }>
                                    <Text style={[styles.prefBoxText, { color: c.text }]}>FillaPoints: 75</Text>
                                </View>
                                <View style={ styles.prefBox }>
                                    <Text style={[styles.prefBoxText, { color: c.text }]}>Leaderboard</Text>
                                    <Ionicons name='chevron-forward-outline' size={24} color={c.border2} />
                                </View>
                </View>
            </View>
            
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Preferences</Text>

                <View style={[styles.card, { backgroundColor: c.card2, borderColor: c.border2 }]}>

                    <View style={styles.prefBox}>
                    <Text style={[styles.prefBoxText, { color: c.text }]}>Dark Mode</Text>
                    <Switch
                        value={prefs.dark}
                        onValueChange={(v) => setPref("dark", v)}
                    />
                    </View>

                    <View style={styles.prefBox}>
                    <Text style={[styles.prefBoxText, { color: c.text }]}>Metric Units</Text>
                    <Switch
                        value={prefs.metric}
                        onValueChange={(v) => setPref("metric", v)}
                    />
                    </View>

                    <View style={styles.prefBox}>
                    <Text style={[styles.prefBoxText, { color: c.text }]}>Push Notifications</Text>
                    <Switch
                        value={prefs.pushNotifications}
                        onValueChange={(v) => setPref("pushNotifications", v)}
                    />
                    </View>

                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingBottom: 28,
        gap: 16,
    },

    textBox: {
        marginTop: 4,
        marginBottom: 12,
    },
        pageTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0f172a",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: "#64748b",
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    card: {
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "white",

    },
    prefBox: {
        display: 'flex', 
        flexDirection: "row", 
        alignItems:'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    prefBoxText:{
        fontSize: 18,
        padding: 5,
    },

    // PROFILE
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 6,
    },


    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    avatarEmoji: {
        fontSize: 30,
    },

    profileTextBox: {
        justifyContent: "center",
    },
    profilePageTitle: {
        fontSize: 22,
        fontWeight: "700",
    },

    profileSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },

})
        
            