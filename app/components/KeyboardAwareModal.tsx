import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const MAX_SCROLL_HEIGHT = Math.round(Dimensions.get("window").height * 0.62);

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraScrollHeight?: number;
};

/** Scroll area for bottom-sheet modals (avoid flex:1 collapse inside Modal). */
export default function KeyboardAwareModal({
  children,
  contentContainerStyle,
  extraScrollHeight = 32,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <KeyboardAwareScrollView
        style={styles.scroll}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
        extraScrollHeight={extraScrollHeight}
        extraHeight={extraScrollHeight}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={[styles.content, contentContainerStyle]}
      >
        {children}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: MAX_SCROLL_HEIGHT },
  content: { paddingBottom: 16 },
});
