import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

type Props = {
  visible: boolean;
  nfcUid: string | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function AddItemModal({
  visible,
  nfcUid,
  onClose,
  onSaved,
}: Props) {
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setProductName("");
    setQty("");
  };

  const saveItem = async () => {
    const cleanName = productName.trim();
    const parsedQty = Number(qty);

    if (!nfcUid) {
      Alert.alert("NFC belum dipilih", "Scan kartu NFC terlebih dulu.");
      return;
    }
    if (!cleanName) {
      Alert.alert("Nama barang wajib diisi.");
      return;
    }
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      Alert.alert("Qty tidak valid", "Masukkan qty lebih dari 0.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("nfc_items").insert({
      nfc_uid: nfcUid,
      product_name: cleanName,
      qty: parsedQty,
    });
    setSaving(false);

    if (error) {
      Alert.alert("Gagal simpan barang", error.message);
      return;
    }

    reset();
    await onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Tambah Barang</Text>
              <Text style={styles.subtitle}>{nfcUid || "Belum ada UID"}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nama Barang</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholder="Contoh: Senar Gitar D'Addario"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Qty</Text>
          <TextInput
            style={styles.input}
            value={qty}
            onChangeText={setQty}
            placeholder="Contoh: 12"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.disabledBtn]}
            onPress={saveItem}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Simpan ke NFC</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 36,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "900", color: "#1a1a2e" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1a1a2e",
  },
  saveBtn: {
    marginTop: 20,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#1B4332",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: { opacity: 0.7 },
  saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
