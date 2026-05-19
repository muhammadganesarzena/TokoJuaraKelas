import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 40;
const AUTOPLAY_INTERVAL = 3000;

type FeedBanner = {
  id: string;
  image_url: string;
  title: string | null;
};

const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<FeedBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const fetchBanners = useCallback(async () => {
    const { data, error } = await supabase
      .from("home_banners")
      .select("id, image_url, title")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) {
      setBanners(data);
      setActiveIndex(0);
      currentIndexRef.current = 0;
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBanners();
    }, [fetchBanners]),
  );

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (banners.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      const next = (currentIndexRef.current + 1) % banners.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      currentIndexRef.current = next;
      setActiveIndex(next);
    }, AUTOPLAY_INTERVAL);
  }, [banners.length]);

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

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 16),
      );
      currentIndexRef.current = index;
      setActiveIndex(index);
      startAutoplay();
    },
    [startAutoplay],
  );

  const onPressIn = useCallback(() => {
    stopAutoplay();
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [stopAutoplay, scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start(() => startAutoplay());
  }, [startAutoplay, scaleAnim]);

  const renderItem = useCallback(
    ({ item }: { item: FeedBanner }) => (
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View
          style={[styles.bannerCard, { transform: [{ scale: scaleAnim }] }]}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </Animated.View>
      </Pressable>
    ),
    [onPressIn, onPressOut, scaleAnim],
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#2D6A4F" />
      </View>
    );
  }

  if (banners.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Belum ada banner promo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
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

      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  loadingBox: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBox: {
    height: 120,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#F0F4F0",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#888",
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
    backgroundColor: "#2D6A4F",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#DDDDDD",
  },
});

export default BannerSlider;
