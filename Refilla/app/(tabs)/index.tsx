import { useMemo, useState, useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import type { Station } from "../../types/station";

export default function MapTab() {
// Temporary demo data (replace with API fetch later)
    const [stations, setStations] = useState<Station[]>([
        {
            id: "1",
            lat: 42.3505,
            lng: -71.1054,
            buildingName: "GSU",
            buildingDetails: "2nd floor, left of elevators",
            filterStatus: "GREEN",
            stationStatus: "ACTIVE",
            bottlesSaved: 128,
            lastUpdated: new Date().toISOString(),
        },
        {
            id: "2",
            lat: 42.3493,
            lng: -71.1002,
            buildingName: "CAS",
            buildingDetails: "Basement hallway near bathrooms",
            filterStatus: "YELLOW",
            stationStatus: "ACTIVE",
            bottlesSaved: 54,
            lastUpdated: new Date().toISOString(),
        },
    ]);


    const activeStations = useMemo(
        () => stations.filter((s) => s.stationStatus === "ACTIVE"),
        [stations]
    );

        function timeAgo(iso: string) {
            const diff = Date.now() - new Date(iso).getTime();

            const minutes = Math.floor(diff / 60000);
            if (minutes < 60) {
                if (minutes < 3) return 'Just now'
                return `${minutes}m ago`;
            }

            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;

            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Refilla</Text>
        <Text style={{ fontSize: 14, opacity: 0.7 }}>
            Nearby stations (demo)
        </Text>

        <FlatList
            data={activeStations}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
            <Pressable
                onPress={() => {
                // later: navigate to station detail
                // router.push(`/station/${item.id}`)
                }}
                style={{
                padding: 14,
                borderWidth: 1,
                borderRadius: 14,
                gap: 6,
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                {item.buildingName}
                </Text>
                <Text style={{ opacity: 0.8 }}>{item.buildingDetails}</Text>

                <View style={{ flexDirection: "row", gap: 12 }}>
                <Text>Filter: {item.filterStatus}</Text>
                <Text>Bottles Saved: {item.bottlesSaved}</Text>
                </View>
                <Text style={{ opacity: 0.8 }}>{'Last updated: ' + timeAgo(item.lastUpdated)}</Text>

            </Pressable>
            )}
        />
        </View>
    );
}
