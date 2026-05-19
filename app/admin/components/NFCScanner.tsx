import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { Colors, useTheme } from "../../context/ThemeContext";

type ScanMode = "scan" | "search";

type Props = {
  onScanned: (uid: string, mode: ScanMode) => Promise<void>;
};

const normalizeUid = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((byte) => Number(byte).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  return String(value || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase();
};

export default function NFCScanner({ onScanned }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState<ScanMode | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const isSupported = await NfcManager.isSupported();
        setSupported(isSupported);
        if (isSupported) await NfcManager.start();
      } catch {
        setSupported(false);
      }
    };

    init();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => null);
    };
  }, []);

  const scanTag = async (mode: ScanMode) => {
    if (!supported) {
      Alert.alert(
        "NFC tidak tersedia",
        "Gunakan Android device dengan NFC dan development build, bukan Expo Go.",
      );
      return;
    }

    setScanning(mode);
    try {
      await NfcManager.cancelTechnologyRequest().catch(() => null);
      await NfcManager.requestTechnology([
        NfcTech.NfcA,
        NfcTech.IsoDep,
        NfcTech.NfcB,
        NfcTech.MifareClassic,
        NfcTech.MifareUltralight,
        NfcTech.Ndef,
      ]);
      const tag = await NfcManager.getTag();
      const uid = normalizeUid((tag as any)?.id || (tag as any)?.uid);

      if (!uid) throw new Error("UID kartu NFC tidak terbaca.");
      await onScanned(uid, mode);
    } catch (error: any) {
      Alert.alert("Scan NFC gagal", error.message || "Coba scan kartu lagi.");
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => null);
      setScanning(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="radio-outline" size={24} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Kelola Stok NFC</Text>
          <Text style={styles.subtitle}>
            {Platform.OS === "android"
              ? "Tempelkan kartu NFC seperti Flazz ke belakang device."
              : "NFC inventory saat ini difokuskan untuk Android."}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                supported === null ? "#889988" : supported ? "#2D6A4F" : "#E53935",
            },
          ]}
        />
        <Text style={styles.statusText}>
          {supported === null
            ? "Mengecek NFC..."
            : supported
              ? "NFC siap digunakan"
              : "NFC tidak tersedia di device ini"}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, scanning && styles.disabledBtn]}
          onPress={() => scanTag("scan")}
          disabled={!!scanning}
        >
          {scanning === "scan" ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryText}>Scan NFC</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, scanning && styles.disabledBtn]}
          onPress={() => scanTag("search")}
          disabled={!!scanning}
        >
          {scanning === "search" ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Ionicons name="search-outline" size={18} color={colors.accent} />
              <Text style={styles.secondaryText}>Cari Barang</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 2,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { fontSize: 17, fontWeight: "900", color: colors.text },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
      marginTop: 2,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 14,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "700",
    },
    buttonRow: { flexDirection: "row", gap: 10, marginTop: 14 },
    primaryBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    disabledBtn: { opacity: 0.7 },
    primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
    secondaryText: { color: colors.accent, fontSize: 13, fontWeight: "800" },
  });
