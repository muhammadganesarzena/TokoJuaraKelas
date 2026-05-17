import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type NFCItem = {
  id: string;
  nfc_uid: string;
  product_name: string;
  qty: number;
  created_at: string;
};

type Props = {
  uid: string | null;
  items: NFCItem[];
  loading: boolean;
  onAddPress: () => void;
};

export default function NFCItemsList({
  uid,
  items,
  loading,
  onAddPress,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Barang Terkait NFC</Text>
          <Text style={styles.subtitle}>
            {uid ? `UID: ${uid}` : "Scan NFC untuk melihat barang"}
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
          <ActivityIndicator color="#1B4332" />
          <Text style={styles.loadingText}>Memuat barang...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cube-outline" size={42} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Belum ada barang</Text>
          <Text style={styles.emptyDesc}>
            Tambahkan barang agar stok bisa dilacak dari kartu NFC ini.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemIcon}>
                <Ionicons name="cube" size={18} color="#1B4332" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <View style={styles.qtyPill}>
                <Text style={styles.qtyText}>Qty {item.qty}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
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
  title: { fontSize: 16, fontWeight: "900", color: "#1a1a2e" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1B4332",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: { opacity: 0.45 },
  loadingWrap: { alignItems: "center", paddingVertical: 28, gap: 8 },
  loadingText: { color: "#6B7280", fontSize: 12, fontWeight: "700" },
  emptyWrap: { alignItems: "center", paddingVertical: 30 },
  emptyTitle: {
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: "800",
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
    paddingHorizontal: 20,
  },
  list: { marginTop: 14, gap: 10 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: { fontSize: 14, fontWeight: "800", color: "#1a1a2e" },
  itemMeta: { fontSize: 11, color: "#8A94A6", marginTop: 2 },
  qtyPill: {
    backgroundColor: "#E8F5E9",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtyText: { color: "#1B4332", fontSize: 12, fontWeight: "900" },
});
