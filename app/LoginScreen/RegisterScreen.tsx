import { router } from "expo-router";
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
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./LoginScreen.styles";

const RegisterScreen: React.FC = () => {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsGoogleUser(true);
        setEmail(user.email || "");
        if (user.user_metadata?.full_name)
          setFullName(user.user_metadata.full_name);
      }
    };
    checkUser();
  }, []);

  const handleRegister = async () => {
    if (!fullName.trim() || !username.trim()) {
      Alert.alert("Error", "Nama Lengkap dan Username wajib diisi.");
      return;
    }
    if (!isGoogleUser && (!email.trim() || !password.trim())) {
      Alert.alert("Error", "Email dan Password wajib diisi.");
      return;
    }
    if (!isGoogleUser && password.trim().length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      let currentUserId = "";

      if (isGoogleUser) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesi Google tidak ditemukan.");
        currentUserId = user.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: email.trim(),
            password: password.trim(),
          },
        );
        if (authError) throw authError;
        if (!authData.user) throw new Error("Gagal membuat akun.");
        currentUserId = authData.user.id;
      }

      const { error: profileError } = await supabase.rpc("create_profile", {
        user_id: currentUserId,
        user_full_name: fullName.trim(),
        user_username: username.trim(),
        user_phone: phone.trim() || null,
        user_address: address.trim() || null,
      });

      if (profileError) throw profileError;

      Alert.alert(
        "Sukses",
        isGoogleUser ? "Profil berhasil disimpan!" : "Akun berhasil dibuat!",
        [{ text: "OK", onPress: () => router.replace("/Homepage/Homepage") }],
      );
    } catch (error: any) {
      Alert.alert("Registrasi Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
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
      autoCapitalize: "none" as const,
    },
    ...(!isGoogleUser
      ? [
          {
            label: "Email",
            value: email,
            setter: setEmail,
            placeholder: "john@email.com",
            required: true,
            autoCapitalize: "none" as const,
            keyboard: "email-address" as const,
          },
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
      keyboard: "phone-pad" as const,
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
      {/* Header hijau */}
      <View style={[styles.topSection, { height: 140 }]}>
        <Text style={styles.welcomeText}>
          {isGoogleUser ? "Lengkapi Profil" : "Buat Akun"}
        </Text>
        <Text style={styles.welcomeSub}>
          {isGoogleUser ? "Isi data diri kamu" : "Daftar dan mulai belanja"}
        </Text>
      </View>

      {/* Form putih */}
      <ScrollView
        style={[styles.bottomSection, isDark && styles.bottomSectionDark]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tombol back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ color: "#2D6A4F", fontWeight: "600", fontSize: 14 }}>
            ← Kembali ke Login
          </Text>
        </TouchableOpacity>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
