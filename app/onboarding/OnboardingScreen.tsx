import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./OnboardingScreen.styles";

const { width } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  image: any;
  title: string;
  description: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    image: require("../../assets/images/Onboarding/Onboarding 1.jpg"),
    title: "Choose the Best\nGuitar for You",
    description: "Browse from various top quality\nBranded Guitars easily.",
  },
  {
    id: "2",
    image: require("../../assets/images/Onboarding/Onboarding 2.jpg"),
    title: "Find Your Perfect\nSound",
    description:
      "Explore a wide range of guitars\nfrom beginner to professional.",
  },
  {
    id: "3",
    image: require("../../assets/images/Onboarding/Onboarding 3.jpg"),
    title: "Play Without\nLimits",
    description: "Discover guitars that match\nyour style and budget.",
  },
  {
    id: "4",
    image: require("../../assets/images/Onboarding/Onboarding 4.jpg"),
    title: "Start Your Music\nJourney Today",
    description: "Join thousands of guitar lovers\nand find your dream guitar.",
  },
];

const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    router.replace("/LoginScreen/LoginScreen");
  };

  const handleGetStarted = () => {
    router.replace("/LoginScreen/LoginScreen");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const renderItem = ({ item }: ListRenderItemInfo<OnboardingItem>) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
    </View>
  );

  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <View style={styles.container}>
      {/* Image Slider */}
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
        scrollEnabled={true}
      />

      {/* Bottom Content */}
      <View style={styles.bottomContainer}>
        {/* Dots Indicator */}
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

        {/* Title & Description */}
        <Text style={styles.title}>{onboardingData[currentIndex].title}</Text>
        <Text style={styles.description}>
          {onboardingData[currentIndex].description}
        </Text>

        {/* Buttons */}
        {isLastSlide ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navigationRow}>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;
