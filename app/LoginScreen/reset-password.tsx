import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import KeyboardAwareScreen from "../components/KeyboardAwareScreen";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./LoginScreen.styles";

type Step = "email" | "otp" | "password";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async <T,>(
  promise: Promise<T>,
  ms = 8000,
): Promise<T | null> => {
  return Promise.race([promise, wait(ms).then(() => null)]);
};

const ResetPasswordScreen: React.FC = () => {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goToLogin = () => {
    setLoading(false);
    router.replace("/LoginScreen/LoginScreen");
  };

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert("Kesalahan", "Email wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

      if (error) throw error;

      Alert.alert("OTP Dikirim", "Cek email kamu untuk kode reset password.");
      setStep("otp");
    } catch (error: any) {
      Alert.alert("Gagal", error?.message || "Gagal mengirim OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      Alert.alert("Kesalahan", "Email wajib diisi.");
      return;
    }

    if (!trimmedOtp) {
      Alert.alert("Kesalahan", "Kode OTP wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const result = await withTimeout(
        supabase.auth.verifyOtp({
          email: trimmedEmail,
          token: trimmedOtp,
          type: "recovery",
        }),
        8000,
      );

      if (!result) {
        throw new Error("Verifikasi OTP terlalu lama. Coba lagi.");
      }

      if (result.error) throw result.error;

      if (!result.data.session) {
        throw new Error(
          "OTP berhasil diverifikasi, tetapi sesi reset password tidak ditemukan.",
        );
      }

      setStep("password");
      Alert.alert("Berhasil", "Kode OTP benar. Silakan buat password baru.");
    } catch (error: any) {
      Alert.alert("OTP Salah", error?.message || "Kode OTP tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedNewPassword || !trimmedConfirmPassword) {
      Alert.alert("Kesalahan", "Kata sandi baru dan konfirmasi wajib diisi.");
      return;
    }

    if (trimmedNewPassword.length < 6) {
      Alert.alert("Kesalahan", "Kata sandi minimal 6 karakter.");
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      Alert.alert("Kesalahan", "Konfirmasi kata sandi tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const result = await withTimeout(
        supabase.auth.updateUser({
          password: trimmedNewPassword,
        }),
        8000,
      );

      if (result && result.error) {
        throw result.error;
      }

      setLoading(false);

      setTimeout(() => {
        supabase.auth.signOut().catch((error) => {
          console.log("Sign out setelah reset password gagal:", error);
        });
      }, 300);

      router.replace("/LoginScreen/LoginScreen");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Gagal", error?.message || "Gagal mengubah password.");
    }
  };

  const renderContent = () => {
    if (step === "email") {
      return (
        <>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@contoh.com"
              placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.signInText}>Kirim Kode OTP</Text>
            )}
          </TouchableOpacity>
        </>
      );
    }

    if (step === "otp") {
      return (
        <>
          <Text style={styles.label}>Kode OTP</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Masukkan kode OTP"
              placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
              keyboardType="number-pad"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.signInText}>Verifikasi OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={loading}
            style={{ marginTop: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#2D6A4F", fontWeight: "700" }}>
              Kirim ulang kode OTP
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Kata Sandi Baru</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Password baru"
            placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
            secureTextEntry
          />
        </View>

        <Text style={styles.label}>Konfirmasi Kata Sandi Baru</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Ulangi password baru"
            placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.signInButton, loading && { opacity: 0.7 }]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.signInText}>Simpan Kata Sandi Baru</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <KeyboardAwareScreen
      style={styles.flex}
      contentContainerStyle={{ flexGrow: 1 }}
      extraScrollHeight={48}
    >
      <View style={[styles.topSection, { height: 140 }]}>
        <Text style={styles.welcomeText}>Atur Ulang Kata Sandi</Text>
        <Text style={styles.welcomeSub}>
          {step === "email"
            ? "Masukkan email akun kamu"
            : step === "otp"
              ? "Masukkan kode OTP dari email"
              : "Buat kata sandi baru"}
        </Text>
      </View>

      <View style={[styles.bottomSection, isDark && styles.bottomSectionDark]}>
        <TouchableOpacity onPress={goToLogin} style={{ marginBottom: 20 }}>
          <Text style={{ color: "#2D6A4F", fontWeight: "600", fontSize: 14 }}>
            ← Kembali ke Masuk
          </Text>
        </TouchableOpacity>

        {renderContent()}
      </View>
    </KeyboardAwareScreen>
  );
};

export default ResetPasswordScreen;
