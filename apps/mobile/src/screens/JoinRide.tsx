import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { joinRide } from "../api/rides";
import { colors, glow } from "../theme";

export default function JoinRideScreen({ route, navigation }: any) {
  const [rideCode, setRideCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const rideIdFromLink = route.params?.rideId;

  useEffect(() => {
    if (rideIdFromLink) {
      joinRideWithCode(rideIdFromLink);
    }
  }, [rideIdFromLink]);

  const joinRideWithCode = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await joinRide(code);
      navigation.navigate("Queue", { rideId: data.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join ride");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRide = async () => {
    if (!rideCode.trim()) {
      setError("Please enter a ride code");
      return;
    }
    await joinRideWithCode(rideCode.trim().toUpperCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join a Ride</Text>
        <Text style={styles.subtitle}>Enter the code your driver shared with you</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="RIDE CODE"
        placeholderTextColor={colors.textMuted}
        value={rideCode}
        onChangeText={setRideCode}
        autoCapitalize="characters"
        maxLength={6}
        onSubmitEditing={handleJoinRide}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoinRide}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{loading ? "Joining..." : "Join Ride"}</Text>
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
    gap: 20,
  },

  header: {
    gap: 6,
    marginBottom: 8,
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

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: 14,
    padding: 18,
    fontSize: 24,
    fontWeight: "800",
    color: colors.cyanLight,
    letterSpacing: 8,
    textAlign: "center",
    ...glow.purple,
  },

  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },

  button: {
    backgroundColor: colors.purple,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    ...glow.purple,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
