import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import * as Clipboard from "expo-clipboard";
import { getQueue, removeSong, endRide } from "../api/rides";
import { connectSocket, subscribe, onReconnect } from "../lib/socket";


export default function Driver() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { rideId } = route.params;

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
      console.log("🔄 Reconnected — re-syncing queue");
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
      // WebSocket will auto-update UI
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndRide = async () => {
    Alert.alert("End Ride", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          await endRide(rideId);
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 Driver Dashboard</Text>

      {/* RIDE CONTROL */}
      <View style={styles.rideBox}>
        <Text style={styles.subtitle}>Ride Code</Text>
        <Text style={styles.rideId}>{rideId}</Text>

        <TouchableOpacity style={styles.copyButton} onPress={handleCopyRideId}>
          <Text style={styles.buttonText}>Copy Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={handleEndRide}>
          <Text style={styles.buttonText}>End Ride</Text>
        </TouchableOpacity>
      </View>

      {/* QUEUE */}
      <Text style={styles.subtitle}>Queue</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : songs.length === 0 ? (
        <Text style={styles.empty}>No songs yet</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.song,
                index === 0 && styles.nowPlaying, // highlight first song
              ]}
            >
              <View>
                <Text style={styles.songText}>
                  {index + 1}. {item.title}
                </Text>
                <Text style={styles.artist}>{item.artist}</Text>
                <Text style={styles.votes}>👍 {item.votes}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveSong(item.id)}
              >
                <Text style={{ color: "white" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: { fontSize: 26, marginBottom: 20 },

  subtitle: { fontSize: 18, marginVertical: 10 },

  rideBox: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },

  rideId: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },

  copyButton: {
    backgroundColor: "black",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },

  endButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },

  buttonText: { color: "white" },

  empty: { textAlign: "center", marginTop: 20 },

  song: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
  },

  nowPlaying: {
    backgroundColor: "#d4f8d4",
  },

  songText: { fontSize: 16 },

  artist: { color: "gray" },

  votes: { fontSize: 12 },

  removeButton: {
    backgroundColor: "red",
    padding: 6,
    borderRadius: 6,
    justifyContent: "center",
  },
});