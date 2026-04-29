import React, { useEffect, useState } from "react";
import { useKeepAwake } from "expo-keep-awake";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { getQueue, removeSong, endRide } from "../api/rides";
import { getDriverId } from "../lib/auth";
import { connectSocket, subscribe, onReconnect, disconnectSocket } from "../lib/socket";
import { colors, glow } from "../theme";

export default function Driver() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { rideId } = route.params;

  useKeepAwake();

  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    getDriverId().then(setDriverId);
    loadQueue();
    connectSocket(rideId);

    const unsubscribe = subscribe((data) => {
      if (data.songs) {
        setSongs(data.songs);
        setLoading(false);
      }
    });

    const unsubscribeReconnect = onReconnect(() => {
      loadQueue();
    });

    return () => {
      unsubscribe();
      unsubscribeReconnect();
    };
  }, [rideId]);

  const loadQueue = async () => {
    try {
      const data = await getQueue(rideId);
      setSongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRideId = async () => {
    await Clipboard.setStringAsync(rideId);
    Alert.alert("Copied!", "Ride code copied to clipboard");
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSong(songId);
    } catch (err) {
      console.error(err);
    }
  };

  const doEndRide = async () => {
    try {
      await endRide(rideId);
      disconnectSocket();
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err) {
      console.error("endRide failed:", err);
      Alert.alert("Error", "Failed to end ride. Please try again.");
    }
  };

  const handleEndRide = () => {
    if (Platform.OS === "web") {
      doEndRide();
    } else {
      Alert.alert("End Ride", "Are you sure you want to end this ride?", [
        { text: "Cancel", style: "cancel" },
        { text: "End Ride", style: "destructive", onPress: doEndRide },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <Text style={styles.brandLogo}>RiderDJ</Text>
        <Text style={styles.brandTagline}>YOUR RIDE. YOUR MUSIC.</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Driver Dashboard</Text>
          <Text style={styles.subtitle}>Your ride is live</Text>
        </View>
        <TouchableOpacity style={styles.endButton} onPress={handleEndRide}>
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* QR code */}
      <View style={styles.qrBox}>
        <Text style={styles.qrLabel}>SCAN TO JOIN</Text>
        <Image
          style={styles.qrImage}
          source={{ uri: driverId ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://riderdj-production.up.railway.app/join/driver/${driverId}`)}&color=a855f7&bgcolor=110d24&margin=2` : undefined }}
        />
      </View>

      {/* Ride code */}
      <TouchableOpacity style={styles.rideCodeBox} onPress={handleCopyRideId} activeOpacity={0.7}>
        <Text style={styles.rideCodeLabel}>RIDE CODE — TAP TO COPY</Text>
        <Text style={styles.rideCode}>{rideId}</Text>
      </TouchableOpacity>

      {/* Queue */}
      <Text style={styles.sectionLabel}>QUEUE</Text>

      {loading ? (
        <ActivityIndicator color={colors.purple} style={{ marginTop: 20 }} />
      ) : songs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No songs yet</Text>
          <Text style={styles.emptyHint}>Passengers can add songs using the ride code</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item, index }) => (
            <View style={[styles.songCard, index === 0 && styles.songCardActive]}>
              <View style={styles.songIndex}>
                <Text style={[styles.songIndexText, index === 0 && styles.songIndexActive]}>
                  {index === 0 ? "▶" : index + 1}
                </Text>
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveSong(item.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  brand: {
    marginBottom: 4,
  },

  brandLogo: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 2,
  },

  brandTagline: {
    fontSize: 10,
    letterSpacing: 4,
    color: colors.cyan,
    fontWeight: "600",
    marginTop: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  endButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  endButtonText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 13,
  },

  qrBox: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  qrLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: "600",
  },

  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purple,
    ...glow.purple,
  },

  rideCodeBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cyan,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
    ...glow.cyan,
  },

  rideCodeLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },

  rideCode: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.cyan,
    letterSpacing: 8,
  },

  sectionLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 12,
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 40,
    gap: 6,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },

  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },

  songCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },

  songCardActive: {
    borderColor: colors.purpleLight,
    ...glow.purple,
  },

  songIndex: {
    width: 28,
    alignItems: "center",
  },

  songIndexText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  songIndexActive: {
    color: colors.purpleLight,
    fontSize: 16,
  },

  songInfo: {
    flex: 1,
  },

  songTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  songArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  removeButton: {
    padding: 6,
  },

  removeButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
