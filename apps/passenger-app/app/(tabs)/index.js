"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeScreen;
var expo_image_1 = require("expo-image");
var react_native_1 = require("react-native");
var hello_wave_1 = require("@/components/hello-wave");
var parallax_scroll_view_1 = require("@/components/parallax-scroll-view");
var themed_text_1 = require("@/components/themed-text");
var themed_view_1 = require("@/components/themed-view");
var expo_router_1 = require("expo-router");
function HomeScreen() {
    return (<parallax_scroll_view_1.default headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<expo_image_1.Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo}/>}>
      <themed_view_1.ThemedView style={styles.titleContainer}>
        <themed_text_1.ThemedText type="title">Welcome!</themed_text_1.ThemedText>
        <hello_wave_1.HelloWave />
      </themed_view_1.ThemedView>
      <themed_view_1.ThemedView style={styles.stepContainer}>
        <themed_text_1.ThemedText type="subtitle">Step 1: Try it</themed_text_1.ThemedText>
        <themed_text_1.ThemedText>
          Edit <themed_text_1.ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</themed_text_1.ThemedText> to see changes.
          Press{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">
            {react_native_1.Platform.select({
            ios: 'cmd + d',
            android: 'cmd + m',
            web: 'F12',
        })}
          </themed_text_1.ThemedText>{' '}
          to open developer tools.
        </themed_text_1.ThemedText>
      </themed_view_1.ThemedView>
      <themed_view_1.ThemedView style={styles.stepContainer}>
        <expo_router_1.Link href="/modal">
          <expo_router_1.Link.Trigger>
            <themed_text_1.ThemedText type="subtitle">Step 2: Explore</themed_text_1.ThemedText>
          </expo_router_1.Link.Trigger>
          <expo_router_1.Link.Preview />
          <expo_router_1.Link.Menu>
            <expo_router_1.Link.MenuAction title="Action" icon="cube" onPress={function () { return alert('Action pressed'); }}/>
            <expo_router_1.Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={function () { return alert('Share pressed'); }}/>
            <expo_router_1.Link.Menu title="More" icon="ellipsis">
              <expo_router_1.Link.MenuAction title="Delete" icon="trash" destructive onPress={function () { return alert('Delete pressed'); }}/>
            </expo_router_1.Link.Menu>
          </expo_router_1.Link.Menu>
        </expo_router_1.Link>

        <themed_text_1.ThemedText>
          {"Tap the Explore tab to learn more about what's included in this starter app."}
        </themed_text_1.ThemedText>
      </themed_view_1.ThemedView>
      <themed_view_1.ThemedView style={styles.stepContainer}>
        <themed_text_1.ThemedText type="subtitle">Step 3: Get a fresh start</themed_text_1.ThemedText>
        <themed_text_1.ThemedText>
          {"When you're ready, run "}
          <themed_text_1.ThemedText type="defaultSemiBold">npm run reset-project</themed_text_1.ThemedText> to get a fresh{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">app</themed_text_1.ThemedText> directory. This will move the current{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">app</themed_text_1.ThemedText> to{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">app-example</themed_text_1.ThemedText>.
        </themed_text_1.ThemedText>
      </themed_view_1.ThemedView>
    </parallax_scroll_view_1.default>);
}
var styles = react_native_1.StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
