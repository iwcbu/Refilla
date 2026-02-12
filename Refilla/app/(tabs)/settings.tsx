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

type PrefKey = 
    | 'dark'
    | 'metric'
    | 'pushNotifications'
    | 'showCallouts'

type Preferences = Record<PrefKey, boolean>;


export default function Settings() {

    const c = useColors();
    const { prefs, setPref } = usePrefs();

    
    const sections = useMemo(
        () => [
            {
                title: 'General',
                items: [
                    {
                        type: 'toggle' as const,
                        label: 'Switch to Dark mode',
                        value: prefs.dark,
                        onValueChange: (v: boolean) => setPref('dark', v),
                    },
                    {
                        type: 'toggle' as const,
                        label: 'Allow push notifications',
                        value: prefs.pushNotifications,
                        onValueChange: (v: boolean) => setPref('pushNotifications', v)
                    }
                ]
            },
            
            {
                title: 'Map',
                items: [
                    {
                        type: 'toggle' as const,
                        label: 'Use Metric units',
                        value: prefs.metric,
                        onValueChange: (v: boolean) => setPref('metric', v)
                    },
                    {
                        type: 'toggle' as const,
                        label: 'Show callouts by default',
                        value: prefs.showCallouts,
                        onValueChange: (v: boolean) => setPref('showCallouts', v)
                    }
                ]
            }
                    
        ], [prefs]
    )

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.bg }]}>
            
            <View style={styles.header}>
                <View style={styles.textBox}>
                    <Text style={[styles.pageTitle, { color: c.text }]}>Settings</Text>
                    <Text style={[styles.subtitle, { color: c.subtext }]}>Change your preferences below</Text>
                </View>
            </View>
                
            {sections.map((section) => (
                <View key={section.title} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>{section.title}</Text>
                    <View style={[styles.card, { backgroundColor: c.card2, borderColor: c.border2 }]}>

                        {section.items.map((item, idx) => {
                            const key = `${section.title}-${idx}`;

                            return (
 
                                <View key={key} style={ [{ marginTop: idx == 0 ? 0 : 10 }, styles.prefBox ]}>
                                    <Text style={[styles.prefBoxText, { color: c.text }]}>{item.label}</Text>
                                    <Switch style={{ marginLeft:'auto' }}
                                        value={item.value}
                                        onValueChange={item.onValueChange}
                                        />
                                </View>
                            )
                        })}
                    </View>
                </View>
            ))
        }
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
    header: {
        flexDirection: "row",
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
        alignItems:'center'
    },
    prefBoxText:{
        fontSize: 18,
        padding: 5,
    }
})
        
            