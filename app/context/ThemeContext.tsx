import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

export const lightColors = {
  background: "#F8FAF8", // Putih bersih dengan sedikit nuansa hijau sangat muda
  surface: "#FFFFFF",
  surfaceAlt: "#F0F4F0",
  card: "#FFFFFF",
  cardAlt: "#F7F9F7",
  input: "#F0F4F0",
  border: "#E2E8E2",
  borderLight: "#EEF2EE",
  text: "#0A2E0A", // Hijau gelap (deep forest) untuk keterbacaan tinggi
  textSecondary: "#4A5D4A",
  textMuted: "#889988",
  textPlaceholder: "#B0BCB0",
  accent: "#10893E", // Hijau utama dari logo Juara Kelas
  accentSoft: "rgba(16, 137, 62, 0.1)",
  statusBar: "dark-content" as "dark-content" | "light-content",
  navBar: "#FFFFFF",
  modalOverlay: "rgba(0,0,0,0.6)",
  shadow: "#000000",
};

export const darkColors = {
  background: "#050B05", // Hitam pekat dengan tint hijau tua
  surface: "#121A12",
  surfaceAlt: "#1A241A",
  card: "#161E16",
  cardAlt: "#1D261D",
  input: "#1A241A",
  border: "#253325",
  borderLight: "#1D261D",
  text: "#F0F5F0", // Putih dengan sedikit rona hijau
  textSecondary: "#A0B0A0",
  textMuted: "#607060",
  textPlaceholder: "#455045",
  accent: "#16A34A", // Hijau logo yang disesuaikan untuk mode gelap agar lebih kontras
  accentSoft: "rgba(22, 163, 74, 0.2)",
  statusBar: "light-content" as "dark-content" | "light-content",
  navBar: "#121A12",
  modalOverlay: "rgba(0,0,0,0.8)",
  shadow: "#000000",
};

export type Colors = typeof lightColors;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;
  const toggleTheme = () => setTheme((p) => (p === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
