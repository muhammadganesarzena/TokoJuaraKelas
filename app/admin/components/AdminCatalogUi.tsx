import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAdminTheme } from "../hooks/useAdminTheme";

type ToolbarProps = {
  count: number;
  countLabel: string;
  addLabel: string;
  onAdd: () => void;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  addBlock?: boolean;
};

export function AdminCatalogToolbar({
  count,
  countLabel,
  addLabel,
  onAdd,
  hint,
  icon,
  addBlock = false,
}: ToolbarProps) {
  const { palette: C, catalogStyles: s } = useAdminTheme();

  return (
    <View style={s.toolbarSection}>
      {hint ? (
        <View style={s.hintCard}>
          <Ionicons name="information-circle" size={20} color={C.primary} />
          <Text style={s.hintText}>{hint}</Text>
        </View>
      ) : null}
      <View style={[s.toolbarRow, addBlock && { flexDirection: "column" }]}>
        <View style={[s.statPill, addBlock && { width: "100%" }]}>
          <View style={s.statIconWrap}>
            <Ionicons name={icon} size={20} color={C.primary} />
          </View>
          <View>
            <Text style={s.statValue}>{count}</Text>
            <Text style={s.statLabel}>{countLabel}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[s.addBtn, addBlock ? s.addBtnBlock : s.addBtnFull]}
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={20} color={C.onPrimary} />
          <Text style={s.addBtnText}>{addLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type EmptyProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export function AdminCatalogEmpty({ icon, title, subtitle }: EmptyProps) {
  const { palette: C, catalogStyles: s } = useAdminTheme();

  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={32} color={C.primary} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptySub}>{subtitle}</Text>
    </View>
  );
}

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function AdminModalHeader({ title, subtitle, icon }: ModalHeaderProps) {
  const { palette: C, catalogStyles: s } = useAdminTheme();

  return (
    <>
      <View style={s.modalHandle} />
      <View style={s.modalTitleRow}>
        <View style={s.modalTitleIcon}>
          <Ionicons name={icon} size={22} color={C.primary} />
        </View>
        <Text style={s.modalTitle}>{title}</Text>
      </View>
      {subtitle ? <Text style={s.modalSubtitle}>{subtitle}</Text> : null}
    </>
  );
}

export function AdminIconActionButtons({
  onEdit,
  onDelete,
  editLabel = "Ubah",
  deleteLabel = "Hapus",
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}) {
  const { palette: C, catalogStyles: s } = useAdminTheme();

  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      <TouchableOpacity
        style={s.actionBtnOutline}
        onPress={onEdit}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={14} color={C.primary} />
        <Text style={s.actionBtnOutlineText}>{editLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.actionBtnDanger}
        onPress={onDelete}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={14} color={C.danger} />
        <Text style={s.actionBtnDangerText}>{deleteLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
