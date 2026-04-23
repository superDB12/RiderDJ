import React, { useEffect, useState } from "react";
import { useKeepAwake } from "expo-keep-awake";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Keyboard, Image,
} from "react-native";
import { getQueue } from "../api/rides";
import { addSong } from "../api/songs";
import { searchSpotify } from "../api/spotify";
import { Song } from "@riderdj/types";
import { connectSocket, subscribe, onReconnect } from "../lib/socket";
import { colors, glow } from "../theme";

export default function Queue({ route }: any) {
  const { rideId } = route.params;
  useKeepAwake();

  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [alreadyIds, setAlreadyIds] = useState<Set<string>>(new Set());
  const addedTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    loadQueue();
    connectSocket(rideId);

    const unsubscribe = subscribe((data) => {
      if (data.songs) setSongs(data.songs);
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
      setQueueLoading(true);
      const data = await getQueue(rideId);
      const songsArray = Array.isArray(data) ? data : data.songs || [];
      setSongs(songsArray);
    } catch (err: any) {
      console.error(err);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!query.trim()) return;
    try {
      setError("");
      setSearchLoading(true);
      const data = await searchSpotify(rideId, query);
      setResults(data.tracks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddSong = async (trackId: string) => {
    try {
      setError("");
      await addSong(rideId, trackId);
      setAddedIds((prev) => new Set(prev).add(trackId));
      clearTimeout(addedTimers.current[trackId]);
      addedTimers.current[trackId] = setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
      }, 2000);
    } catch (err: any) {
      if (err.message === "Song already in queue") {
        setAlreadyIds((prev) => new Set(prev).add(trackId));
        clearTimeout(addedTimers.current[trackId]);
        addedTimers.current[trackId] = setTimeout(() => {
          setAlreadyIds((prev) => {
            const next = new Set(prev);
            next.delete(trackId);
            return next;
          });
        }, 2000);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Queue */}
      <View style={styles.queueSection}>
        <Text style={styles.sectionLabel}>Queue</Text>
        {queueLoading ? (
          <ActivityIndicator color={colors.purple} />
        ) : songs.length === 0 ? (
          <Text style={styles.emptyText}>No songs yet — be the first to add one!</Text>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item, index) => `${item.trackId}-${index}`}
            contentContainerStyle={{ gap: 6 }}
            style={{ maxHeight: 280 }}
            renderItem={({ item, index }) => (
              <View style={[styles.songCard, index === 0 && styles.songCardActive]}>
                <Text style={[styles.songIndex, index === 0 && styles.songIndexActive]}>
                  {index === 0 ? "▶" : index + 1}
                </Text>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionLabel}>SEARCH SPOTIFY</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search for a song by title or artist..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchButton, searchLoading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={searchLoading}
            activeOpacity={0.8}
          >
            {searchLoading
              ? <ActivityIndicator color="#000" size="small" />
              : <Text style={styles.searchButtonText}>Go</Text>
            }
          </TouchableOpacity>
        </View>

        {results.length === 0 && (
          <View style={styles.qrBox}>
            <Text style={styles.qrLabel}>SCAN TO JOIN THIS RIDE</Text>
            <Image
              style={styles.qrImage}
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://riderdj-production.up.railway.app/ride/${rideId}`)}&color=a855f7&bgcolor=110d24&margin=2` }}
            />
            <Text style={styles.qrSub}>{rideId}</Text>
          </View>
        )}

        {results.length > 0 && (
          <FlatList
            style={styles.resultsList}
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 6, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <TouchableOpacity onPress={() => { setResults([]); setQuery(""); }} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕  Clear results</Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => {
              const added = addedIds.has(item.id);
              const already = alreadyIds.has(item.id);
              const busy = added || already;
              return (
                <TouchableOpacity
                  style={styles.resultCard}
                  onPress={() => !busy && handleAddSong(item.id)}
                  disabled={busy}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.resultArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <View style={[styles.addButton, added && styles.addButtonDone, already && styles.addButtonAlready]}>
                    <Text style={[styles.addButtonText, added && styles.addButtonTextDone, already && styles.addButtonTextAlready]}>
                      {added ? "✓" : already ? "!" : "+"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
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

  sectionLabel: {
    fontSize: 16,
    letterSpacing: 1,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 10,
  },

  searchSection: {
    flex: 1,
  },

  searchRow: {
    flexDirection: "row",
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: colors.pink,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 52,
    ...glow.pink,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  searchButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  resultsList: {
    flex: 1,
    marginTop: 10,
  },

  clearButton: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 4,
  },

  clearButtonText: {
    color: colors.textMuted,
    fontSize: 13,
  },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 10,
  },

  resultInfo: {
    flex: 1,
  },

  resultTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  resultArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },

  addButton: {
    backgroundColor: colors.purple,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...glow.purple,
  },

  addButtonDone: {
    backgroundColor: colors.surfaceAlt,
    shadowOpacity: 0,
    elevation: 0,
  },

  addButtonAlready: {
    backgroundColor: colors.surfaceAlt,
    shadowOpacity: 0,
    elevation: 0,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },

  addButtonTextDone: {
    color: colors.cyan,
    fontSize: 14,
  },

  addButtonTextAlready: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "700",
  },

  error: {
    color: colors.error,
    fontSize: 13,
    marginTop: 8,
  },

  qrBox: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },

  qrLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: "600",
  },

  qrImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purple,
    ...glow.purple,
  },

  qrSub: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.purpleLight,
    letterSpacing: 6,
  },

  queueSection: {
    marginBottom: 24,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },

  songCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 12,
  },

  songCardActive: {
    borderColor: colors.purpleLight,
    ...glow.purple,
  },

  songIndex: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    width: 20,
    textAlign: "center",
  },

  songIndexActive: {
    color: colors.purpleLight,
    fontSize: 14,
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
});
