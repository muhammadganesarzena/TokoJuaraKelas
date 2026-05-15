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
  const selectedUserId = selectedUser?.id;

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
    const channel = supabase
      .channel("admin-chat-conversations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setLatestMessages((current) => ({
            ...current,
            [incoming.user_id]: incoming,
          }));
          setMessages((current) =>
            selectedUserId === incoming.user_id &&
            !current.some((item) => item.id === incoming.id)
              ? [...current, incoming]
              : current,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId) fetchMessages(selectedUserId);
  }, [selectedUserId]);

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
        "Chat Error",
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AdminHeader title="Chat" onMenuPress={() => setSidebarOpen(true)} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
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
                    {selectedUser.email || selectedUser.username || "Customer"}
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
                    placeholderTextColor="#999"
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
        activeRoute="/admin/chat"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { flex: 1, padding: 14, gap: 12 },
  listPanel: {
    maxHeight: 230,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 10,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  conversationActive: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1B4332",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  conversationName: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  conversationMeta: { fontSize: 12, color: "#777", marginTop: 2 },
  conversationTime: { fontSize: 10, color: "#999", alignSelf: "flex-start" },
  chatPanel: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  chatHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#FAFAFA",
  },
  chatTitle: { fontSize: 16, fontWeight: "800", color: "#1a1a2e" },
  chatSub: { fontSize: 12, color: "#777", marginTop: 2 },
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
  userBubble: { backgroundColor: "#f7f7f7", borderColor: "#e5e5e5" },
  adminBubble: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" },
  bubbleText: { color: "#1a1a2e", fontSize: 14, lineHeight: 20 },
  adminBubbleText: { color: "#fff" },
  timeText: {
    fontSize: 10,
    color: "#888",
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
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1a1a2e",
    fontSize: 14,
  },
  sendBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#2D6A4F",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#bdbdbd" },
  sendText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
  pickUserBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  pickUserTitle: { fontSize: 18, fontWeight: "800", color: "#1a1a2e" },
  pickUserText: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
