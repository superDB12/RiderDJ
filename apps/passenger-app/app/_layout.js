"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstable_settings = void 0;
exports.default = RootLayout;
var native_1 = require("@react-navigation/native");
var expo_router_1 = require("expo-router");
var expo_status_bar_1 = require("expo-status-bar");
require("react-native-reanimated");
var use_color_scheme_1 = require("@/hooks/use-color-scheme");
exports.unstable_settings = {
    anchor: '(tabs)',
};
function RootLayout() {
    var colorScheme = (0, use_color_scheme_1.useColorScheme)();
    return (<native_1.ThemeProvider value={colorScheme === 'dark' ? native_1.DarkTheme : native_1.DefaultTheme}>
      <expo_router_1.Stack>
        <expo_router_1.Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        <expo_router_1.Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }}/>
      </expo_router_1.Stack>
      <expo_status_bar_1.StatusBar style="auto"/>
    </native_1.ThemeProvider>);
}
