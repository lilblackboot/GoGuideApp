import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { generateResponse } from "../gemini"; // your gemini.js
import timetableData from "../timetable.json"; // your JSON timetable

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await generateResponse(input, timetableData);
      const botMessage: Message = { role: "bot", text: reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error: Could not get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={20} // keeps input just above keyboard
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        style={styles.chatList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18181b",
  },
  chatList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#4b5563",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#27272a",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#fff",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#1f2937",
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
