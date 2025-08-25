import React, { useRef, useEffect } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";

export interface NotificationProps {
  visible: boolean;
  title: string;
  message: string;
  type: "like" | "comment" | "success" | "error";
  onHide: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  visible,
  title,
  message,
  type,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onHide();
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor =
    type === "success"
      ? "#4caf50"
      : type === "error"
      ? "#f44336"
      : type === "like"
      ? "#2196f3"
      : "#ff9800";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    width: "90%",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  message: {
    color: "white",
    fontSize: 14,
    marginTop: 2,
  },
});

export default Notification;
