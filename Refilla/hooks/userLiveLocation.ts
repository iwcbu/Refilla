import { useState, useEffect, useRef,} from 'react'
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native'
import { Coords } from '../types/location';


export async function userLiveLocation() {

    const isFocused = useIsFocused();
    const subRef = useRef<Location.LocationSubscription | null>(null);

    const [coords, setCoords] = useState<Coords | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function start() {
        setError(null);

        const initial = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        if ( !cancelled ) {
            setCoords({
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
            });
        }

        subRef.current = await Location.watchPositionAsync(
            {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 5,
            },
            (loc) => {
            setCoords({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            }
        );
        }
        
        async function stop() {
        subRef.current?.remove();
        subRef.current = null;
        }

        if (isFocused) start();
        else stop();

        return () => {
        cancelled = true;
        stop();
        };
    }, [isFocused]);

    return { coords, error };
    
    }