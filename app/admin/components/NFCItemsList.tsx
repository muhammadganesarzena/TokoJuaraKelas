import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, useTheme } from "../../context/ThemeContext";

export type NFCItem = {
  id: string;
  nfc_uid: string;
  product_name: string;
  qty: number;
  image_url?: string | null;
  created_at: string;
};

type Props = {
  uid: string | null;
  items: NFCItem[];
  loading: boolean;
  onAddPress: () => void;
  onEditPress: (item: NFCItem) => void;
};

export default function NFCItemsList({
  uid,
  items,
  loading,
  onAddPress,
  onEditPress,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Barang di NFC Ini</Text>
          <Text style={styles.subtitle}>
            {uid ? `UID: ${uid}` : "Scan NFC untuk melihat & edit barang"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, !uid && styles.disabledBtn]}
          onPress={onAddPress}
          disabled={!uid}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Memuat barang...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cube-outline" size={42} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Belum ada barang</Text>
          <Text style={styles.emptyDesc}>
            Tambahkan barang agar stok bisa dilacak dari kartu NFC ini.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => onEditPress(item)}
              activeOpacity={0.85}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.itemIcon}>
                  <Ionicons name="cube" size={18} color={colors.accent} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>
                  Tap untuk edit ·{" "}
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <View style={styles.rightCol}>
                <View style={styles.qtyPill}>
                  <Text style={styles.qtyText}>Jml {item.qty}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 2,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    title: { fontSize: 16, fontWeight: "900", color: colors.text },
    subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    disabledBtn: { opacity: 0.45 },
    loadingWrap: { alignItems: "center", paddingVertical: 28, gap: 8 },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
    },
    emptyWrap: { alignItems: "center", paddingVertical: 30 },
    emptyTitle: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "800",
      marginTop: 10,
    },
    emptyDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
      marginTop: 4,
      paddingHorizontal: 20,
    },
    list: { marginTop: 14, gap: 10 },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      padding: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemThumb: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.input,
    },
    itemIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    itemName: { fontSize: 14, fontWeight: "800", color: colors.text },
    itemMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    rightCol: { alignItems: "flex-end", gap: 6 },
    qtyPill: {
      backgroundColor: colors.accentSoft,
      borderRadius: 99,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    qtyText: { color: colors.accent, fontSize: 12, fontWeight: "900" },
  });
