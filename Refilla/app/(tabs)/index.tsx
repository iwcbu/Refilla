// app/(tabs)/index.tsx

import { Pressable, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef, useMemo, act } from 'react';

import { useLiveLocation } from '../../src/context/userLocation';
import { useAuth } from '../../src/context/auth';
import ClusterStationMap  from '../../components/clusterMapView';
import { listStations, syncStations } from '../../src/db/stationsRepo';
import ThemedCard2 from '../../components/ThemedCard2';
import ThemedSubtext from '../../components/ThemedSubtext';
import ThemedText from '../../components/ThemedText';
import { router } from 'expo-router';
import { useNewMarkerLoc } from '../../src/context/newMarkerLocation';
import { Ionicons } from '@expo/vector-icons';
import { getVisibleStationsForUser } from '../../src/features/account/organizationService';



export default function App() {
  const { currentUser } = useAuth();

  const [stations, setStations] = useState(() => listStations());
  const visibleStations = useMemo(
    () => getVisibleStationsForUser(stations, currentUser?.id),
    [currentUser?.id, stations]
  );
  const activeStations = useMemo(
      () => visibleStations.filter((s) => s.stationStatus === "ACTIVE"),
      [visibleStations]
  );

  const { setNewMarkerLoc } = useNewMarkerLoc();

  const mapRef = useRef<any>(null);
  const { coords, start, stop,  error } = useLiveLocation();
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const [refreshingStations, setRefreshingStations] = useState(false);

  // starts live location
  useEffect(() => {
    start();
  }, []);

  useEffect(() => {
    syncStations().then(setStations).catch((error) => {
      console.log("Could not sync stations", error);
    });
  }, []);

  const handleBackToUser = () => {
    
    if (coords && mapRef.current) {
      // Logic to center the map on the user's current location
      // This will depend on how your ClusterStationMap component is implemented
      // For example, you might have a method in ClusterStationMap that accepts new coordinates to center on
      mapRef.current.centerOnLocation(coords);
      console.log('Centering map on user location');  
      
    } else {      
      console.log('User location not available');
    }
  };

  const handleRefreshLocation = () => {
    
    setRefreshingLocation(true);
    console.log('Attempting to refresh user location');

    stop();
    console.log('Stopped location tracking to refresh');

    start();
    console.log('Starting location tracking again to refresh');

    // timeout to allow location to refresh before checking coords again
    setTimeout(() => {
      coords ? console.log('Refreshing location, new coords:', coords) : console.log('Attempting to refresh location, but coords are still unavailable');
      setRefreshingLocation(false);
    }, 2000);
  }

  const handleRefreshStations = async () => {
    setRefreshingStations(true);
    console.log('Refreshing station data...');

    try {
      const synced = await syncStations();
      setStations(synced);
    } catch (error) {
      console.log("Could not sync stations", error);
      setStations(listStations());
    }

    setTimeout(() => {
      console.log('Station data refreshed');
      setRefreshingStations(false);
    }, 1500);
  }
  
  
  return (

    <View style={styles.container}>
      <ClusterStationMap 
        ref={mapRef}
        stations={activeStations} 
        userLocation={coords} />

    <ThemedCard2 style={styles.topCard}>
      <Pressable
      onPress={() => {
        router.navigate('list')
      }}>
        { refreshingStations ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'space-between' }}>
              <View>
                <ThemedText style={ styles.topTitle }>Refreshing</ThemedText>
                <ThemedSubtext style={styles.topSubtitle}>Fetching the latest station data</ThemedSubtext>
              </View>
              <ActivityIndicator style={styles.activityIndicator} size="small" />
            </View>
         ) : (
          <>
            <ThemedText style={styles.topTitle}>Refilla</ThemedText>
            <ThemedSubtext style={styles.topSubtitle}>
              {activeStations.length} active stations on map
            </ThemedSubtext> 
          </>
         )
          }
      </Pressable>
    </ThemedCard2>

      <View style={styles.fabStack}>

        <Pressable onPress={() => handleBackToUser()} >
            <ThemedCard2 style={styles.fab}>
              <Text>📍</Text>
            </ThemedCard2>
        </Pressable>
          
          <Pressable onPress={() => !coords ? handleRefreshLocation() : handleRefreshStations()}>
           <ThemedCard2 style={styles.fab}>
              <ThemedText style={{ fontSize: 20 }}>🔄</ThemedText>
            </ThemedCard2>
          </Pressable>

        <Pressable onPress={() => {
            setNewMarkerLoc(coords)
            router.push({ pathname: '/ticket/new', })
        }}>
           <ThemedCard2 style={styles.fab}>
              <ThemedText style={{ fontSize: 20 }}> ╋ </ThemedText>
            </ThemedCard2>
          </Pressable>

      </View>
      

      <ThemedCard2 style={styles.bottomCard}>
        {refreshingLocation ? (
          <>
            <ThemedText style={styles.bottomTitle}>Refreshing location...</ThemedText>
            <ThemedSubtext style={styles.bottomSubtitle}>
              Please wait while we attempt to get your current location.
            </ThemedSubtext>
          </>
        ) :
        !coords ? (
          <>
            <ThemedText style={styles.bottomTitle}>Location Error⚠️</ThemedText>
            <ThemedText style={styles.bottomSubtitle}>
              We couldn't determine your location right now. Press the refresh button to try again.
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText style={styles.bottomTitle}>Stay hydrated</ThemedText>
            <ThemedSubtext style={styles.bottomSubtitle}>
              Tap a station to view details or report an issue
            </ThemedSubtext>
          </>
        )}
        </ThemedCard2>
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
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  topCard: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 18,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  topTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  topSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.75,
  },

  fabStack: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 12,
  },

  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    padding: 16,
    borderRadius: 20,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  bottomTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  bottomSubtitle: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.75,
  },
  activityIndicator: {  
    marginLeft: 8,
  }
});
