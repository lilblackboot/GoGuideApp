import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const emojiOptions = [
  '🍔', // Burger
  '🍕', // Pizza
  '🥪', // Sandwich (in place of dosa)
  '🍜', // Ramen (in place of taco)
  '🥗', // Salad
  '🍦', // Ice Cream
  '🍗', // Chicken leg
  '🧋', // Bubble Tea
  '🍉', // Watermelon
];

export default function CompleteProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(emojiOptions[0]);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  const handleSaveProfile = async () => {
    if (!displayName || !selectedEmoji) {
      alert('Please enter a display name and choose a profile emoji');
      return;
    }

    setUploading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      // Save emoji as displayName or photoURL (as emoji string)
      await updateProfile(user!, {
        displayName,
        photoURL: selectedEmoji,
      });

      navigation.navigate('Home' as never);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#fb923c', '#ef4444', '#ec4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Top right arrow icon */}
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.navigate('Home' as never)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 28, color: '#fff' }}>➔</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>Pick a fun emoji for your profile picture!</Text>
        <View style={styles.emojiRow}>
          {emojiOptions.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiOption,
                selectedEmoji === emoji && styles.emojiSelected,
              ]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          placeholder="Enter display name"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          placeholderTextColor="#fff"
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
          disabled={uploading}
        >
          <Text style={styles.saveBtnText}>
            {uploading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    opacity: 0.85,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  emojiOption: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 32,
    padding: 12,
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  emojiSelected: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emojiText: {
    fontSize: 20,
  },
  input: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  saveBtn: {
    backgroundColor: '#fb923c',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backArrow: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
});
