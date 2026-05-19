import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Theme = "light" | "dark";

interface SplashScreenProps {
  theme?: Theme;
}

const { width } = Dimensions.get("window");

const logoLight = require("../../assets/images/SplashScreen/GuitarLogoBlack.png");
const logoDark = require("../../assets/images/SplashScreen/GuitarLogoWhite.png");

const SplashScreen: React.FC<SplashScreenProps> = ({ theme = "light" }) => {
  const isDark = theme === "dark";
  const logoSource = isDark ? logoDark : logoLight;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(0)).current;
  const circle2Scale = useRef(new Animated.Value(0)).current;
  const circle3Scale = useRef(new Animated.Value(0)).current;
  const exitFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Lingkaran dekoratif
    Animated.parallel([
      Animated.timing(circle1Scale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(circle2Scale, {
        toValue: 1,
        duration: 1000,
        delay: 150,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(circle3Scale, {
        toValue: 1,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: true,
      }),
    ]).start();

    // Logo
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Teks
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Loading dots
    const dotAnimation = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    Animated.sequence([
      Animated.delay(1200),
      Animated.parallel([
        dotAnimation(dot1, 0),
        dotAnimation(dot2, 200),
        dotAnimation(dot3, 400),
      ]),
    ]).start();

    // Exit
    const exitTimer = setTimeout(() => {
      Animated.timing(exitFade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/onboarding");
      });
    }, 3000);

    return () => clearTimeout(exitTimer);
  }, []);

  // Warna tema hijau-putih
  const bg = isDark ? "#0A1A0F" : "#FFFFFF";
  const accent = "#2E7D32"; // hijau tua
  const accentMid = "#4CAF50"; // hijau sedang
  const accentLight = "#A5D6A7"; // hijau muda
  const accentPale = isDark ? "#1B3320" : "#E8F5E9"; // hijau sangat pucat
  const textColor = isDark ? "#FFFFFF" : "#1A2E1A";
  const subColor = isDark ? "#81C784" : "#66BB6A";

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: bg, opacity: exitFade }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={bg}
      />

      {/* Lingkaran dekoratif kanan atas */}
      <Animated.View
        style={[
          styles.circle1,
          {
            backgroundColor: accentPale,
            transform: [{ scale: circle1Scale }],
          },
        ]}
      />

      {/* Lingkaran border kiri bawah */}
      <Animated.View
        style={[
          styles.circle2,
          {
            borderColor: accentLight,
            transform: [{ scale: circle2Scale }],
          },
        ]}
      />

      {/* Lingkaran kecil aksen */}
      <Animated.View
        style={[
          styles.circle3,
          {
            backgroundColor: accentMid,
            transform: [{ scale: circle3Scale }],
          },
        ]}
      />

      {/* Badge hijau di belakang logo */}
      <Animated.View
        style={[
          styles.logoBadge,
          {
            backgroundColor: accentPale,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Logo */}
      <Animated.Image
        source={logoSource}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
            tintColor: isDark ? "#FFFFFF" : accent,
          },
        ]}
        resizeMode="contain"
      />

      {/* Nama App & Tagline */}
      <Animated.View
        style={{
          opacity: textFade,
          transform: [{ translateY: textSlide }],
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={[styles.appName, { color: textColor }]}>
          Toko <Text style={{ color: accent }}>Juara</Text> Kelas
        </Text>

        {/* Garis aksen bawah nama */}
        <View style={[styles.underline, { backgroundColor: accentMid }]} />

        <Text style={[styles.tagline, { color: subColor }]}>
          Alat tulis terbaik untukmu
        </Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === 1 ? accentMid : accentLight,
                opacity: dot,
                transform: [
                  {
                    scale: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* Garis bawah dekoratif */}
      <Animated.View
        style={[
          styles.bottomBar,
          {
            backgroundColor: accentMid,
            opacity: textFade,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle1: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    top: -width * 0.25,
    right: -width * 0.25,
    opacity: 0.7,
  },
  circle2: {
    position: "absolute",
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: width * 0.325,
    bottom: -width * 0.15,
    left: -width * 0.2,
    borderWidth: 2,
    opacity: 0.3,
  },
  circle3: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    top: "25%",
    left: "15%",
    opacity: 0.6,
  },
  logoBadge: {
    position: "absolute",
    width: width * 0.48,
    height: width * 0.48,
    borderRadius: width * 0.24,
  },
  logo: {
    width: width * 0.38,
    height: width * 0.38,
    marginBottom: 28,
  },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  underline: {
    width: 48,
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13,
    letterSpacing: 1.2,
    fontWeight: "400",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 90,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: width * 0.4,
    height: 4,
    borderRadius: 2,
  },
});

export default SplashScreen;
