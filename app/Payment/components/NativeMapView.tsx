import { getDistance } from "geolib";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  type MapPressEvent,
  type Region,
} from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { MapCoordinate } from "./deliveryMapHtml";

const MAP_DELTA = 0.06;
const SEARCH_DELTA = 0.018;

type NativeMapViewProps = {
  storeLocation: MapCoordinate;
  customerLocation: MapCoordinate | null;
  onLocationChange: (location: MapCoordinate, distanceKm: number) => void;
};

const NativeMapView: React.FC<NativeMapViewProps> = ({
  storeLocation,
  customerLocation,
  onLocationChange,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  const initialRegion: Region = useMemo(
    () => ({
      latitude: storeLocation.latitude,
      longitude: storeLocation.longitude,
      latitudeDelta: MAP_DELTA,
      longitudeDelta: MAP_DELTA,
    }),
    [storeLocation.latitude, storeLocation.longitude],
  );

  const routeCoordinates = customerLocation
    ? [storeLocation, customerLocation]
    : [];

  useEffect(() => {
    if (!mapReady || !customerLocation) return;

    mapRef.current?.animateToRegion(
      {
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: SEARCH_DELTA,
        longitudeDelta: SEARCH_DELTA,
      },
      450,
    );
  }, [
    mapReady,
    customerLocation?.latitude,
    customerLocation?.longitude,
    customerLocation,
  ]);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const meters = getDistance(storeLocation, { latitude, longitude });
    onLocationChange(
      { latitude, longitude },
      Number((meters / 1000).toFixed(2)),
    );
  };

  return (
    <View style={styles.wrapper}>
      {!mapReady && (
        <View style={styles.loading}>
          <ActivityIndicator color="#2D6A4F" size="large" />
          <Text style={styles.loadingText}>Memuat peta...</Text>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType="standard"
        onPress={handleMapPress}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {routeCoordinates.length === 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2D6A4F"
            strokeWidth={3}
          />
        )}
        <Marker
          coordinate={storeLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.storeMarker}>
            <Ionicons name="storefront" size={18} color="#FFF" />
          </View>
        </Marker>
        {customerLocation && (
          <Marker
            coordinate={customerLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.homeMarker}>
              <Ionicons name="home" size={16} color="#FFF" />
            </View>
          </Marker>
        )}
      </MapView>
      <View style={styles.caption} pointerEvents="none">
        <Text style={styles.captionTitle}>Toko (hijau) · Rumah (oranye)</Text>
        <Text style={styles.captionText}>
          Cari alamat di atas, atau tap peta untuk titik rumah.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 280,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8E2D8",
    backgroundColor: "#E8EFE8",
  },
  map: { ...StyleSheet.absoluteFillObject },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EFE8",
    gap: 10,
  },
  loadingText: { fontSize: 12, color: "#5F6B5F", fontWeight: "600" },
  storeMarker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2D6A4F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 5,
  },
  homeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B4332",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 5,
  },
  caption: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFFE8",
  },
  captionTitle: { fontSize: 12, fontWeight: "800", color: "#1A2E1A" },
  captionText: { marginTop: 2, fontSize: 11, color: "#5F6B5F", lineHeight: 15 },
});

export default NativeMapView;
