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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { getQueue, removeSong, endRide } from "../api/rides";
import { connectSocket, subscribe, onReconnect, disconnectSocket } from "../lib/socket";
import { colors, glow } from "../theme";

export default function Driver() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { rideId } = route.params;

  useKeepAwake();

  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    await endRide(rideId);
    disconnectSocket();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 20,
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
