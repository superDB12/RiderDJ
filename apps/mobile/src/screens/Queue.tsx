import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { getQueue } from "../api/rides"

export default function Queue({ route }: any) {
  const { rideId } = route.params
  const [songs, setSongs] = useState([])

  useEffect(() => {
    loadQueue()
  }, [])

  const loadQueue = async () => {
    try {
      const data = await getQueue(rideId)
      setSongs(data.songs || [])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Song Queue 🎶</Text>

      {songs.map((song: any, i) => (
        <Text key={i}>
          {i + 1}. {song.title} - {song.artist}
        </Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  }
})