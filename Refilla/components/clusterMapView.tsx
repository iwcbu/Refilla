import { Image, Text, View, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { router } from 'expo-router';

import ClusterMapView from 'react-native-map-clustering';
import { Marker, Callout } from 'react-native-maps';

import { Station } from '../types/station';
import { Coords } from '../types/location';


type CsmProps = {
    stations: Station[],
    userLocation: Coords
}

export default function ClusterStationMap({ stations, userLocation }: CsmProps) {

    const mapRef = useRef<any>(null);

    return ( 


        <ClusterMapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}

                showsUserLocation={true}
                showsMyLocationButton={true}

                // When cluster is tapped zoom in
                onClusterPress={(cluster, children) => {
                // cluster has .geometry.coordinates [lng, lat]
                const coords = cluster?.geometry?.coordinates;
                if (!coords) return;

                mapRef.current?.animateToRegion(
                {
                    latitude: coords[1],
                    longitude: coords[0],
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                },
                250
                );
            }}


            >
                // @ts-ignore
                <Marker 
                    coordinate={{ 
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    >
                    <View>
                        <Image 
                        source={require("../assets/user-icon-maps.jpg")}
                        style={{ width: 36, height: 36, borderRadius: 18, borderColor: "black", borderWidth: 2, }}
                        resizeMode="cover"
                        /> 
                    </View>
                </Marker>
                {stations.map((station) => (
                    <Marker
                    key={station.id}
                    coordinate={{
                        latitude: Number(station.lat),
                        longitude: Number(station.lng),
                    }}
                    tracksViewChanges={false}
                    onPress={() =>
                        
                        router.push({
                        pathname: `/station/${station.id}`,
                        params: { id: String(station.id) },
                        })
                    }
                    >
                    <Callout tooltip>
                    <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10, transform: [{ translateY: -40 }] }}>
                        <Text style={{ fontWeight: '600' }}>{station.buildingAbre} Station #{station.id}</Text>
                    </View>
                    </Callout>
                    </Marker>
                ))}

            </ClusterMapView>
    )
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

