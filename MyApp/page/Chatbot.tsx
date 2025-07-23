import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  animatedValue: Animated.Value;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      animatedValue: new Animated.Value(0),
    };

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: `You said: ${input}`,
      sender: 'bot',
      animatedValue: new Animated.Value(0),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    animateMessage(userMsg);

    setTimeout(() => {
      setMessages(prev => [...prev, botMsg]);
      animateMessage(botMsg);
    }, 600);
  };

  const animateMessage = (msg: Message) => {
    Animated.timing(msg.animatedValue, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }: { item: Message }) => (
    <Animated.View
      style={{
        opacity: item.animatedValue,
        transform: [{ scale: item.animatedValue }],
        alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: item.sender === 'user' ? '#ff5678' : '#333',
        marginVertical: 5,
        padding: 12,
        borderRadius: 16,
        maxWidth: '80%',
      }}
    >
      <Text style={{ color: 'white', fontSize: 16 }}>{item.text}</Text>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#18181b' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.container}>
          {/* Top right arrow icon */}
          <TouchableOpacity
            style={styles.backArrow}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 28, color: '#fff' }}>➔</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Assitant</Text>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#fff"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <LinearGradient
                colors={['#ec4899', '#f97316']}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.gradient}
              >
                <Text style={styles.sendText}>Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: '#fb923c',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 0,
    borderColor: 'transparent',
    borderRadius: 24,
    margin: 16,
    shadowColor: '#ec4899',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 10,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  sendButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginLeft: 4,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#fb923c',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1,
  },
  backArrow: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
});
