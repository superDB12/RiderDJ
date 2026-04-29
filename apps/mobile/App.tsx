import React from "react"
import { NavigationContainer, LinkingOptions } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as Linking from "expo-linking"

import Queue from "./src/screens/Queue"
import JoinRideScreen from "./src/screens/JoinRide"
import Driver from "./src/screens/Driver"
import Home from "./src/screens/Home"
import RoleSelect from "./src/screens/RoleSelect"
import DriverAuth from "./src/screens/DriverAuth"

export type RootStackParamList = {
  RoleSelect: undefined
  DriverAuth: undefined
  Home: undefined
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
      JoinRide: "join/:rideId",
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        id="root"
        initialRouteName="RoleSelect"
        screenOptions={{
          headerStyle: { backgroundColor: "#07060f" },
          headerTintColor: "#f0eaff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#07060f" },
        }}
      >
        <Stack.Screen name="RoleSelect" component={RoleSelect} options={{ headerShown: false }} />
        <Stack.Screen name="DriverAuth" component={DriverAuth} options={{ headerShown: false }} />

        {/* DRIVER FLOW */}
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Driver" component={Driver} options={{ headerShown: false }} />

        {/* PASSENGER FLOW */}
        <Stack.Screen name="JoinRide" component={JoinRideScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Queue" component={Queue} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  )
}
