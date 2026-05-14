import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./LoginScreen.styles";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = getStyles(isDark);
  const trimmedEmail = email.trim().toLowerCase();

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const redirectTo = "tokojuarakelas://";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
      if (!data?.url) return;

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type !== "success") return;

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = session?.user;

      if (!user) {
        router.replace({
          pathname: "/LoginScreen/RegisterScreen",
          params: {
            mode: "google",
          },
        });

        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        router.replace("/LoginScreen/RegisterScreen");
        return;
      }

      router.replace("/Homepage/Homepage");
    } catch (error: any) {
      Alert.alert("Google Login Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    let valid = true;
    setEmailError(false);
    setPasswordError(false);

    if (trimmedEmail === "") {
      setEmailError(true);
      valid = false;
    }

    if (password.trim() === "") {
      setPasswordError(true);
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    try {
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("email", trimmedEmail)
        .eq("password", password.trim())
        .maybeSingle();

      if (adminError) {
        console.warn("Admin login check failed:", adminError.message);
      }

      if (adminData) {
        router.replace("/admin/Dashboard");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) {
        const message =
          error.message === "Email not confirmed"
            ? "Email belum dikonfirmasi. Cek inbox email kamu."
            : error.message;

        Alert.alert("Login Gagal", message);
        return;
      }

      router.replace("/Homepage/Homepage");
    } catch {
      Alert.alert("Login Gagal", "Email atau Password salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/LoginScreen/reset-password");
  };

  return (
    <View style={styles.flex}>
      <View style={styles.topSection}>
        <Image
          source={require("../../assets/images/SplashScreen/GuitarLogoWhite.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.welcomeSub}>Sign in to continue</Text>
      </View>

      <View style={[styles.bottomSection, isDark && styles.bottomSectionDark]}>
        <Text style={styles.title}>Sign In</Text>

        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.inputContainer, emailError && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="yourname@email.com"
            placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View
          style={[styles.inputContainer, passwordError && styles.inputError]}
        >
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={isDark ? "#555" : "#CCCCCC"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                showPassword
                  ? require("../../assets/images/Login/eye 1.png")
                  : require("../../assets/images/Login/eye-off 1.png")
              }
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotContainer}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signInButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.signInText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.otherWayText}>or sign in with</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Image
              source={require("../../assets/images/Login/Google.png")}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/LoginScreen/RegisterScreen")}
        >
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{"Don't have an account? "}</Text>
            <Text style={styles.registerLink}>Sign Up</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
