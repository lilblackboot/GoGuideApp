import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Easing,
} from "react-native";
import { generateResponse } from "../gemini";
import timetableData from "../timetable.json";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type Message = {
  role: "user" | "bot";
  text: string;
  id: string;
  timestamp: Date;
};

const MessageBubble = memo(({ item }: { item: Message }) => {
  const slideAnimation = useRef(new Animated.Value(50)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      
      hasAnimated.current = true;
    }
  }, []);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: slideAnimation }],
          opacity: opacityAnimation,
        },
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
});

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const userMessage: Message = {
      role: "user",
      text: input.trim(),
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const reply = await generateResponse(input, timetableData);
      const botMessage: Message = {
        role: "bot",
        text: reply,
        id: (Date.now() + 1).toString(),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
          id: (Date.now() + 1).toString(),
          timestamp: new Date()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading, scrollToBottom]);

  const TypingIndicator = memo(() => (
    <Animated.View
      style={[
        styles.messageBubble,
        styles.botBubble,
        styles.typingBubble,
        {
          opacity: typingAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          }),
        },
      ]}
    >
      <View style={styles.typingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                transform: [{
                  scale: typingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                }],
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.typingText}>Assistant is typing...</Text>
    </Animated.View>
  ));

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble item={item} />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistant</Text>
        <View style={styles.onlineIndicator} />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                input.length > 0 && styles.inputFocused
              ]}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#8E8E93"
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={(e) => {
                e.preventDefault();
                handleSend();
              }}
              editable={!loading}
            />
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!input.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim() || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#262626",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "300",
  },
  onlineIndicator: {
    position: "absolute",
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759",
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#E9344C",
    borderRadius: 20,
    borderBottomRightRadius: 6,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#262626",
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  typingBubble: {
    paddingVertical: 16,
    alignItems: "center",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  timestamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  typingDots: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 2,
  },
  typingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontStyle: "italic",
  },
  inputArea: {
    backgroundColor: "#000000",
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#262626",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#262626",
    color: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
    letterSpacing: 0.2,
  },
  inputFocused: {
    borderColor: "#E9344C",
  },
  sendButton: {
    backgroundColor: "#E9344C",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E9344C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#4A4A4A",
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});