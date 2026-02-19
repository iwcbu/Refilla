import { Station } from '../../types/station';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useEffect, useState, useRef, useMemo } from 'react';

import { useLiveLocation } from '../../src/context/userLocation';
import ClusterStationMap from '../../components/clusterMapView';
import { listStations } from '../../src/db/stationsRepo';


export default function App() {

  const stations = listStations();
  const activeStations = useMemo(
      () => stations.filter((s) => s.stationStatus === "ACTIVE"),
      [stations]
  );


  const { coords, start, error } = useLiveLocation();

  // starts live location
  useEffect(() => {
    start();
  }, []);
  
  
  return (

    <View style={styles.container}>

      <ClusterStationMap stations={ activeStations } userLocation={ coords } />
    
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
});

