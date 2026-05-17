import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveAdminSession } from "../../lib/adminSession";
import { supabase } from "../../lib/supabase";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email dan Password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.trim())
        .eq("password", password.trim())
        .single();

      if (error || !data) {
        Alert.alert("Login Gagal", "Email atau Password admin salah.");
        return;
      }

      await supabase.auth.signOut();
      await saveAdminSession({
        id: data.id,
        email: data.email,
        name: data.name || data.full_name,
      });
      router.replace("/admin/overview");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      <Text style={styles.subtitle}>Toko Juara Kelas</Text>

      <Text style={styles.label}>Email Admin</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="admin@tokojuarakelas.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login sebagai Admin</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.backText}>← Kembali ke Login User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#C85C2D",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#2a2a3e",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#3a3a5e",
  },
  button: {
    backgroundColor: "#C85C2D",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  backBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: "#888",
    fontSize: 13,
  },
});
