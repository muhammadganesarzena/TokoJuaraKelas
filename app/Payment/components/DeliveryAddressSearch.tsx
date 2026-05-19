import { getDistance } from "geolib";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { searchAddress, type AddressSearchResult } from "../../../lib/geocoding";
import type { MapCoordinate } from "./deliveryMapHtml";

type Props = {
  storeLocation: MapCoordinate;
  onSelect: (result: AddressSearchResult, distanceKm: number) => void;
};

const DeliveryAddressSearch: React.FC<Props> = ({ storeLocation, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await searchAddress(query);
        setResults(items);
        if (items.length === 0) {
          setError("Alamat tidak ditemukan. Coba kata kunci lain.");
        }
      } catch (err: unknown) {
        setResults([]);
        setError(
          err instanceof Error ? err.message : "Gagal mencari alamat.",
        );
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (item: AddressSearchResult) => {
    const meters = getDistance(storeLocation, {
      latitude: item.latitude,
      longitude: item.longitude,
    });
    const distanceKm = Number((meters / 1000).toFixed(2));
    setQuery(item.displayName.split(",").slice(0, 2).join(", "));
    setResults([]);
    setFocused(false);
    onSelect(item, distanceKm);
  };

  const showDropdown =
    focused && (loading || results.length > 0 || !!error);

  return (
    <View style={styles.wrap}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#5F6B5F" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Cari nama jalan, perumahan, atau alamat..."
          placeholderTextColor="#9AA89A"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 200);
          }}
          returnKeyType="search"
          autoCorrect={false}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#2D6A4F" style={styles.loader} />
        ) : query.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
              setError(null);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color="#9AA89A" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {loading && results.length === 0 ? (
            <Text style={styles.hint}>Mencari alamat...</Text>
          ) : null}
          {error && !loading ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color="#2D6A4F"
                style={styles.resultIcon}
              />
              <Text style={styles.resultText} numberOfLines={2}>
                {item.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    zIndex: 10,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E2D8",
    paddingHorizontal: 12,
    minHeight: 46,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1A2E1A",
    paddingVertical: 10,
  },
  loader: { marginLeft: 8 },
  dropdown: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E2D8",
    maxHeight: 200,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2EE",
  },
  resultIcon: { marginRight: 10, marginTop: 2 },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: "#1A2E1A",
    lineHeight: 18,
  },
  hint: {
    padding: 14,
    fontSize: 13,
    color: "#5F6B5F",
  },
  error: {
    padding: 14,
    fontSize: 13,
    color: "#C62828",
    lineHeight: 18,
  },
});

export default DeliveryAddressSearch;
