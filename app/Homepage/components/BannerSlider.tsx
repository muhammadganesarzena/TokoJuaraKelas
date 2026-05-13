import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 40;
const AUTOPLAY_INTERVAL = 3000;

const BANNERS = [
  { id: "b1", image: require("../../../assets/Banner/Banner 4.jpg") },
  { id: "b2", image: require("../../../assets/Banner/bananer 2.jpg") },
  { id: "b3", image: require("../../../assets/Banner/Banner 3.jpg") },
];

const BannerSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Autoplay ───────────────────────────────────────────────────
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      const next = (currentIndexRef.current + 1) % BANNERS.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      currentIndexRef.current = next;
      setActiveIndex(next);
    }, AUTOPLAY_INTERVAL);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // ─── Scroll sync ────────────────────────────────────────────────
  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 16),
      );
      currentIndexRef.current = index;
      setActiveIndex(index);
      startAutoplay(); // reset timer setelah manual swipe
    },
    [startAutoplay],
  );

  // ─── Press animation ─────────────────────────────────────────────
  const onPressIn = useCallback(() => {
    stopAutoplay();
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [stopAutoplay]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start(() => startAutoplay());
  }, [startAutoplay]);

  // ─── Render ──────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: (typeof BANNERS)[0] }) => (
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View
          style={[styles.bannerCard, { transform: [{ scale: scaleAnim }] }]}
        >
          <Image
            source={item.image}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </Animated.View>
      </Pressable>
    ),
    [onPressIn, onPressOut, scaleAnim],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled={false}
        snapToInterval={BANNER_WIDTH + 16}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={stopAutoplay}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH + 16,
          offset: (BANNER_WIDTH + 16) * index,
          index,
        })}
      />

      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  flatListContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#E8622A",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#DDDDDD",
  },
});

export default BannerSlider;
