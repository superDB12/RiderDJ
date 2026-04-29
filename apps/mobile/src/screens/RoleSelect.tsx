import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, glow } from "../theme";
import { getToken } from "../lib/auth";

export default function RoleSelect({ navigation }: any) {
  const handleDriverPress = async () => {
    const token = await getToken();
    navigation.navigate(token ? "Home" : "DriverAuth");
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>RiderDJ</Text>
        <Text style={styles.tagline}>YOUR RIDE. YOUR MUSIC.</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPurple]}
          onPress={handleDriverPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🚗</Text>
          <View>
            <Text style={styles.buttonTitle}>I'm Driving</Text>
            <Text style={styles.buttonSub}>Host a ride & connect Spotify</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPink]}
          onPress={() => navigation.navigate("JoinRide")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🎵</Text>
          <View>
            <Text style={styles.buttonTitle}>I'm Riding</Text>
            <Text style={styles.buttonSub}>Join a ride & add songs</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  hero: {
    alignItems: "center",
    marginBottom: 56,
  },

  logo: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 2,
  },

  tagline: {
    fontSize: 12,
    letterSpacing: 4,
    color: colors.cyan,
    marginTop: 6,
    fontWeight: "600",
  },

  buttons: {
    gap: 16,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },

  buttonPurple: {
    backgroundColor: colors.surface,
    borderColor: colors.purple,
    ...glow.purple,
  },

  buttonPink: {
    backgroundColor: colors.surface,
    borderColor: colors.pink,
    ...glow.pink,
  },

  buttonIcon: {
    fontSize: 28,
  },

  buttonTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },

  buttonSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
