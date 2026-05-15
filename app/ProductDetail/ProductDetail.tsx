import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./ProductDetail.styles";

const formatRupiah = (amount: number): string =>
  "Rp " + amount.toLocaleString("id-ID");

const ProductDetail: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, recommended, likedProducts, toggleLike } = useProducts();
  const { addToCart, buyNow } = useCart();

  const [selectedThumb, setSelectedThumb] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const allProducts = [...products, ...recommended];
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = likedProducts[product.id] || false;
  const thumbs = [product.image, product.image, product.image];

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    const ready = await buyNow(product);
    setBuyingNow(false);

    if (!ready) {
      Alert.alert("Gagal", "Produk belum bisa langsung dibeli. Coba login ulang.");
      return;
    }

    router.push("/Payment/Payment");
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.surfaceAlt}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.heroArea}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wishBtn}
            onPress={() => toggleLike(product.id)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#FF0000" : colors.text}
            />
          </TouchableOpacity>
          <Image
            source={thumbs[selectedThumb]}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Thumbnails */}
        <View style={styles.thumbRow}>
          {thumbs.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedThumb(idx)}
              style={[
                styles.thumbCard,
                selectedThumb === idx && styles.thumbCardActive,
              ]}
            >
              <Image
                source={img}
                style={styles.thumbImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.stockText}>In Stock</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatRupiah(product.price)}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={15} color="#E8622A" />
              <Text style={styles.ratingValue}>{product.rating ?? 4.2}</Text>
              <Text style={styles.reviewCount}>
                ({product.reviewCount ?? 321} Reviews)
              </Text>
            </View>
          </View>
          <Text style={styles.description}>
            {product.description ??
              "The name says it all, the right size slightly snugs the body leaving enough room for comfort in the sleeves and waist."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addToCartBtn, addedToCart && styles.addToCartBtnAdded]}
          onPress={handleAddToCart}
        >
          <Ionicons
            name={addedToCart ? "checkmark" : "cart-outline"}
            size={16}
            color={addedToCart ? "#FFFFFF" : "#E8622A"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.addToCartText,
              addedToCart && styles.addToCartTextAdded,
            ]}
          >
            {addedToCart ? "Added!" : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyNowBtn, buyingNow && styles.buyNowBtnDisabled]}
          onPress={handleBuyNow}
          disabled={buyingNow}
        >
          {buyingNow ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buyNowText}>Buy Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetail;
