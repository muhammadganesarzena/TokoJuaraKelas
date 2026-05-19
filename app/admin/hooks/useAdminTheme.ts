import { useMemo } from "react";
import { Colors, useTheme } from "../../context/ThemeContext";
import { createAdminBaseStyles } from "../styles/adminBaseStyles";
import {
  CatalogPalette,
  createCatalogPalette,
  createCatalogStyles,
} from "../styles/catalogTheme";

export function useAdminTheme() {
  const { colors, isDark, theme, toggleTheme, setTheme } = useTheme();

  return useMemo(() => {
    const palette = createCatalogPalette(colors, isDark);
    const catalogStyles = createCatalogStyles(palette, isDark);
    const base = createAdminBaseStyles(colors, isDark);

    return {
      colors,
      isDark,
      theme,
      toggleTheme,
      setTheme,
      palette,
      catalogStyles,
      base,
    };
  }, [colors, isDark, theme, toggleTheme, setTheme]);
}

export type AdminTheme = {
  colors: Colors;
  isDark: boolean;
  palette: CatalogPalette;
  catalogStyles: ReturnType<typeof createCatalogStyles>;
  base: ReturnType<typeof createAdminBaseStyles>;
};
