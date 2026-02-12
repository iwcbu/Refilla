import { Text, View, StyleSheet } from 'react-native';
import { useState, useMemo, useRef } from 'react';
import { router } from 'expo-router';

import AnimatedClusterBubble from './animatedClusterBubble';
import Supercluster from 'supercluster';
import MapView, { Callout, Marker } from 'react-native-maps';


import { Station } from '../types/station';
import { Coords } from '../types/location';

function regionToBBox(region: any) {
    const lngD = region.longitudeDelta / 2;
    const latD = region.latitudeDelta / 2;

    return [
        region.longitude - lngD, // west
        region.latitude - latD,  // south
        region.longitude + lngD, // east
        region.latitude + latD,  // north
    ] as [number ,number ,number ,number];
}

function regionToZoom(lngDelta: number) {
    return Math.round(Math.log2(360/lngDelta));
}



type CsmProps = {
    stations: Station[],
    userLocation: Coords
}

export default function ClusterStationMap({ stations, userLocation }: CsmProps) {

    const mapRef = useRef<any>(null);

    const [region, setRegion] = useState({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const points = useMemo(
        () =>
        stations.map((s: any) => ({
            type: "Feature",
            properties: { station: s },
            geometry: {
            type: "Point",
            coordinates: [Number(s.lng), Number(s.lat)],
            },
        })),
        [stations]
    );

    const index = useMemo(() => {
        const sc = new Supercluster({
            radius: 80,
            maxZoom: 20,
            minZoom: 0,
        });
        sc.load(points as any);
        return sc;
    }, [points]);

    const clusters = useMemo(() => {
        const bbox = regionToBBox(region);
        const zoom = regionToZoom(region.longitudeDelta);
        return index.getClusters(bbox, zoom) as any[];
    }, [index, region]);


    return ( 

        <MapView

            ref={ mapRef }
            style={styles.map}
            

            initialRegion={ region }
            onRegionChangeComplete={setRegion}
            showsUserLocation
        >   
            {clusters.map((f) => {
                const [lng, lat] = f.geometry.coordinates;
                const isCluster = Boolean(f.properties.cluster);
                if (isCluster) {
                    const count = f.properties.point_count;

                    return (
                        <Marker
                            key={`cluster-${f.id}`}
                            coordinate={{ latitude: lat, longitude: lng }}
                            onPress={() => {
                                const nextDelta = Math.max(region.latitudeDelta * 0.5, 0.002);
                                mapRef.current?.animateToRegion(
                                {
                                    latitude: lat,
                                    longitude: lng,
                                    latitudeDelta: nextDelta,
                                    longitudeDelta: nextDelta,
                                },
                                250
                                );
                            }}
                        >
                            <AnimatedClusterBubble count={count} />
                        </Marker>
                    );
                }

                const station = f.properties.station;

                return (
                
                    <Marker
                        key={String(station.id)}
                        coordinate={{
                            latitude: Number(station.lat),
                            longitude: Number(station.lng),
                        }}
                        >
                        <Callout tooltip

                            onPress={() =>
                                
                                router.push(`/station/${station.id}`)
                            }
                        >
                            <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10, transform: [{ translateY: -40 }] }}>
                                <Text style={{ fontWeight: '600' }}>{station.buildingAbre} Station #{station.id}</Text>
                            </View>
                        </Callout>
                    </Marker>
            )
        })}

        </MapView>
    );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  userLocIcon: {
    width: 25,
    height: 25,
    borderRadius: 50,
    borderWidth: 3,

    backgroundColor: '#00d0ff',
    borderColor: "#3f3f3f",
  },
  cluster: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "#2563eb",
  },
  clusterText: {
    color: "white",
    fontWeight: "800",
  },
});

