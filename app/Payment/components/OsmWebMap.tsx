import { getDistance } from "geolib";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import {
  buildDeliveryMapHtml,
  type MapCoordinate,
} from "./deliveryMapHtml";

type OsmWebMapProps = {
  storeLocation: MapCoordinate;
  customerLocation: MapCoordinate | null;
  onLocationChange: (location: MapCoordinate, distanceKm: number) => void;
};

const OsmWebMap: React.FC<OsmWebMapProps> = ({
  storeLocation,
  customerLocation,
  onLocationChange,
}) => {
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const lastInjectedRef = useRef<string | null>(null);

  const mapHtml = useMemo(
    () => buildDeliveryMapHtml(storeLocation, customerLocation),
    [
      storeLocation.latitude,
      storeLocation.longitude,
      customerLocation?.latitude,
      customerLocation?.longitude,
    ],
  );

  const flyToCustomer = useCallback((coord: MapCoordinate) => {
    const key = `${coord.latitude},${coord.longitude}`;
    if (lastInjectedRef.current === key) return;
    lastInjectedRef.current = key;

    webRef.current?.injectJavaScript(`
      if (window.setHomeLocation) {
        window.setHomeLocation(${coord.latitude}, ${coord.longitude}, true);
      }
      true;
    `);
  }, []);

  useEffect(() => {
    if (!mapReady || !customerLocation) return;
    flyToCustomer(customerLocation);
  }, [mapReady, customerLocation, flyToCustomer]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          lat?: number;
          lng?: number;
        };
        if (data.type !== "location" || data.lat == null || data.lng == null) {
          return;
        }
        const coordinate = { latitude: data.lat, longitude: data.lng };
        lastInjectedRef.current = `${coordinate.latitude},${coordinate.longitude}`;
        const meters = getDistance(storeLocation, coordinate);
        onLocationChange(
          coordinate,
          Number((meters / 1000).toFixed(2)),
        );
      } catch {
        // ignore invalid messages
      }
    },
    [onLocationChange, storeLocation],
  );

  return (
    <View style={styles.wrapper}>
      {!mapReady && (
        <View style={styles.loading}>
          <ActivityIndicator color="#2D6A4F" size="large" />
          <Text style={styles.loadingText}>Memuat peta...</Text>
        </View>
      )}
      <WebView
        ref={webRef}
        source={{ html: mapHtml }}
        style={styles.map}
        onLoadEnd={() => {
          setMapReady(true);
          if (customerLocation) {
            flyToCustomer(customerLocation);
          }
        }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        scrollEnabled={false}
        bounces={false}
      />
      <View style={styles.caption} pointerEvents="none">
        <Text style={styles.captionTitle}>Peta jalan (OpenStreetMap)</Text>
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
  map: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EFE8",
    gap: 10,
  },
  loadingText: { fontSize: 12, color: "#5F6B5F", fontWeight: "600" },
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

export default OsmWebMap;
