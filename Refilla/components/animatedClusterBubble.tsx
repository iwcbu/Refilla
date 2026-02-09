import { Animated, StyleSheet } from "react-native";
import { Text } from "react-native";
import { useEffect, useRef } from "react";

export default function AnimatedClusterBubble({ count }: { count: number }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [a]);

  return (
    <Animated.View
      style={[
        styles.cluster,
        {
          opacity: a,
          transform: [{ scale: a }],
        },
      ]}
    >
      <Text style={styles.clusterText}>{count}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "#2595eb",
  },
  clusterText: {
    color: "white",
    fontWeight: "800",
  },
})

