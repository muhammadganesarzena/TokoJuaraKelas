import { router, useLocalSearchParams } from "expo-router";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { clearAdminSession } from "../../lib/adminSession";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./LoginScreen.styles";

type FieldConfig = {
  label: string;
  value: string;
  setter: (value: string) => void;
  placeholder: string;
  required?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboard?: "default" | "email-address" | "phone-pad";
  secure?: boolean;
  multiline?: boolean;
  editable?: boolean;
};

const RegisterScreen: React.FC = () => {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const params = useLocalSearchParams<{ mode?: string }>();
  const isGoogleMode = params.mode === "google";

  useEffect(() => {
    const checkUser = async () => {
      if (!isGoogleMode) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        router.replace("/LoginScreen/LoginScreen");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Cek profile Google error:", error.message);
      }

      if (profile) {
        await clearAdminSession();
        router.replace("/Homepage/Homepage");
        return;
      }

      setIsGoogleUser(true);
      setEmail(user.email || "");

      if (user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      } else if (user.user_metadata?.name) {
        setFullName(user.user_metadata.name);
      }
    };

    checkUser();
  }, [isGoogleMode]);

  const createProfile = async (userId: string, userEmail: string) => {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName.trim(),
        username: username.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        email: userEmail,
      },
      { onConflict: "id" },
    );

    if (error) throw error;
  };

  const handleRegister = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !username.trim()) {
      Alert.alert("Error", "Nama Lengkap dan Username wajib diisi.");
      return;
    }

    if (!isGoogleUser && (!trimmedEmail || !password.trim())) {
      Alert.alert("Error", "Email dan Password wajib diisi.");
      return;
    }

    if (!isGoogleUser && password.trim().length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      if (isGoogleUser) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) throw new Error("Sesi Google tidak ditemukan.");

        await createProfile(
          session.user.id,
          session.user.email || trimmedEmail,
        );
        await clearAdminSession();

        Alert.alert("Sukses", "Profil berhasil disimpan.", [
          {
            text: "OK",
            onPress: () => router.replace("/Homepage/Homepage"),
          },
        ]);

        return;
      }

      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim(),
          },
        },
      });

      if (error) throw error;

      setOtpStep(true);

      Alert.alert(
        "Kode OTP Dikirim",
        "Cek email kamu, lalu masukkan kode OTP untuk menyelesaikan pendaftaran.",
      );
    } catch (error: any) {
      Alert.alert("Registrasi Gagal", error?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      Alert.alert("Error", "Masukkan kode OTP.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedOtp,
        type: "signup",
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Verifikasi berhasil, tapi user tidak ditemukan.");
      }

      await createProfile(data.user.id, data.user.email || trimmedEmail);
      await clearAdminSession();

      Alert.alert("Sukses", "Akun berhasil diverifikasi.", [
        {
          text: "OK",
          onPress: () => router.replace("/Homepage/Homepage"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Verifikasi Gagal", error?.message || "Kode OTP salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert("Error", "Email tidak boleh kosong.");
      return;
    }

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
      });

      if (error) throw error;

      Alert.alert("Berhasil", "Kode OTP sudah dikirim ulang.");
    } catch (error: any) {
      Alert.alert("Gagal", error?.message || "Gagal mengirim ulang OTP.");
    } finally {
      setResending(false);
    }
  };

  const fields: FieldConfig[] = [
    {
      label: "Nama Lengkap",
      value: fullName,
      setter: setFullName,
      placeholder: "John Doe",
      required: true,
    },
    {
      label: "Username",
      value: username,
      setter: setUsername,
      placeholder: "johndoe",
      required: true,
      autoCapitalize: "none",
    },
    {
      label: "Email",
      value: email,
      setter: setEmail,
      placeholder: "john@email.com",
      required: true,
      autoCapitalize: "none",
      keyboard: "email-address",
      editable: !isGoogleUser,
    },
    ...(!isGoogleUser
      ? [
          {
            label: "Password",
            value: password,
            setter: setPassword,
            placeholder: "••••••••",
            required: true,
            secure: true,
          },
        ]
      : []),
    {
      label: "No. HP",
      value: phone,
      setter: setPhone,
      placeholder: "0812...",
      keyboard: "phone-pad",
    },
    {
      label: "Alamat",
      value: address,
      setter: setAddress,
      placeholder: "Jalan...",
      multiline: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <View style={[styles.topSection, { height: 140 }]}>
        <Text style={styles.welcomeText}>
          {otpStep
            ? "Verifikasi Email"
            : isGoogleUser
              ? "Lengkapi Profil"
              : "Buat Akun"}
        </Text>
        <Text style={styles.welcomeSub}>
          {otpStep
            ? "Masukkan kode OTP dari email"
            : isGoogleUser
              ? "Isi data diri kamu"
              : "Daftar dan mulai belanja"}
        </Text>
      </View>

      <ScrollView
        style={[styles.bottomSection, isDark && styles.bottomSectionDark]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => (otpStep ? setOtpStep(false) : router.back())}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ color: "#2D6A4F", fontWeight: "600", fontSize: 14 }}>
            ← {otpStep ? "Kembali ke Form" : "Kembali ke Login"}
          </Text>
        </TouchableOpacity>

        {otpStep ? (
          <>
            <Text style={styles.label}>Kode OTP *</Text>
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
                <Text style={styles.signInText}>Verifikasi Akun</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resending}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={{ color: "#2D6A4F", fontWeight: "700" }}>
                {resending ? "Mengirim ulang..." : "Kirim ulang kode OTP"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {fields.map((field) => (
              <View key={field.label}>
                <Text style={styles.label}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    field.multiline && {
                      height: 80,
                      alignItems: "flex-start",
                      paddingTop: 8,
                    },
                    field.editable === false && { opacity: 0.7 },
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
                    secureTextEntry={field.secure}
                    autoCapitalize={field.autoCapitalize || "words"}
                    keyboardType={field.keyboard || "default"}
                    multiline={field.multiline}
                    editable={field.editable ?? true}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.signInButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.signInText}>
                  {isGoogleUser ? "Simpan Profil" : "Buat Akun"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/LoginScreen/LoginScreen")}
            >
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Sudah punya akun? </Text>
                <Text style={styles.registerLink}>Login</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
