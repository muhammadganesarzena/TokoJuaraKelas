import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { supabase } from "../../lib/supabase";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./Payment.styles";

const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");
const QRIS_IMAGE = require("../../assets/qris.jpeg");

type FulfillmentType = "pickup" | "delivery";

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  proof?: string;
  fulfillment?: string;
};

type ProofAsset = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

const adminFee = 5000;

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

const Payment: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cartItems, totalPrice } = useCart();

  const [fulfillment, setFulfillment] = useState<FulfillmentType | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [proof, setProof] = useState<ProofAsset | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [refNumber] = useState(
    () => `ORD-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
  );
  const [pickupCode] = useState(
    () => `PU-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
  );

  const totalAmount = totalPrice + adminFee;

  const validate = () => {
    const next: FieldErrors = {};
    if (!fulfillment) next.fulfillment = "Pilih metode pengambilan dulu.";
    if (!name.trim()) next.name = "Nama wajib diisi.";
    if (!phone.trim()) next.phone = "Nomor HP wajib diisi.";
    if (!email.trim()) next.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email.trim()))
      next.email = "Format email tidak valid.";
    if (!proof) next.proof = "Upload bukti pembayaran QRIS.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const selectFulfillment = (value: FulfillmentType) => {
    if (value === "delivery") {
      Alert.alert(
        "Antar belum tersedia",
        "Untuk sekarang checkout difokuskan ke pick up di toko dulu.",
      );
      return;
    }
    setFulfillment(value);
    setErrors((prev) => ({ ...prev, fulfillment: undefined }));
  };

  const pickProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      setProof(result.assets[0]);
      setErrors((prev) => ({ ...prev, proof: undefined }));
    }
  };

  const uploadProof = async (userId: string) => {
    if (!proof?.base64) return null;
    const ext = proof.fileName?.split(".").pop() || "jpg";
    const path = `${userId}/${refNumber}.${ext}`;
    const { error } = await supabase.storage
      .from("payment-proofs")
      .upload(path, base64ToArrayBuffer(proof.base64), {
        contentType: proof.mimeType || "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
    return data.publicUrl;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    if (cartItems.length === 0) {
      Alert.alert("Cart kosong", "Tambahkan produk sebelum checkout.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Silakan login terlebih dulu.");

      const proofUrl = await uploadProof(user.id);
      const products = cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        image: product.image_url ? { uri: product.image_url } : product.image,
      }));

      const orderPayload = {
        user_id: user.id,
        ref_number: refNumber,
        pickup_code: pickupCode,
        fulfillment_type: "pickup",
        payment_method: "qris",
        payment_status: "waiting_verification",
        payment_proof_url: proofUrl,
        customer_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        order_note: orderNote.trim() || null,
        items: products,
        subtotal: totalPrice,
        admin_fee: adminFee,
        total_price: totalAmount,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (error) throw error;

      router.replace({
        pathname: "/Payment/OrderConfirmation",
        params: {
          orderId: data.id,
          refNumber,
          pickupCode,
          paymentTime: new Date().toLocaleString("id-ID"),
          totalPrice: String(totalPrice),
          adminFee: String(adminFee),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          fulfillmentType: "pickup",
        },
      });
    } catch (err: any) {
      Alert.alert("Gagal checkout", err.message || "Order belum bisa dibuat.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>Metode Pesanan</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              fulfillment === "pickup" && styles.optionCardSelected,
            ]}
            onPress={() => selectFulfillment("pickup")}
          >
            <Ionicons name="storefront-outline" size={24} color="#E8622A" />
            <Text style={styles.optionTitle}>Pick Up</Text>
            <Text style={styles.optionSub}>Ambil langsung di toko</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => selectFulfillment("delivery")}
          >
            <Ionicons
              name="bicycle-outline"
              size={24}
              color={colors.textMuted}
            />
            <Text style={styles.optionTitle}>Antar</Text>
            <Text style={styles.optionSub}>Segera hadir</Text>
          </TouchableOpacity>
        </View>
        {errors.fulfillment && (
          <Text style={styles.errorText}>{errors.fulfillment}</Text>
        )}

        {fulfillment === "pickup" && (
          <>
            <View style={styles.sectionRow}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Data Pemesan</Text>
            </View>

            <Text style={styles.inputLabel}>Nama*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.textPlaceholder}
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.inputLabel}>Nomor HP*</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="+62 812 3456 7890"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            <Text style={styles.inputLabel}>Email*</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="email@example.com"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <Text style={styles.inputLabel}>Catatan Order</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder='Contoh: "Saya mau yang warna merah"'
              placeholderTextColor={colors.textPlaceholder}
              value={orderNote}
              onChangeText={setOrderNote}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.sectionRow}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Bayar QRIS</Text>
            </View>

            <View style={styles.qrisCard}>
              <Text style={styles.qrisTitle}>QRIS</Text>
              <View style={styles.qrisBox}>
                <Image
                  source={QRIS_IMAGE}
                  style={styles.qrisImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrisAmount}>{formatRupiah(totalAmount)}</Text>
            </View>

            <TouchableOpacity style={styles.uploadBtn} onPress={pickProof}>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              <Text style={styles.uploadBtnText}>
                {proof ? "Ganti Bukti Pembayaran" : "Upload Bukti Pembayaran"}
              </Text>
            </TouchableOpacity>
            {proof && (
              <Image source={{ uri: proof.uri }} style={styles.proofPreview} />
            )}
            {errors.proof && (
              <Text style={styles.errorText}>{errors.proof}</Text>
            )}
          </>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
          Order Items
        </Text>
        {cartItems.map(({ product, quantity }) => (
          <View key={product.id} style={styles.orderItem}>
            {product.image ? (
              <Image
                source={product.image}
                style={styles.orderImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.orderImage} />
            )}
            <View style={styles.orderInfo}>
              <Text style={styles.orderName}>{product.name}</Text>
              <Text style={styles.orderQty}>Qty: {quantity}</Text>
            </View>
            <Text style={styles.orderPrice}>
              {formatRupiah(product.price * quantity)}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Ringkasan</Text>
        <View style={styles.summaryCard}>
          {[
            ["Subtotal", totalPrice],
            ["Admin Fee", adminFee],
            ["Pick Up", 0],
          ].map(([label, val]) => (
            <View key={label as string} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(val as number)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalAmount)}</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payBtn, submitting && styles.payBtnDisabled]}
          onPress={submitOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payBtnText}>Kirim Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Payment;
