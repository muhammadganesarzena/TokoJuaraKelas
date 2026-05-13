import { Dimensions, StyleSheet } from "react-native";

type Theme = "light" | "dark";

const { width } = Dimensions.get("window");

const themeColors = {
  light: {
    background: "#FFFFFF",
  },
  dark: {
    background: "#000000",
  },
};

export const getStyles = (theme: Theme) => {
  const colors = themeColors[theme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: width * 3,
      height: 200,
    },
  });
};
