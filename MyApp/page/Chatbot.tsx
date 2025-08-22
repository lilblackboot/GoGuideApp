import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { generateResponse } from "../gemini";
import timetableData from "../timetable.json";

type Message = {
  role: "user" | "bot";
  text: string;
  id: string;
  timestamp: Date;
};

const { width } = Dimensions.get("window");

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);
  const inputContainerAnimation = useRef(new Animated.Value(0)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const shouldAutoScroll = useRef(true);
  const isNearBottom = useRef(true);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.spring(inputContainerAnimation, {
          toValue: -e.endCoordinates.height + (Platform.OS === 'ios' ? 34 : 0),
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.spring(inputContainerAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Scroll to bottom helper function
  const scrollToBottom = useCallback((animated: boolean = true) => {
    if (flatListRef.current && shouldAutoScroll.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, animated ? 100 : 0);
    }
  }, []);

  // Check if user is near bottom of chat
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    isNearBottom.current = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    shouldAutoScroll.current = isNearBottom.current;
  }, []);
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: "user", 
      text: input.trim(),
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Force scroll to bottom for user message
    shouldAutoScroll.current = true;
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
          text: "⚠️ Sorry, I'm having trouble connecting right now. Please try again.",
          id: (Date.now() + 1).toString(),
          timestamp: new Date()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to bottom when new message comes
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure message is rendered
      setTimeout(() => {
        scrollToBottom();
      }, 150);
    }
  }, [messages, scrollToBottom]);

  const MessageBubble = memo(({ item }: { item: Message }) => {
    const slideAnimation = useRef(new Animated.Value(0)).current;
    const opacityAnimation = useRef(new Animated.Value(1)).current;
    const hasAnimated = useRef(false);

    useEffect(() => {
      if (!hasAnimated.current) {
        slideAnimation.setValue(50);
        opacityAnimation.setValue(0);
        
        Animated.parallel([
          Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 300,
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
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </Animated.View>
    );
  });

  const TypingIndicator = () => (
    <Animated.View
      style={[
        styles.messageBubble,
        styles.botBubble,
        styles.typingIndicator,
        {
          opacity: typingAnimation,
        },
      ]}
    >
      <View style={styles.typingDots}>
        <Animated.View 
          style={[
            styles.typingDot,
            {
              transform: [{
                scale: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.typingDot,
            {
              transform: [{
                scale: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.typingDot,
            {
              transform: [{
                scale: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                })
              }]
            }
          ]} 
        />
      </View>
      <Text style={styles.typingText}>AI is typing...</Text>
    </Animated.View>
  );

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble item={item} />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.headerTitle}>Smart Assistant</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.chatList}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
        onContentSizeChange={() => {
          // Auto scroll when content size changes (new messages)
          if (shouldAutoScroll.current) {
            scrollToBottom(false);
          }
        }}
        onLayout={() => {
          // Auto scroll when layout changes (keyboard)
          if (messages.length > 0) {
            scrollToBottom(false);
          }
        }}
      />

      <Animated.View 
        style={[
          styles.inputContainer,
          {
            transform: [{ translateY: inputContainerAnimation }],
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={500}
            textAlignVertical="center"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              loading && styles.sendButtonDisabled,
              input.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSend}
            disabled={loading || !input.trim()}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Animated.Text 
                style={[
                  styles.sendText,
                  {
                    transform: [{
                      scale: input.trim() ? 1 : 0.8
                    }]
                  }
                ]}
              >
                ➤
              </Animated.Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    backgroundColor: "#1e293b",
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "500",
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
    marginBottom: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  chatList: {
    flex: 1,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginVertical: 4,
    maxWidth: width * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 8,
    marginLeft: width * 0.2,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    borderBottomLeftRadius: 8,
    marginRight: width * 0.2,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
  timestamp: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
    fontWeight: "300",
  },
  typingIndicator: {
    alignItems: "center",
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#94a3b8",
    marginHorizontal: 2,
  },
  typingText: {
    color: "#94a3b8",
    fontSize: 12,
    fontStyle: "italic",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e293b",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#334155",
    marginRight: 12,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#475569",
    textAlignVertical: "center",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: "#3b82f6",
    transform: [{ scale: 1 }],
  },
  sendButtonInactive: {
    backgroundColor: "#64748b",
    transform: [{ scale: 0.9 }],
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});