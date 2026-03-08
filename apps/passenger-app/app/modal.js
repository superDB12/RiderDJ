"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModalScreen;
var expo_router_1 = require("expo-router");
var react_native_1 = require("react-native");
var themed_text_1 = require("@/components/themed-text");
var themed_view_1 = require("@/components/themed-view");
function ModalScreen() {
    return (<themed_view_1.ThemedView style={styles.container}>
      <themed_text_1.ThemedText type="title">This is a modal</themed_text_1.ThemedText>
      <expo_router_1.Link href="/" dismissTo style={styles.link}>
        <themed_text_1.ThemedText type="link">Go to home screen</themed_text_1.ThemedText>
      </expo_router_1.Link>
    </themed_view_1.ThemedView>);
}
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
