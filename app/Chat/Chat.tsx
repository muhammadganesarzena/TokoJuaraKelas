import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import { supabase } from "../../lib/supabase";
import UserBottomNav from "../components/UserBottomNav";
import { useTheme } from "../context/ThemeContext";

type ChatMessage = {
  id: string;
  user_id: string;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
};

export default function Chat() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchMessages(userId);

    const channelName = `chat-user-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const nextMessage = payload.new as ChatMessage;
          setMessages((current) =>
            current.some((item) => item.id === nextMessage.id)
              ? current
              : [...current, nextMessage],
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const loadSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      Alert.alert("Login dibutuhkan", "Silakan login untuk membuka chat.");
      router.replace("/LoginScreen/LoginScreen");
      return;
    }

    setUserId(session.user.id);
  };

  const fetchMessages = async (currentUserId: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: true });

    if (error) {
      Alert.alert("Chat Error", error.message);
    } else {
      setMessages((data || []) as ChatMessage[]);
    }

    setLoading(false);
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !userId || sending) return;

    setSending(true);
    setText("");

    const { error } = await supabase.from("chat_messages").insert({
      user_id: userId,
      sender_role: "user",
      message: trimmed,
    });

    if (error) {
      setText(trimmed);
      Alert.alert("Gagal Kirim", error.message);
    }

    setSending(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.sender_role === "user";

    return (
      <View style={[styles.messageRow, mine && styles.messageRowMine]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: mine ? colors.accent : colors.card,
              borderColor: mine ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[styles.bubbleText, { color: mine ? "#fff" : colors.text }]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timeText,
              { color: mine ? "#D8F3DC" : colors.textMuted },
            ]}
          >
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Chat Admin</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Bantuan toko secara realtime
          </Text>
        </View>
        <Ionicons name="headset-outline" size={24} color={colors.accent} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Belum ada pesan
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Tulis pertanyaan kamu, admin akan membalas di sini.
              </Text>
            </View>
          }
        />
      )}

      <View
        style={[
          styles.inputBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Tulis pesan..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: text.trim() ? colors.accent : colors.border },
          ]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <UserBottomNav active="chat" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  messageList: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  messageRow: { flexDirection: "row", marginBottom: 10 },
  messageRowMine: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "78%",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 10, alignSelf: "flex-end", marginTop: 5 },
  emptyWrap: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 12 },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 18,
    marginBottom: 98,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
