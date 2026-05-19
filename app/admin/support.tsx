import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useAdminTheme } from "./hooks/useAdminTheme";
import { Colors } from "../context/ThemeContext";

type UserProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
};

type ChatMessage = {
  id: string;
  user_id: string;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
};

type Conversation = UserProfile & {
  lastMessage?: ChatMessage;
};

export default function AdminChat() {
  const { colors } = useAdminTheme();
  const styles = useMemo(() => createSupportStyles(colors), [colors]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [latestMessages, setLatestMessages] = useState<
    Record<string, ChatMessage>
  >({});
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const selectedUserRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const conversations = useMemo<Conversation[]>(() => {
    return profiles
      .map((profile) => ({
        ...profile,
        lastMessage: latestMessages[profile.id],
      }))
      .sort((a, b) => {
        const aTime = a.lastMessage?.created_at || "";
        const bTime = b.lastMessage?.created_at || "";
        return bTime.localeCompare(aTime);
      });
  }, [profiles, latestMessages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (channelRef.current) return;

    const channel = supabase
      .channel(`admin-chat-conversations-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as ChatMessage;

          setLatestMessages((current) => ({
            ...current,
            [incoming.user_id]: incoming,
          }));

          setMessages((current) => {
            const activeUser = selectedUserRef.current;
            if (
              activeUser?.id === incoming.user_id &&
              !current.some((item) => item.id === incoming.id)
            ) {
              return [...current, incoming];
            }

            return current;
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
  }, [selectedUser]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const fetchConversations = async () => {
    setLoading(true);

    const [
      { data: profileData, error: profileError },
      { data: messageData, error: messageError },
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, username, email"),
      supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (profileError || messageError) {
      Alert.alert(
        "Kesalahan Chat",
        profileError?.message || messageError?.message || "Gagal memuat chat.",
      );
      setLoading(false);
      return;
    }

    const latest: Record<string, ChatMessage> = {};
    (messageData || []).forEach((item: any) => {
      if (!latest[item.user_id]) latest[item.user_id] = item as ChatMessage;
    });

    setProfiles((profileData || []) as UserProfile[]);
    setLatestMessages(latest);
    setLoading(false);
  };

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      Alert.alert("Chat Error", error.message);
      return;
    }

    setMessages((data || []) as ChatMessage[]);
  };

  const sendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed || !selectedUser || sending) return;

    setSending(true);
    setMessageText("");

    const { error } = await supabase.from("chat_messages").insert({
      user_id: selectedUser.id,
      sender_role: "admin",
      message: trimmed,
    });

    if (error) {
      setMessageText(trimmed);
      Alert.alert("Gagal Kirim", error.message);
    }

    setSending(false);
  };

  const displayName = (user: UserProfile) =>
    user.full_name || user.username || user.email || "User";

  const renderConversation = ({ item }: { item: Conversation }) => {
    const active = selectedUser?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, active && styles.conversationActive]}
        onPress={() => setSelectedUser(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName(item)[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.conversationName}>{displayName(item)}</Text>
          <Text style={styles.conversationMeta} numberOfLines={1}>
            {item.lastMessage?.message || item.email || "Belum ada pesan"}
          </Text>
        </View>
        {item.lastMessage ? (
          <Text style={styles.conversationTime}>
            {new Date(item.lastMessage.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.sender_role === "admin";

    return (
      <View style={[styles.messageRow, mine && styles.messageRowMine]}>
        <View
          style={[styles.bubble, mine ? styles.adminBubble : styles.userBubble]}
        >
          <Text style={[styles.bubbleText, mine && styles.adminBubbleText]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, mine && styles.adminTimeText]}>
            {new Date(item.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <AdminHeader title="Chat" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.listPanel}>
            <Text style={styles.sectionTitle}>Percakapan User</Text>
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversation}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Belum ada user terdaftar.</Text>
              }
            />
          </View>

          <View style={styles.chatPanel}>
            {selectedUser ? (
              <>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatTitle}>
                    {displayName(selectedUser)}
                  </Text>
                  <Text style={styles.chatSub}>
                    {selectedUser.email || selectedUser.username || "Pelanggan"}
                  </Text>
                </View>
                <FlatList
                  ref={listRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMessage}
                  contentContainerStyle={styles.messageList}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>Mulai balas user ini.</Text>
                  }
                />
                <View style={styles.inputBar}>
                  <TextInput
                    style={styles.input}
                    placeholder="Balas pesan..."
                    placeholderTextColor={colors.textPlaceholder}
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      !messageText.trim() && styles.sendBtnDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!messageText.trim() || sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.sendText}>Kirim</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.pickUserBox}>
                <Text style={styles.pickUserTitle}>Pilih user</Text>
                <Text style={styles.pickUserText}>
                  Pilih percakapan di atas untuk membaca dan membalas chat.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="/admin/support"
      />
    </KeyboardAvoidingView>
  );
}

const createSupportStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: 14, gap: 12 },
    listPanel: {
      maxHeight: 230,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 10,
    },
    conversationCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    conversationActive: {
      backgroundColor: colors.accentSoft,
      borderRadius: 10,
      paddingHorizontal: 8,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    conversationName: { fontSize: 14, fontWeight: "700", color: colors.text },
    conversationMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    conversationTime: {
      fontSize: 10,
      color: colors.textMuted,
      alignSelf: "flex-start",
    },
    chatPanel: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    chatHeader: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    chatTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
    chatSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    messageList: { padding: 14, flexGrow: 1 },
    messageRow: { flexDirection: "row", marginBottom: 10 },
    messageRowMine: { justifyContent: "flex-end" },
    bubble: {
      maxWidth: "80%",
      borderRadius: 15,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderWidth: 1,
    },
    userBubble: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.border,
    },
    adminBubble: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    bubbleText: { color: colors.text, fontSize: 14, lineHeight: 20 },
    adminBubbleText: { color: "#fff" },
    timeText: {
      fontSize: 10,
      color: colors.textMuted,
      alignSelf: "flex-end",
      marginTop: 5,
    },
    adminTimeText: { color: "#D8F3DC" },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 100,
      backgroundColor: colors.input,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendBtn: {
      height: 42,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { backgroundColor: colors.textMuted },
    sendText: { color: "#fff", fontSize: 13, fontWeight: "800" },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 20,
    },
    pickUserBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 28,
    },
    pickUserTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    pickUserText: {
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
  });
