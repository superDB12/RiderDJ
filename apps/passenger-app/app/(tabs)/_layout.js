"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabLayout;
var expo_router_1 = require("expo-router");
var react_1 = require("react");
var haptic_tab_1 = require("@/components/haptic-tab");
var icon_symbol_1 = require("@/components/ui/icon-symbol");
var theme_1 = require("@/constants/theme");
var use_color_scheme_1 = require("@/hooks/use-color-scheme");
function TabLayout() {
    var colorScheme = (0, use_color_scheme_1.useColorScheme)();
    return (<expo_router_1.Tabs screenOptions={{
            tabBarActiveTintColor: theme_1.Colors[colorScheme !== null && colorScheme !== void 0 ? colorScheme : 'light'].tint,
            headerShown: false,
            tabBarButton: haptic_tab_1.HapticTab,
        }}>
      <expo_router_1.Tabs.Screen name="index" options={{
            title: 'Home',
            tabBarIcon: function (_a) {
                var color = _a.color;
                return <icon_symbol_1.IconSymbol size={28} name="house.fill" color={color}/>;
            },
        }}/>
      <expo_router_1.Tabs.Screen name="explore" options={{
            title: 'Explore',
            tabBarIcon: function (_a) {
                var color = _a.color;
                return <icon_symbol_1.IconSymbol size={28} name="paperplane.fill" color={color}/>;
            },
        }}/>
    </expo_router_1.Tabs>);
}
