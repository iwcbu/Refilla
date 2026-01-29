import { useMemo, useState } from 'react';
import { 
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch


} from 'react-native';
import { router } from 'expo-router';
import { title } from 'node:process';

type PrefKey = 
    | 'darkMode'
    | 'pushNotifications'
    | 'showCallouts'

type Preferences = Record<PrefKey, boolean>;

export default function Settings() {
    const[prefs, setPrefs] = useState<Preferences>({
        darkMode: false,
        pushNotifications: true,
        showCallouts: true
    })
    
    const sections = useMemo(
        () => [
            {
                title: 'General',
                items: [
                    {
                        type: 'toggle' as const,
                        label: 'Switch to Dark mode',
                        value: prefs.darkMode,
                        onValueChange: (v: boolean) =>
                            setPrefs((p) => ({ ...p, darkMode: v }))
                    },
                    {
                        type: 'toggle' as const,
                        label: 'Allow push notifications',
                        value: prefs.pushNotifications,
                        onValueChange: (v: boolean) =>
                            setPrefs((p) => ({ ...p, pushNotifications: v }))
                    }
                ]
            },
            
            {
                title: 'Map',
                items: [
                    {
                        type: 'toggle' as const,
                        label: 'Show callouts by default',
                        value: prefs.showCallouts,
                        onValueChange: (v: boolean) => 
                            setPrefs((p) => ({ ...p, showCallouts: v }))
                    }
                ]
            }
                    
        ], [prefs]
    )

    return (
        <ScrollView contentContainerStyle={styles.container}>
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.textBox}>
                    <Text style={styles.pageTitle}>Settings</Text>
                    <Text style={styles.subtitle}>Change your preferences below</Text>
                </View>
            </View>
                
            {/* Section mapping */}
            {sections.map((section) => (
                <View key={section.title} style={ styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.card}>


                        {/* Subsection mapping */}
                        {section.items.map((item, idx) => {
                            // const key = `${section.title}-${idx}`;

                            return (
 
                                <View style={ [{ marginTop: idx == 0 ? 0 : 10 }, styles.prefBox ]}>
                                    <Text style={ styles.prefBoxText }>{item.label}</Text>
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
        
            