import { Button, View, Text } from "react-native";
import * as Linking from "expo-linking";
import { useRoute } from "@react-navigation/native";

const BASE_URL = "http://192.168.86.130:3000";

export default function SpotifyConnect() {
  const route = useRoute<any>();
  const { rideId } = route.params;

  const connectSpotify = () => {
    // createURL produces the right scheme for Expo Go (exp://) or production (riderdj://)
    const redirectTo = Linking.createURL(`driver/${rideId}`);

    const url =
      `${BASE_URL}/spotify/login` +
      `?rideId=${encodeURIComponent(rideId)}` +
      `&redirectTo=${encodeURIComponent(redirectTo)}`;

    console.log("Opening:", url);
    console.log("Will redirect back to:", redirectTo);

    Linking.openURL(url);
  };

  return (
    <View>
      <Text>Connect your Spotify account to start playing music</Text>
      <Button title="Connect Spotify" onPress={connectSpotify} />
    </View>
  );
}
