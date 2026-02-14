import { Station } from '../../types/station';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import { useLiveLocation } from '../../src/context/userLocation';
import ClusterStationMap from '../../components/clusterMapView';


export default function App() {

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
        buildingAbre: "BUMC",
        buildingName: "Boston University Medical Campus",
        buildingDetails: "Basement hallway near bathrooms",
        filterStatus: "RED",
        stationStatus: "ACTIVE",
        bottlesSaved: 30000,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "4",
        lat: 42.3233,
        lng: -71.1052,
        buildingAbre: "CDS",
        buildingName: "College of Data and Computer Sciences",
        buildingDetails: "Basement hallway near bathrooms",
        filterStatus: "GREEN",
        stationStatus: "ACTIVE",
        bottlesSaved: 40000,
        lastUpdated: new Date().toISOString(),
      },
  ]);


  const { coords, start, error } = useLiveLocation();

  // starts live location
  useEffect(() => {
    start();
  }, []);
  
  return (

    <View style={styles.container}>

      <ClusterStationMap stations={ stations } userLocation={ coords } />
    
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

