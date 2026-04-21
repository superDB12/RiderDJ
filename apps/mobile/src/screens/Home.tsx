import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Linking from "expo-linking";
import { createRide } from "../api/rides";
import { colors, glow } from "../theme";

const BASE_URL = "https://riderdj-production.up.railway.app";

export default function Home({ navigation }: any) {
  const [rideId] = useState(() =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
  const [loading, setLoading] = useState(false);

  const handleConnectSpotify = async () => {
    setLoading(true);
    try {
      await createRide(rideId);
    } catch {
      Alert.alert("Error", "Could not create ride. Is the backend running?");
      setLoading(false);
      return;
    }

    const redirectTo = Linking.createURL(`driver/${rideId}`);
    const url =
      `${BASE_URL}/spotify/login` +
      `?rideId=${encodeURIComponent(rideId)}` +
      `&redirectTo=${encodeURIComponent(redirectTo)}`;

    Linking.openURL(url);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start a Ride</Text>
        <Text style={styles.subtitle}>Connect Spotify to get the music going</Text>
      </View>

      <View style={styles.rideCodeBox}>
        <Text style={styles.rideCodeLabel}>YOUR RIDE CODE</Text>
        <Text style={styles.rideCode}>{rideId}</Text>
        <Text style={styles.rideCodeHint}>Share this with your passengers after connecting</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleConnectSpotify}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? "Connecting..." : "🎧  Connect Spotify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    justifyContent: "center",
    gap: 28,
  },

  header: {
    gap: 6,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  rideCodeBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },

  rideCodeLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: "600",
  },

  rideCode: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.cyan,
    letterSpacing: 8,
    ...glow.cyan,
  },

  rideCodeHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },

  button: {
    backgroundColor: colors.green,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
