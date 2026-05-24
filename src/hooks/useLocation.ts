import * as Location from 'expo-location';
import { useState } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; city?: string } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');

  const requestAndFetch = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
    if (status !== 'granted') return null;

    const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [place] = await Location.reverseGeocodeAsync(coords.coords);
    const city = place?.city || place?.subregion || place?.region || undefined;
    const loc = { latitude: coords.coords.latitude, longitude: coords.coords.longitude, city };
    setLocation(loc);
    return loc;
  };

  return { location, permissionStatus, requestAndFetch };
}
