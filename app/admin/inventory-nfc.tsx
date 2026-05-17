import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AddItemModal from "./components/AddItemModal";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import NFCItemsList, { type NFCItem } from "./components/NFCItemsList";
import NFCScanner from "./components/NFCScanner";

type NFCTag = {
  id: string;
  uid: string;
  name: string | null;
  created_at: string;
};

type ScanMode = "scan" | "search";

export default function InventoryNFC() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<NFCTag | null>(null);
  const [items, setItems] = useState<NFCItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [syncingTag, setSyncingTag] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchItems = async (uid: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("nfc_items")
      .select("*")
      .eq("nfc_uid", uid)
      .order("created_at", { ascending: false });
    setLoadingItems(false);

    if (error) {
      Alert.alert("Gagal mengambil barang", error.message);
      return;
    }

    setItems(data || []);
  };

  const ensureNFCTag = async (uid: string) => {
    const { data: existingTag, error: selectError } = await supabase
      .from("nfc_tags")
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existingTag) return existingTag as NFCTag;

    const { data: createdTag, error: insertError } = await supabase
      .from("nfc_tags")
      .insert({
        uid,
        name: `NFC ${uid.slice(-6)}`,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return createdTag as NFCTag;
  };

  const handleScanned = async (uid: string, mode: ScanMode) => {
    setSyncingTag(true);
    try {
      const tag = await ensureNFCTag(uid);
      setSelectedTag(tag);
      await fetchItems(uid);

      if (mode === "scan") {
        Alert.alert(
          "NFC terbaca",
          `UID ${uid} siap dipakai untuk kelola stok.`,
        );
      }
    } catch (error: any) {
      Alert.alert("Gagal sinkron NFC", error.message || "Coba scan ulang.");
    } finally {
      setSyncingTag(false);
    }
  };

  const refreshSelectedItems = async () => {
    if (!selectedTag) return;
    await fetchItems(selectedTag.uid);
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Kelola Stok NFC"
        onMenuPress={() => setSidebarOpen(true)}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NFCScanner onScanned={handleScanned} />

        <View style={styles.tagCard}>
          <View style={styles.tagTopRow}>
            <View style={styles.tagIcon}>
              <Ionicons name="pricetag-outline" size={22} color="#1B4332" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tagLabel}>NFC Aktif</Text>
              <Text style={styles.tagValue}>
                {selectedTag?.uid || "Belum ada kartu discan"}
              </Text>
            </View>
            {syncingTag && <ActivityIndicator color="#1B4332" />}
          </View>

          <TouchableOpacity
            style={[
              styles.addItemBtn,
              !selectedTag && styles.addItemBtnDisabled,
            ]}
            onPress={() => setModalOpen(true)}
            disabled={!selectedTag}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addItemText}>Tambah Barang ke NFC</Text>
          </TouchableOpacity>
        </View>

        <NFCItemsList
          uid={selectedTag?.uid || null}
          items={items}
          loading={loadingItems}
          onAddPress={() => setModalOpen(true)}
        />
      </ScrollView>

      <AddItemModal
        visible={modalOpen}
        nfcUid={selectedTag?.uid || null}
        onClose={() => setModalOpen(false)}
        onSaved={refreshSelectedItems}
      />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/inventory-nfc"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  content: { padding: 16, paddingBottom: 48 },
  tagCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  tagTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tagIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  tagLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tagValue: {
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: "900",
    marginTop: 2,
  },
  addItemBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1B4332",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addItemBtnDisabled: { opacity: 0.45 },
  addItemText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
});
