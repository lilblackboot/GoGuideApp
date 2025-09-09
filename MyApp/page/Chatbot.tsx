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
  StatusBar,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { generateResponse } from "../gemini";
import timetableData from "../timetable.json";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

type Message = {
  role: "user" | "bot";
  text: string;
  id: string;
  timestamp: Date;
};

// Floating background elements
const FloatingElements = memo(() => {
  const elements = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height)).current,
      rotation: useRef(new Animated.Value(0)).current,
      scale: useRef(new Animated.Value(0.3 + Math.random() * 0.4)).current,
    }))
  ).current;

  useEffect(() => {
    elements.forEach((element, index) => {
      const duration = 20000 + Math.random() * 15000;
      
      // Position animation
      Animated.loop(
        Animated.timing(element.x, {
          toValue: Math.random() * width,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(element.y, {
          toValue: Math.random() * height,
          duration: duration * 1.2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(element.rotation, {
          toValue: 360,
          duration: 30000 + index * 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {elements.map((element) => (
        <Animated.View
          key={element.id}
          style={[
            styles.floatingElement,
            {
              transform: [
                { translateX: element.x },
                { translateY: element.y },
                { scale: element.scale },
                { 
                  rotate: element.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
});

const MessageBubble = memo(({ item, index }: { item: Message; index: number }) => {
  const slideAnimation = useRef(new Animated.Value(30)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(slideAnimation, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnimation, {
            toValue: 1,
            tension: 120,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 50);
      
      hasAnimated.current = true;
    }
  }, []);

  const isUser = item.role === "user";

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser && styles.userMessageContainer,
        {
          transform: [
            { translateY: slideAnimation },
            { scale: scaleAnimation }
          ],
          opacity: opacityAnimation,
        },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
});

const TypingIndicator = memo(() => {
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const containerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Container entrance animation
    Animated.spring(containerAnimation, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Dot animations
    const animateDots = () => {
      const animations = dotAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.timing(anim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );

      Animated.parallel(animations).start();
    };

    animateDots();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          opacity: containerAnimation,
          transform: [{ scale: containerAnimation }],
        },
      ]}
    >
      <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.typingContent}>
          <View style={styles.typingDots}>
            {dotAnimations.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    transform: [{
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1.2],
                      }),
                    }],
                    opacity: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.typingText}>Assistant is typing</Text>
        </View>
      </View>
    </Animated.View>
  );
});

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance animation
    Animated.spring(headerAnimation, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Button animation
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        tension: 200,
        friction: 6,
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
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
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

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => (
    <MessageBubble item={item} index={index} />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Background */}
      <LinearGradient
        colors={['#FAFAFA', '#F5F5F7', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <FloatingElements />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnimation,
              transform: [{
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonText}>←</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Assistant</Text>
            <Text style={styles.headerSubtitle}>Always ready to help</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={styles.onlineIndicator} />
          </View>
        </Animated.View>

        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
          />

          {/* Input Area */}
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type a message"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  editable={!loading}
                />
                <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={!input.trim() || loading}
                    activeOpacity={0.8}
                    style={[
                      styles.sendButton,
                      (!input.trim() || loading) && styles.sendButtonDisabled,
                    ]}
                  >
                    <Text style={[
                      styles.sendButtonText,
                      (!input.trim() || loading) && styles.sendButtonTextDisabled,
                    ]}>
                      Send
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  floatingElement: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.02,
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 1,
    fontWeight: '400',
  },
  statusContainer: {
    marginLeft: 16,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '400',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
    fontWeight: '400',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  typingBubble: {
    paddingVertical: 12,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginHorizontal: 1.5,
  },
  typingText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  inputArea: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backdropFilter: 'blur(10px)',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backdropFilter: 'blur(10px)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#1F2937',
    paddingVertical: 8,
    paddingRight: 12,
    maxHeight: 100,
    fontWeight: '400',
  },
  sendButton: {
    backgroundColor: '#6366F1',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.02,
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
});