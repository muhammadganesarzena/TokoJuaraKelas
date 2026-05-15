import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onMenuPress: () => void;
};

export default function AdminHeader({ title, onMenuPress }: Props) {
  return (
    <View style={styles.header}>
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
    backgroundColor: "#1B4332",
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
