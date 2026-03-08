"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabTwoScreen;
var expo_image_1 = require("expo-image");
var react_native_1 = require("react-native");
var collapsible_1 = require("@/components/ui/collapsible");
var external_link_1 = require("@/components/external-link");
var parallax_scroll_view_1 = require("@/components/parallax-scroll-view");
var themed_text_1 = require("@/components/themed-text");
var themed_view_1 = require("@/components/themed-view");
var icon_symbol_1 = require("@/components/ui/icon-symbol");
var theme_1 = require("@/constants/theme");
function TabTwoScreen() {
    return (<parallax_scroll_view_1.default headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }} headerImage={<icon_symbol_1.IconSymbol size={310} color="#808080" name="chevron.left.forwardslash.chevron.right" style={styles.headerImage}/>}>
      <themed_view_1.ThemedView style={styles.titleContainer}>
        <themed_text_1.ThemedText type="title" style={{
            fontFamily: theme_1.Fonts.rounded,
        }}>
          Explore
        </themed_text_1.ThemedText>
      </themed_view_1.ThemedView>
      <themed_text_1.ThemedText>This app includes example code to help you get started.</themed_text_1.ThemedText>
      <collapsible_1.Collapsible title="File-based routing">
        <themed_text_1.ThemedText>
          This app has two screens:{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</themed_text_1.ThemedText> and{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</themed_text_1.ThemedText>
        </themed_text_1.ThemedText>
        <themed_text_1.ThemedText>
          The layout file in <themed_text_1.ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</themed_text_1.ThemedText>{' '}
          sets up the tab navigator.
        </themed_text_1.ThemedText>
        <external_link_1.ExternalLink href="https://docs.expo.dev/router/introduction">
          <themed_text_1.ThemedText type="link">Learn more</themed_text_1.ThemedText>
        </external_link_1.ExternalLink>
      </collapsible_1.Collapsible>
      <collapsible_1.Collapsible title="Android, iOS, and web support">
        <themed_text_1.ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">w</themed_text_1.ThemedText> in the terminal running this project.
        </themed_text_1.ThemedText>
      </collapsible_1.Collapsible>
      <collapsible_1.Collapsible title="Images">
        <themed_text_1.ThemedText>
          For static images, you can use the <themed_text_1.ThemedText type="defaultSemiBold">@2x</themed_text_1.ThemedText> and{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">@3x</themed_text_1.ThemedText> suffixes to provide files for
          different screen densities
        </themed_text_1.ThemedText>
        <expo_image_1.Image source={require('@/assets/images/react-logo.png')} style={{ width: 100, height: 100, alignSelf: 'center' }}/>
        <external_link_1.ExternalLink href="https://reactnative.dev/docs/images">
          <themed_text_1.ThemedText type="link">Learn more</themed_text_1.ThemedText>
        </external_link_1.ExternalLink>
      </collapsible_1.Collapsible>
      <collapsible_1.Collapsible title="Light and dark mode components">
        <themed_text_1.ThemedText>
          This template has light and dark mode support. The{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">useColorScheme()</themed_text_1.ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </themed_text_1.ThemedText>
        <external_link_1.ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <themed_text_1.ThemedText type="link">Learn more</themed_text_1.ThemedText>
        </external_link_1.ExternalLink>
      </collapsible_1.Collapsible>
      <collapsible_1.Collapsible title="Animations">
        <themed_text_1.ThemedText>
          This template includes an example of an animated component. The{' '}
          <themed_text_1.ThemedText type="defaultSemiBold">components/HelloWave.tsx</themed_text_1.ThemedText> component uses
          the powerful{' '}
          <themed_text_1.ThemedText type="defaultSemiBold" style={{ fontFamily: theme_1.Fonts.mono }}>
            react-native-reanimated
          </themed_text_1.ThemedText>{' '}
          library to create a waving hand animation.
        </themed_text_1.ThemedText>
        {react_native_1.Platform.select({
            ios: (<themed_text_1.ThemedText>
              The <themed_text_1.ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</themed_text_1.ThemedText>{' '}
              component provides a parallax effect for the header image.
            </themed_text_1.ThemedText>),
        })}
      </collapsible_1.Collapsible>
    </parallax_scroll_view_1.default>);
}
var styles = react_native_1.StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
});
