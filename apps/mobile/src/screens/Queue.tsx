import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { getQueue } from "../api/rides"
import { addSong } from "../api/songs"
import { pushToSpotify, searchSpotify } from "../api/spotify"
import { Song } from "@riderdj/types";


export default function Queue({ route }: any) {
  const { rideId } = route.params
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);


  useEffect(() => {
    loadQueue()
  }, [])

  const loadQueue = async () => {
  try {
    setError("");
    setLoading(true);
    const data = await getQueue(rideId)
    console.log("QUEUE DATA:", data) // debug

    // handle both cases: array or object with songs property
    //setSongs(Array.isArray(data) ? data : data.songs || [])
    const songsArray = Array.isArray(data) ? data : data.songs || [];
    setSongs([...songsArray]);

  } catch (err: any) {
    console.error(err)
    setError(err.message)
  } finally {
    setLoading(false);
  }
}

  const handleSearch = async () => {
    try {
      setError("");
      const data = await searchSpotify(query);
      setResults(data.tracks || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddSong = async (trackId: string) => {
    try {
      setError("");
      setLoading(true);
      await addSong(rideId, trackId);
      await pushToSpotify(trackId);
      await loadQueue(); // refresh queue
      setQuery("");
      setResults([]);
      //alert("Song added 🎶");
      

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("SONGS STATE:", songs);

  const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  song: {
    padding: 10,
    borderBottomWidth: 1,
  },
  songText: {
    fontSize: 16,
  },
  error: {
    color: "red",
  },
});

  return (
  <View style={styles.container}>
  <Text style={styles.title}>Current Queue 🎶</Text>
  {loading ? (
  <ActivityIndicator size="large" />
) : songs.length === 0 ? (
  <Text>No songs yet, add some!</Text>
) : (
  <FlatList
    data={songs}
    keyExtractor={(item, index) => `${item.trackId}-${index}`}
    renderItem={({ item, index }) => (
      <Text style={styles.songText}>
        {index + 1}. {item.title} - {item.artist}
      </Text>
    )}
  />  
  )}
  <Text style={styles.title}>Search Spotify 🎧</Text>
  <TextInput
    style={styles.input}
    placeholder="Search for a song..."
    value={query}
    onChangeText={setQuery}
  />
  <Button title="Search" onPress={handleSearch} />

  {results.length > 0 && <Text style={styles.title}>Search Results 🔍</Text>}
  <FlatList
    data={results}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.song}
        onPress={() => handleAddSong(item.id)}
      >
        <Text style={styles.songText}>
          {item.title} - {item.artist}
        </Text>
      </TouchableOpacity>
    )}
  />

  {error ? <Text style={styles.error}>{error}</Text> : null}
</View>
  )
}


