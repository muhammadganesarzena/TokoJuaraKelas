import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  title: string;
  onMenuPress: () => void;
};

export default function AdminHeader({ title, onMenuPress }: Props) {
  const { colors, isDark } = useTheme();
  const headerBg = isDark ? colors.surfaceAlt : "#1B4332";

  return (
    <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: colors.border }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={headerBg}
      />
      <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress}>
        <View style={styles.bar} />
        <View style={[styles.bar, { width: 20 }]} />
        <View style={styles.bar} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    gap: 5,
  },
  bar: {
    width: 26,
    height: 2.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
