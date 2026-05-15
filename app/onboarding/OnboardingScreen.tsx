import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SLIDE_BACKGROUNDS,
  styles
} from "./OnboardingScreen.styles";

const { width } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  lottie: any;
  title: string;
  description: string;
}

// Tiap badge punya icon sendiri dari @expo/vector-icons
interface SlideBadge {
  label: string;
  icon: React.ReactNode;
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    lottie: require("../../assets/animations/onboarding1.json"),
    title: "Lengkapi Alat\nTulis Kamu",
    description:
      "Temukan berbagai alat tulis berkualitas\nuntuk belajar lebih semangat.",
  },
  {
    id: "2",
    lottie: require("../../assets/animations/onboarding2.json"),
    title: "Buku & Perlengkapan\nBelajar Terlengkap",
    description:
      "Dari buku tulis, map, hingga tas sekolah\nsemuanya ada di sini.",
  },
  {
    id: "3",
    lottie: require("../../assets/animations/onboarding3.json"),
    title: "Seragam & Baju\nSekolah Pilihan",
    description:
      "Pilih seragam sekolah yang nyaman\ndan sesuai standar sekolahmu.",
  },
  {
    id: "4",
    lottie: require("../../assets/animations/onboarding4.json"),
    title: "Belanja Mudah,\nCepat & Hemat",
    description: "Pesan sekarang dan dapatkan\npengiriman cepat ke rumahmu.",
  },
];

const SLIDE_BADGE_DATA: SlideBadge[] = [
  {
    label: "Alat Tulis",
    icon: (
      <MaterialCommunityIcons
        name="pencil-outline"
        size={13}
        color="#0A6E31"
        style={{ marginRight: 5 }}
      />
    ),
  },
  {
    label: "Perlengkapan",
    icon: (
      <MaterialCommunityIcons
        name="book-open-outline"
        size={13}
        color="#0A6E31"
        style={{ marginRight: 5 }}
      />
    ),
  },
  {
    label: "Seragam Sekolah",
    icon: (
      <MaterialCommunityIcons
        name="tshirt-crew-outline"
        size={13}
        color="#0A6E31"
        style={{ marginRight: 5 }}
      />
    ),
  },
  {
    label: "Belanja Sekarang",
    icon: (
      <MaterialCommunityIcons
        name="shopping-outline"
        size={13}
        color="#0A6E31"
        style={{ marginRight: 5 }}
      />
    ),
  },
];

const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);
  const lottieRefs = useRef<(LottieView | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTextIn = () => {
    slideAnim.setValue(14);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => router.replace("/LoginScreen/LoginScreen");
  const handleGetStarted = () => router.replace("/LoginScreen/LoginScreen");

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index ?? 0;
      setCurrentIndex(newIndex);
      lottieRefs.current[newIndex]?.play();
      animateTextIn();
    }
  }).current;

  const renderItem = ({ item, index }: ListRenderItemInfo<OnboardingItem>) => (
    <View
      style={[
        styles.slide,
        {
          backgroundColor: SLIDE_BACKGROUNDS[index % SLIDE_BACKGROUNDS.length],
        },
      ]}
    >
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />
      <LottieView
        ref={(ref) => {
          lottieRefs.current[index] = ref;
        }}
        source={item.lottie}
        autoPlay={index === 0}
        loop
        style={styles.lottie}
      />
    </View>
  );

  const isLastSlide = currentIndex === onboardingData.length - 1;
  const currentBadge = SLIDE_BADGE_DATA[currentIndex];

  return (
    <View style={styles.container}>
      {/* Slider */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={styles.flatList}
        scrollEnabled
      />

      {/* Bottom Card */}
      <View style={styles.bottomContainer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Badge dengan vector icon */}
        <Animated.View
          style={[
            styles.badgeWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.badge}>
            {currentBadge.icon}
            <Text style={styles.badgeText}>{currentBadge.label}</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {onboardingData[currentIndex].title}
        </Animated.Text>

        {/* Description */}
        <Animated.Text style={[styles.description, { opacity: fadeAnim }]}>
          {onboardingData[currentIndex].description}
        </Animated.Text>

        {/* Buttons */}
        {isLastSlide ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            {/* Icon di kiri teks Get Started */}
            <View style={styles.getStartedInner}>
              <MaterialCommunityIcons
                name="shopping-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.getStartedText}>Mulai Belanja</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.navigationRow}>
            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.7}
              style={styles.skipWrapper}
            >
              <Text style={styles.skipText}>Lewati</Text>
            </TouchableOpacity>

            {/* Tombol Next pakai Ionicons arrow */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;
