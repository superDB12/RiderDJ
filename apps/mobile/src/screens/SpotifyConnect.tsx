// apps/mobile/src/screens/SpotifyConnect.tsx
import { Button, View, Text } from "react-native"
import { Linking } from "react-native"

const clientId = process.env.SPOTIFY_CLIENT_ID || "your_spotify_client_id"
const redirectUri = "http://192.168.86.130:3000/spotify/callback"
const scopes = "user-modify-playback-state user-read-playback-state"

export default function SpotifyConnect() {
  const connectSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}`

    Linking.openURL(authUrl)
  }

  return (
    <View>
      <Text>Connect your Spotify account to start playing music</Text>
      <Button title="Connect Spotify" onPress={connectSpotify} />
    </View>
  )
}