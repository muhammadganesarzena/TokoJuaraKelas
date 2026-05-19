import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import NFCItemModal from "./components/NFCItemModal";
import NFCItemsList, { type NFCItem } from "./components/NFCItemsList";
import NFCScanner from "./components/NFCScanner";
import { useAdminTheme } from "./hooks/useAdminTheme";
import { createInventoryNfcStyles } from "./styles/inventoryNfcStyles";

type NFCTag = {
  id: string;
  uid: string;
  name: string | null;
  created_at: string;
};

type ScanMode = "scan" | "search";

export default function InventoryNFC() {
  const { colors } = useAdminTheme();
  const styles = useMemo(() => createInventoryNfcStyles(colors), [colors]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedTags, setSavedTags] = useState<NFCTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [selectedTag, setSelectedTag] = useState<NFCTag | null>(null);
  const [tagName, setTagName] = useState("");
  const [savingTagName, setSavingTagName] = useState(false);
  const [items, setItems] = useState<NFCItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [syncingTag, setSyncingTag] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NFCItem | null>(null);

  const fetchSavedTags = useCallback(async () => {
    setLoadingTags(true);
    const { data, error } = await supabase
      .from("nfc_tags")
      .select("*")
      .order("created_at", { ascending: false });
    setLoadingTags(false);
    if (error) {
      Alert.alert("Gagal memuat NFC", error.message);
      return;
    }
    setSavedTags(data || []);
  }, []);

  useEffect(() => {
    fetchSavedTags();
  }, [fetchSavedTags]);

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
      return [];
    }

    const nextItems = data || [];
    setItems(nextItems);
    return nextItems;
  };

  const selectTag = async (tag: NFCTag) => {
    setSelectedTag(tag);
    setTagName(tag.name || "");
    await fetchItems(tag.uid);
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
      await fetchSavedTags();
      setSelectedTag(tag);
      setTagName(tag.name || "");
      const loadedItems = await fetchItems(uid);

      if (mode === "scan") {
        Alert.alert(
          "NFC terbaca",
          loadedItems.length > 0
            ? `UID ${uid} — ${loadedItems.length} barang dimuat. Tap barang untuk edit.`
            : `UID ${uid} siap diisi barang.`,
        );
      }
    } catch (error: any) {
      Alert.alert("Gagal sinkron NFC", error.message || "Coba scan ulang.");
    } finally {
      setSyncingTag(false);
    }
  };

  const saveTagName = async () => {
    if (!selectedTag) return;
    setSavingTagName(true);
    const { error } = await supabase
      .from("nfc_tags")
      .update({ name: tagName.trim() || null })
      .eq("id", selectedTag.id);
    setSavingTagName(false);

    if (error) {
      Alert.alert("Gagal simpan nama", error.message);
      return;
    }

    await fetchSavedTags();
    setSelectedTag((prev) =>
      prev ? { ...prev, name: tagName.trim() || null } : prev,
    );
    Alert.alert("Berhasil", "Nama NFC diperbarui.");
  };

  const refreshSelectedItems = async () => {
    if (!selectedTag) return;
    await fetchItems(selectedTag.uid);
    await fetchSavedTags();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item: NFCItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
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

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>NFC yang sudah terisi</Text>
          <Text style={styles.sectionSub}>
            Pilih kartu yang pernah discan tanpa harus scan ulang.
          </Text>
          {loadingTags ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
          ) : savedTags.length === 0 ? (
            <Text style={styles.emptyTags}>Belum ada NFC tersimpan.</Text>
          ) : (
            <View style={styles.tagList}>
              {savedTags.map((tag) => {
                const active = selectedTag?.id === tag.id;
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                    onPress={() => selectTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagChipTitle,
                        active && styles.tagChipTitleActive,
                      ]}
                    >
                      {tag.name || `NFC ${tag.uid.slice(-6)}`}
                    </Text>
                    <Text
                      style={[
                        styles.tagChipUid,
                        active && styles.tagChipUidActive,
                      ]}
                    >
                      {tag.uid}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.tagCard}>
          <View style={styles.tagTopRow}>
            <View style={styles.tagIcon}>
              <Ionicons name="pricetag-outline" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tagLabel}>NFC Aktif</Text>
              <Text style={styles.tagValue}>
                {selectedTag?.uid || "Belum ada kartu dipilih"}
              </Text>
            </View>
            {syncingTag && <ActivityIndicator color={colors.accent} />}
          </View>

          {selectedTag && (
            <>
              <Text style={styles.inputLabel}>Nama NFC (label)</Text>
              <TextInput
                style={styles.input}
                value={tagName}
                onChangeText={setTagName}
                placeholder="Contoh: Rak A / Flazz Toko"
                placeholderTextColor={colors.textPlaceholder}
              />
              <TouchableOpacity
                style={[styles.secondaryBtn, savingTagName && styles.disabledBtn]}
                onPress={saveTagName}
                disabled={savingTagName}
              >
                <Text style={styles.secondaryBtnText}>Simpan Nama NFC</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.addItemBtn,
              !selectedTag && styles.addItemBtnDisabled,
            ]}
            onPress={openAddModal}
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
          onAddPress={openAddModal}
          onEditPress={openEditModal}
        />
      </ScrollView>

      <NFCItemModal
        visible={modalOpen}
        nfcUid={selectedTag?.uid || null}
        item={editingItem}
        onClose={closeModal}
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
