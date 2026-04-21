import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, FlatList, ActivityIndicator,
} from "react-native";
import * as Linking from "expo-linking";
import { useFocusEffect } from "@react-navigation/native";
import { createRide, getActiveRides } from "../api/rides";
import { colors, glow } from "../theme";

const BASE_URL = "https://riderdj-production.up.railway.app";

export default function Home({ navigation }: any) {
  const [rideId] = useState(() =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
  const [loading, setLoading] = useState(false);
  const [activeRides, setActiveRides] = useState<{ id: string; createdAt: string }[]>([]);
  const [ridesLoading, setRidesLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadActiveRides();
    }, [])
  );

  const loadActiveRides = async () => {
    try {
      setRidesLoading(true);
      const rides = await getActiveRides();
      setActiveRides(rides);
    } catch {
      // silently fail — not critical
    } finally {
      setRidesLoading(false);
    }
  };

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

  const handleResumeRide = (existingRideId: string) => {
    navigation.navigate("Driver", { rideId: existingRideId });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      "  ·  " + d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start a Ride</Text>
        <Text style={styles.subtitle}>Connect Spotify to get the music going</Text>
      </View>

      <View style={styles.rideCodeBox}>
        <Text style={styles.rideCodeLabel}>NEW RIDE CODE</Text>
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

      {/* Active rides */}
      <View style={styles.activeRidesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>ACTIVE RIDES</Text>
          <TouchableOpacity onPress={loadActiveRides}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {ridesLoading ? (
          <ActivityIndicator color={colors.purple} style={{ marginTop: 12 }} />
        ) : activeRides.length === 0 ? (
          <Text style={styles.emptyText}>No active rides</Text>
        ) : (
          <FlatList
            data={activeRides}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.rideCard}
                onPress={() => handleResumeRide(item.id)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.rideCardCode}>{item.id}</Text>
                  <Text style={styles.rideCardDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.rideCardArrow}>→</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    paddingTop: 20,
    gap: 24,
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

  activeRidesSection: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: "600",
  },

  refreshText: {
    fontSize: 13,
    color: colors.purple,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },

  rideCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  rideCardCode: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: 3,
  },

  rideCardDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },

  rideCardArrow: {
    fontSize: 18,
    color: colors.purple,
  },
});
