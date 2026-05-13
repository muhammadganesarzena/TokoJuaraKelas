import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const ORANGE = "#2D6A4F";

export default function EditProfile() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const { colors } = useTheme();

  const [name, setName] = useState(profile.name);
  const [major, setMajor] = useState(profile.major ?? "Informatics");
  const [dob, setDob] = useState(profile.dob ?? "31/03/2005");
  const [nim, setNim] = useState(profile.nim);
  const [classOf, setClassOf] = useState(profile.classOf ?? "23");
  const [gender, setGender] = useState(profile.gender ?? "male");
  const [image, setImage] = useState(profile.image);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const save = () => {
    setProfile({ ...profile, name, nim, image, major, dob, classOf, gender });
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: image || DEFAULT_IMAGE }} style={styles.avatar} />
        <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Fields */}
      <FloatingInput
        label="Full name"
        value={name}
        onChangeText={setName}
        colors={colors}
      />
      <FloatingInput
        label="Major"
        value={major}
        onChangeText={setMajor}
        colors={colors}
      />
      <FloatingInput
        label="Date of birth"
        value={dob}
        onChangeText={setDob}
        colors={colors}
      />
      <FloatingInput
        label="NIM"
        value={nim}
        onChangeText={setNim}
        colors={colors}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FloatingInput
            label="Class of"
            value={classOf}
            onChangeText={setClassOf}
            colors={colors}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <FloatingInput
            label="Gender"
            value={gender}
            onChangeText={setGender}
            colors={colors}
          />
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FloatingInput({
  label,
  value,
  onChangeText,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: any;
}) {
  return (
    <View style={[fieldStyles.wrapper, { backgroundColor: colors.surfaceAlt }]}>
      <Text style={[fieldStyles.label, { color: colors.textMuted }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[fieldStyles.input, { color: colors.text }]}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    marginBottom: 12,
  },
  label: { fontSize: 11, marginBottom: 2 },
  input: { fontSize: 15, paddingVertical: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700" },

  avatarWrapper: { alignSelf: "center", marginBottom: 28 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: ORANGE,
    backgroundColor: "#E0E0E0",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },

  row: { flexDirection: "row" },

  saveBtn: {
    marginTop: 16,
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
