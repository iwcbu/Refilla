import React from 'react';
import { Station } from '../../types/station';
import MapView, { Marker } from 'react-native-maps';
import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

const [stations] = useState<Station[]>([
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
      buildingName: "College of Arts and Science",
      buildingDetails: "Basement hallway near bathrooms",
      filterStatus: "YELLOW",
      stationStatus: "ACTIVE",
      bottlesSaved: 30000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "3",
      lat: 42.3241,
      lng: -71.105,
      buildingAbre: "CDS",
      buildingName: "College of Data and Computer Sciences",
      buildingDetails: "Basement hallway near bathrooms",
      filterStatus: "RED",
      stationStatus: "ACTIVE",
      bottlesSaved: 30000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "4",
      lat: 42.4533,
      lng: -71.1052,
      buildingAbre: "CDS",
      buildingName: "College of Data and Computer Sciences",
      buildingDetails: "Basement hallway near bathrooms",
      filterStatus: "GREEN",
      stationStatus: "ACTIVE",
      bottlesSaved: 30000,
      lastUpdated: new Date().toISOString(),
    },
  ]);

export default function App() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{
        latitude: 42.4533,
        longitude: -71.1052,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}>
        {/* {stations.map((station, i) => (
            <Pressable
                onPress={() => {
                router.push({
                    pathname: `/station/${station.id}`,
                    params: { id: station.id },
                });
            >
                <Marker coordinate={{ 
                        latitude: station.lat, 
                        longitude: station.lng 
                    }} 
                />
            <Pressable />
        
        ))} */}

        {stations.map((station) => (
            <Marker
            key={station.id}
            coordinate={{
                latitude: Number(station.lat),
                longitude: Number(station.lng),
            }}
            onPress={() =>
                router.push({
                pathname: `/station/${station.id}`,
                params: { id: String(station.id) },
                })
            }
            />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
