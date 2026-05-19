import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KeyboardAwareModal from "../../components/KeyboardAwareModal";
import { Colors, useTheme } from "../../context/ThemeContext";
import { supabase } from "../../../lib/supabase";
import type { NFCItem } from "./NFCItemsList";

type PickedImage = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

type Props = {
  visible: boolean;
  nfcUid: string | null;
  item: NFCItem | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const base64ToArrayBuffer = (base64: string) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    const enc1 = chars.indexOf(clean.charAt(i));
    const enc2 = chars.indexOf(clean.charAt(i + 1));
    const enc3 = chars.indexOf(clean.charAt(i + 2));
    const enc4 = chars.indexOf(clean.charAt(i + 3));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    bytes.push(chr1);
    if (enc3 !== 64 && enc3 !== -1) bytes.push(chr2);
    if (enc4 !== 64 && enc4 !== -1) bytes.push(chr3);
  }

  return new Uint8Array(bytes).buffer;
};

export default function NFCItemModal({
  visible,
  nfcUid,
  item,
  onClose,
  onSaved,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isEdit = !!item;
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setProductName(item?.product_name || "");
    setQty(item ? String(item.qty) : "");
    setImageUrl(item?.image_url || "");
    setPickedImage(null);
  }, [visible, item]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: true,
    });
    if (!result.canceled) {
      setPickedImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (pickedImage?.base64) {
      const ext = pickedImage.fileName?.split(".").pop() || "jpg";
      const path = `${nfcUid || "nfc"}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("nfc-item-images")
        .upload(path, base64ToArrayBuffer(pickedImage.base64), {
          contentType: pickedImage.mimeType || "image/jpeg",
          upsert: true,
        });
      if (error) throw error;
      const { data } = supabase.storage
        .from("nfc-item-images")
        .getPublicUrl(path);
      return data.publicUrl;
    }
    return imageUrl.trim() || null;
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
      Alert.alert("Jumlah tidak valid", "Masukkan jumlah lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      const nextImageUrl = await uploadImage();
      const payload = {
        product_name: cleanName,
        qty: parsedQty,
        image_url: nextImageUrl,
      };

      if (isEdit && item) {
        const { error } = await supabase
          .from("nfc_items")
          .update(payload)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("nfc_items").insert({
          nfc_uid: nfcUid,
          ...payload,
        });
        if (error) throw error;
      }

      await onSaved();
      onClose();
    } catch (error: any) {
      Alert.alert(
        isEdit ? "Gagal update barang" : "Gagal simpan barang",
        error.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = () => {
    if (!item) return;
    Alert.alert("Hapus Barang", `Hapus "${item.product_name}" dari NFC ini?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          const { error } = await supabase
            .from("nfc_items")
            .delete()
            .eq("id", item.id);
          setDeleting(false);
          if (error) {
            Alert.alert("Gagal hapus", error.message);
            return;
          }
          await onSaved();
          onClose();
        },
      },
    ]);
  };

  const previewUri = pickedImage?.uri || imageUrl;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <KeyboardAwareModal extraScrollHeight={48}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>
                  {isEdit ? "Edit Barang NFC" : "Tambah Barang NFC"}
                </Text>
                <Text style={styles.subtitle}>{nfcUid || "Belum ada UID"}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePickBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={18} color={colors.accent} />
              <Text style={styles.imagePickText}>
                {previewUri ? "Ganti Gambar" : "Pilih Gambar Barang"}
              </Text>
            </TouchableOpacity>

            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
                <Text style={styles.previewPlaceholderText}>
                  Gambar opsional
                </Text>
              </View>
            )}

            <Text style={styles.label}>Nama Barang</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Contoh: Senar Gitar D'Addario"
              placeholderTextColor={colors.textPlaceholder}
            />

            <Text style={styles.label}>Jumlah</Text>
            <TextInput
              style={styles.input}
              value={qty}
              onChangeText={setQty}
              placeholder="Contoh: 12"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledBtn]}
              onPress={saveItem}
              disabled={saving || deleting}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>
                  {isEdit ? "Simpan Perubahan" : "Simpan ke NFC"}
                </Text>
              )}
            </TouchableOpacity>

            {isEdit && (
              <TouchableOpacity
                style={[styles.deleteBtn, deleting && styles.disabledBtn]}
                onPress={deleteItem}
                disabled={deleting || saving}
              >
                {deleting ? (
                  <ActivityIndicator color="#E53935" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                    <Text style={styles.deleteText}>Hapus Barang</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </KeyboardAwareModal>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 22,
      paddingBottom: 36,
      maxHeight: "92%",
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    handle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 18,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { fontSize: 18, fontWeight: "900", color: colors.text },
    subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    imagePickBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accentSoft,
      borderRadius: 12,
      paddingVertical: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imagePickText: { color: colors.accent, fontWeight: "800", fontSize: 13 },
    preview: {
      width: "100%",
      height: 160,
      borderRadius: 14,
      marginBottom: 8,
      backgroundColor: colors.input,
    },
    previewPlaceholder: {
      width: "100%",
      height: 160,
      borderRadius: 14,
      marginBottom: 8,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    previewPlaceholderText: { fontSize: 12, color: colors.textMuted },
    label: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textSecondary,
      marginTop: 14,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
    },
    saveBtn: {
      marginTop: 20,
      height: 50,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteBtn: {
      marginTop: 12,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(229, 57, 53, 0.35)",
      backgroundColor: "rgba(229, 57, 53, 0.1)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    disabledBtn: { opacity: 0.7 },
    saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
    deleteText: { color: "#E53935", fontSize: 14, fontWeight: "800" },
  });
