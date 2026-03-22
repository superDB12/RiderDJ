import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SpotifyConnect from "./src/screens/SpotifyConnect"
import Queue from "./src/screens/Queue"
import JoinRideScreen from "./src/screens/JoinRide"

export type RootStackParamList = {
  SpotifyConnect: undefined
  JoinRide: undefined
  Queue: { rideId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator id="root" initialRouteName="JoinRide">
        <Stack.Screen name="SpotifyConnect" component={SpotifyConnect} options={{ title: "Driver: Connect Spotify" }} />
        <Stack.Screen name="JoinRide" component={JoinRideScreen} options={{ title: "Join Ride" }} />
        <Stack.Screen name="Queue" component={Queue} options={{ title: "Song Queue" }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}