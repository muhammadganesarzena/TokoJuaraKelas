import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import KeyboardAwareScreen from "./components/KeyboardAwareScreen";
import { supabase } from "../lib/supabase";

const GREEN_DARK = "#1B4332";
const GREEN_MID = "#2D6A4F";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparingSession, setPreparingSession] = useState(true);

  useEffect(() => {
    const prepareRecoverySession = async () => {
      const url = await Linking.getInitialURL();
      const code = url ? new URL(url).searchParams.get("code") : null;

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      setPreparingSession(false);
    };

    prepareRecoverySession();
  }, []);

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      Alert.alert("Kata sandi terlalu pendek", "Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Kata sandi tidak sama", "Konfirmasi kata sandi harus sama.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      Alert.alert(
        "Kata sandi diperbarui",
        "Silakan masuk dengan kata sandi baru.",
        [
          {
            text: "Oke",
            onPress: () => router.replace("/LoginScreen/LoginScreen"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Gagal memperbarui password",
        error.message ||
          "Buka ulang link reset password dari email, lalu coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atur Ulang Kata Sandi</Text>
        <Text style={styles.headerSubtitle}>
          Buat kata sandi baru untuk akunmu
        </Text>
      </View>

      <KeyboardAwareScreen
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        extraScrollHeight={32}
      >
        <Text style={styles.title}>Kata Sandi Baru</Text>

        {preparingSession ? (
          <ActivityIndicator color={GREEN_MID} />
        ) : (
          <>
            <Text style={styles.label}>Kata Sandi Baru</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#999999"
              secureTextEntry
            />

            <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi kata sandi baru"
              placeholderTextColor="#999999"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Perbarui Kata Sandi</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/LoginScreen/LoginScreen")}
            >
              <Text style={styles.backText}>Kembali ke Masuk</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAwareScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_DARK,
  },
  header: {
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#95D5B2",
    fontSize: 13,
    marginTop: 6,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  cardContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888888",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#E0E0E0",
    marginBottom: 24,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  button: {
    backgroundColor: GREEN_MID,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 18,
  },
  backText: {
    color: GREEN_MID,
    fontSize: 14,
    fontWeight: "700",
  },
});
