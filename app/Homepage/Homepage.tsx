import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import type { Category, Product } from "../context/ProductContext";
import { useProducts } from "../context/ProductContext";
import { useTheme } from "../context/ThemeContext";
import BannerSlider from "./components/BannerSlider";
import Sidebar from "./components/Sidebar";
import { getStyles } from "./Homepage.styles";

const formatRupiah = (amount: number): string =>
  "Rp " + amount.toLocaleString("id-ID");

const Homepage: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const {
    recommended,
    filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    likedProducts,
    toggleLike,
    loadingProducts,
    refreshProducts,
  } = useProducts();
  const { totalCount } = useCart();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifPressed, setNotifPressed] = useState(false);
  useFocusEffect(
    useCallback(() => {
      refreshProducts();
    }, []),
  );

  const recommendedScale = useRef(new Animated.Value(1)).current;
  const productScale = useRef(new Animated.Value(1)).current;

  const goToDetail = (product: Product) => {
    router.push({
      pathname: "/ProductDetail/ProductDetail",
      params: { id: product.id, name: product.name, price: product.price },
    });
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(isSelected ? null : item.id)}
      >
        <Text
          style={[
            styles.categoryChipText,
            isSelected && styles.categoryChipTextActive,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecommended = ({ item }: { item: Product }) => {
    const onPressIn = () =>
      Animated.spring(recommendedScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    const onPressOut = () =>
      Animated.spring(recommendedScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

    return (
      <TouchableWithoutFeedback
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => goToDetail(item)}
      >
        <Animated.View
          style={[
            styles.recommendCard,
            { transform: [{ scale: recommendedScale }] },
          ]}
        >
          {item.image ? (
            <Image
              source={item.image}
              style={styles.recommendImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.recommendImage,
                { backgroundColor: "#f0f0f0", borderRadius: 8 },
              ]}
            />
          )}
          <Text style={styles.recommendPrice}>{formatRupiah(item.price)}</Text>
          <Text style={styles.recommendName}>{item.name}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const onPressIn = () =>
      Animated.spring(productScale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    const onPressOut = () =>
      Animated.spring(productScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

    const liked = likedProducts[item.id] || false;

    return (
      <TouchableWithoutFeedback
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => goToDetail(item)}
      >
        <Animated.View
          style={[styles.productCard, { transform: [{ scale: productScale }] }]}
        >
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleLike(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#2D6A4F" : colors.textMuted}
            />
          </TouchableOpacity>

          {item.image ? (
            <Image
              source={item.image}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.productImage,
                { backgroundColor: "#f0f0f0", borderRadius: 8 },
              ]}
            />
          )}
          <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>
          <Text style={styles.productName}>{item.name}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarOpen(true)}>
            <Ionicons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.headerIcon,
                notifPressed && styles.headerIconPressed,
              ]}
              onPressIn={() => setNotifPressed(true)}
              onPressOut={() => setNotifPressed(false)}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => router.push("/chat" as any)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => router.push("/Cart/Cart")}
            >
              <Ionicons name="cart-outline" size={24} color={colors.text} />
              {totalCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {totalCount > 99 ? "99+" : totalCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.feedTitle}>Your Feed</Text>

        <BannerSlider />

        {/* Recommended */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <Text style={styles.sectionSub}>Based on Search</Text>
        </View>

        <FlatList
          data={recommended}
          renderItem={renderRecommended}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Kategori */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {loadingProducts ? (
            <ActivityIndicator
              size="large"
              color="#2D6A4F"
              style={{ marginTop: 40, width: "100%" }}
            />
          ) : filteredProducts.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "#999",
                marginTop: 40,
                width: "100%",
              }}
            >
              {selectedCategory
                ? "Tidak ada produk di kategori ini."
                : "Belum ada produk tersedia."}
            </Text>
          ) : (
            filteredProducts.map((item) => (
              <View key={item.id} style={styles.productWrapper}>
                {renderProduct({ item })}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Homepage/Homepage")}
        >
          <Ionicons name="home" size={24} color="#2D6A4F" />
          <View style={styles.navDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/History/History")}
        >
          <Ionicons name="time-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Wishlist/Wishlist")}
        >
          <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/chat" as any)}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Profile/Profile")}
        >
          <Ionicons name="person-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </View>
  );
};

export default Homepage;
