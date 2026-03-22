import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { getQueue } from "../api/rides"
import { addSong } from "../api/songs"
import { searchSpotify } from "../api/spotify"


export default function Queue({ route }: any) {
  const { rideId } = route.params
  const [trackId, setTrackId] = useState("");
  const [songs, setSongs] = useState([])
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);


  useEffect(() => {
    loadQueue()
  }, [])

  const loadQueue = async () => {
  try {
    const data = await getQueue(rideId)
    console.log("QUEUE DATA:", data) // debug

    // handle both cases: array or object with songs property
    setSongs(Array.isArray(data) ? data : data.songs || [])
  } catch (err: any) {
    console.error(err)
    setError(err.message)
  }
}

  // Assume we have this from somewhere (for dev, you can hardcode)
  const accessToken = "<YOUR_SPOTIFY_ACCESS_TOKEN>";

  const handleSearch = async () => {
    try {
      setLoading(true);
      const tracks = await searchSpotify(query, accessToken);
      setResults(tracks);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (trackId: string) => {
    try {
      setError("");
      await addSong(rideId, trackId);
      setTrackId("");
      await loadQueue(); // refresh queue
    } catch (err: any) {
      setError(err.message);
    }
  };

  const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10
  },
  error: {
    color: "red",
    marginBottom: 10
  }
})

  return (
  <View style={{ marginVertical: 10 }}>
  <TextInput
    value={query}
    onChangeText={setQuery}
    placeholder="Search Spotify..."
    style={styles.input}
    onSubmitEditing={handleSearch} // search on enter
  />
  {loading && <ActivityIndicator />}

  <FlatList
    data={results}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleAddSong(item.id)}>
        <Text>{item.name} - {item.artists[0]?.name}</Text>
      </TouchableOpacity>
    )}
  />
</View>
  )
}
