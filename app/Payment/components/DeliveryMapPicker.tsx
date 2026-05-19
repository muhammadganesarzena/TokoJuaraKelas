import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { AddressSearchResult } from "../../../lib/geocoding";
import DeliveryAddressSearch from "./DeliveryAddressSearch";
import NativeMapView from "./NativeMapView";
import OsmWebMap from "./OsmWebMap";

export type { MapCoordinate } from "./deliveryMapHtml";
import type { MapCoordinate } from "./deliveryMapHtml";

type DeliveryMapPickerProps = {
  storeLocation: MapCoordinate;
  customerLocation: MapCoordinate | null;
  onLocationChange: (
    location: MapCoordinate,
    distanceKm: number,
  ) => void;
  onAddressResolved?: (address: string) => void;
};

/**
 * Android: OpenStreetMap via WebView (tanpa Google API key).
 * iOS: Apple Maps via react-native-maps.
 */
const DeliveryMapPicker: React.FC<DeliveryMapPickerProps> = ({
  storeLocation,
  customerLocation,
  onLocationChange,
  onAddressResolved,
}) => {
  const handleSearchSelect = (result: AddressSearchResult, distanceKm: number) => {
    onLocationChange(
      { latitude: result.latitude, longitude: result.longitude },
      distanceKm,
    );
    onAddressResolved?.(result.displayName);
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.block}>
        <DeliveryAddressSearch
          storeLocation={storeLocation}
          onSelect={handleSearchSelect}
        />
        <View style={[styles.fallback, styles.wrapper]}>
          <Text style={styles.fallbackText}>
            Peta hanya tersedia di aplikasi Android/iOS.
          </Text>
        </View>
      </View>
    );
  }

  const MapComponent = Platform.OS === "android" ? OsmWebMap : NativeMapView;

  return (
    <View style={styles.block}>
      <DeliveryAddressSearch
        storeLocation={storeLocation}
        onSelect={handleSearchSelect}
      />
      <MapComponent
        storeLocation={storeLocation}
        customerLocation={customerLocation}
        onLocationChange={onLocationChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    zIndex: 1,
  },
  wrapper: {
    height: 280,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8E2D8",
    backgroundColor: "#E8EFE8",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  fallbackText: {
    fontSize: 13,
    color: "#5F6B5F",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default DeliveryMapPicker;
