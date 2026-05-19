import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

export const lightColors = {
  background: "#F8FAF8",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F4F0",
  card: "#FFFFFF",
  cardAlt: "#F7F9F7",
  input: "#F0F4F0",
  border: "#E2E8E2",
  borderLight: "#EEF2EE",
  text: "#0A2E0A",
  textSecondary: "#4A5D4A",
  textMuted: "#889988",
  textPlaceholder: "#B0BCB0",
  accent: "#2D6A4F",
  accentSoft: "rgba(45, 106, 79, 0.12)",
  statusBar: "dark-content" as "dark-content" | "light-content",
  navBar: "#FFFFFF",
  modalOverlay: "rgba(0,0,0,0.6)",
  shadow: "#000000",
};

export const darkColors = {
  background: "#050B05",
  surface: "#121A12",
  surfaceAlt: "#1A241A",
  card: "#161E16",
  cardAlt: "#1D261D",
  input: "#1A241A",
  border: "#253325",
  borderLight: "#1D261D",
  text: "#F0F5F0",
  textSecondary: "#A0B0A0",
  textMuted: "#607060",
  textPlaceholder: "#455045",
  accent: "#40916C",
  accentSoft: "rgba(64, 145, 108, 0.2)",
  statusBar: "light-content" as "dark-content" | "light-content",
  navBar: "#121A12",
  modalOverlay: "rgba(0,0,0,0.8)",
  shadow: "#000000",
};

export type Colors = typeof lightColors;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("light");

  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
