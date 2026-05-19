import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra space below last field when keyboard is open */
  extraScrollHeight?: number;
  /** Set false for screens that are not scrollable */
  scrollEnabled?: boolean;
  /** Header offset (custom header height outside safe area) */
  headerOffset?: number;
};

export default function KeyboardAwareScreen({
  children,
  style,
  contentContainerStyle,
  extraScrollHeight = 24,
  scrollEnabled = true,
  headerOffset = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomInset = keyboardVisible ? 12 : insets.bottom;
  const keyboardOffset = insets.top + headerOffset;

  if (!scrollEnabled) {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, style]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View
          style={[
            styles.flex,
            contentContainerStyle,
            { paddingBottom: bottomInset },
          ]}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={keyboardOffset}
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
        extraScrollHeight={extraScrollHeight}
        extraHeight={extraScrollHeight}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          contentContainerStyle,
          { paddingBottom: bottomInset + extraScrollHeight },
        ]}
      >
        {children}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
});
