import React from "react"
import { NavigationContainer, LinkingOptions } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as Linking from "expo-linking"

import SpotifyConnect from "./src/screens/SpotifyConnect"
import Queue from "./src/screens/Queue"
import JoinRideScreen from "./src/screens/JoinRide"
import Driver from "./src/screens/Driver"
import Home from "./src/screens/Home"
import RoleSelect from "./src/screens/RoleSelect"

export type RootStackParamList = {
  RoleSelect: undefined
  Home: undefined
  SpotifyConnect: { rideId: string }
  JoinRide: { rideId: string }
  Queue: { rideId: string }
  Driver: { rideId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "riderdj://"],
  config: {
    screens: {
      Driver: "driver/:rideId",
      Queue: "queue/:rideId",
      SpotifyConnect: "connect",
      JoinRide: "join/:rideId",
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator id="root" initialRouteName="RoleSelect">
  
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelect}
          options={{ headerShown: false }}
        />

        {/* DRIVER FLOW */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SpotifyConnect" component={SpotifyConnect} />
        <Stack.Screen name="Driver" component={Driver} />

        {/* PASSENGER FLOW */}
        <Stack.Screen name="JoinRide" component={JoinRideScreen} />
        <Stack.Screen name="Queue" component={Queue} />

      </Stack.Navigator>
    </NavigationContainer>
  )
}