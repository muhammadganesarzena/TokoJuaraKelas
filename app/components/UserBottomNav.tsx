import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";

type ActiveTab = "home" | "history" | "wishlist" | "chat" | "profile";

type Props = {
  active: ActiveTab;
};

const tabs: {
  key: ActiveTab;
  route: string;
  icon: string;
  activeIcon: string;
}[] = [
  {
    key: "home",
    route: "/Homepage/Homepage",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "history",
    route: "/History/History",
    icon: "time-outline",
    activeIcon: "time",
  },
  {
    key: "wishlist",
    route: "/Wishlist/Wishlist",
    icon: "heart-outline",
    activeIcon: "heart",
  },
  {
    key: "chat",
    route: "/chat",
    icon: "chatbubble-ellipses-outline",
    activeIcon: "chatbubble-ellipses",
  },
  {
    key: "profile",
    route: "/Profile/Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function UserBottomNav({ active }: Props) {
  const { colors } = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.key === active),
    0,
  );
  const selectedTab = tabs[selectedIndex] || tabs[activeIndex];

  const getIndicatorX = (width: number, index: number) => {
    const itemWidth = width / tabs.length;
    return itemWidth * index + itemWidth / 2 - 32;
  };

  useEffect(() => {
    if (!barWidth) return;

    setSelectedIndex(activeIndex);
    translateX.setValue(getIndicatorX(barWidth, activeIndex));
  }, [activeIndex, barWidth, translateX]);

  const handleBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (tab: (typeof tabs)[number], index: number) => {
    if (tab.key === active) return;

    setSelectedIndex(index);

    if (!barWidth) {
      router.push(tab.route as any);
      return;
    }

    Animated.spring(translateX, {
      toValue: getIndicatorX(barWidth, index),
      useNativeDriver: true,
      stiffness: 220,
      damping: 22,
      mass: 0.75,
    }).start();

    setTimeout(() => {
      router.push(tab.route as any);
    }, 130);
  };

  return (
    <View style={styles.navWrap} pointerEvents="box-none">
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.navBar,
            borderColor: colors.borderLight,
            shadowColor: colors.shadow,
          },
        ]}
        onLayout={handleBarLayout}
      >
        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeCutout,
              {
                backgroundColor: colors.background,
                transform: [{ translateX }],
              },
            ]}
          >
            <View
              style={[
                styles.activeButton,
                {
                  backgroundColor: colors.accent,
                  shadowColor: colors.accent,
                },
              ]}
            >
              <Ionicons
                name={selectedTab.activeIcon}
                size={22}
                color="#FFFFFF"
              />
            </View>
          </Animated.View>
        )}

        {tabs.map((tab, index) => {
          const isActive = selectedIndex === index;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.82}
              style={styles.navItem}
              onPress={() => handlePress(tab, index)}
            >
              {!isActive && (
                <Ionicons name={tab.icon} size={23} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  bottomNav: {
    width: "100%",
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    overflow: "visible",
  },
  navItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  activeCutout: {
    position: "absolute",
    left: 0,
    top: -27,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 12,
  },
});
