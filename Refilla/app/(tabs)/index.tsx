import { useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable } from "react-native";
import type { Station } from "../../types/station";

export default function MapTab() {
// Temporary demo data (replace with API fetch later)
    const [stations, setStations] = useState<Station[]>([
        {
            id: "1",
            lat: 42.3505,
            lng: -71.1054,
            buildingAbre: "GSU",
            buildingName: "George Sherman Union",
            buildingDetails: "1st floor, middle of cafe",
            filterStatus: "GREEN",
            stationStatus: "ACTIVE",
            bottlesSaved: 1280,
            lastUpdated: new Date().toISOString(),
        },
        {
            id: "2",
            lat: 42.3493,
            lng: -71.1002,
            buildingAbre: "CAS",
            buildingName: "CAS",
            buildingDetails: "Basement hallway near bathrooms",
            filterStatus: "YELLOW",
            stationStatus: "ACTIVE",
            bottlesSaved: 30000,
            lastUpdated: new Date().toISOString(),
        },
        {
            id: "3",
            lat: 42.3241,
            lng: -71.1050,
            buildingAbre: "CDS",
            buildingName: "CAS",
            buildingDetails: "Basement hallway near bathrooms",
            filterStatus: "YELLOW",
            stationStatus: "ACTIVE",
            bottlesSaved: 30000,
            lastUpdated: new Date().toISOString(),
        },
        {
            id: "4",
            lat: 42.4533,
            lng: -71.1052,
            buildingAbre: "CDS",
            buildingName: "CAS",
            buildingDetails: "Basement hallway near bathrooms",
            filterStatus: "YELLOW",
            stationStatus: "ACTIVE",
            bottlesSaved: 30000,
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
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            columnWrapperStyle={{ gap: 12 }}
            renderItem={({ item }) => (
            <Pressable
                onPress={() => {
                    router.push({pathname: `/station/${item.id}`, params: { id: item.id }})
                }}

                style={{
                    padding: 14,
                    borderWidth: 1,
                    borderRadius: 14,
                    gap: 6,
                    cursor: 'pointer',
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    {item.buildingAbre}
                </Text>
                <Text>Station: { item.id }</Text>
                <Text style={{ color: item.filterStatus }}>Filter: {item.filterStatus}</Text>



            </Pressable>
            )}
        />
        </View>
    );
}
