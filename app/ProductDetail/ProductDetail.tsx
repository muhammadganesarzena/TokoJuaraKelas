import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
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
  const { products, recommended, likedProducts, loadingProducts, toggleLike } =
    useProducts();
  const { addToCart, buyNow } = useCart();

  const [selectedThumb, setSelectedThumb] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const allProducts = [...products, ...recommended];
  const product = allProducts.find((p) => p.id === id);

  const renderProductImage = (
    source: ImageSourcePropType | null | undefined,
    imageStyle: any,
    fallbackSize: number,
  ) =>
    source && !imageFailed ? (
      <Image
        source={source}
        style={imageStyle}
        resizeMode="contain"
        onError={() => setImageFailed(true)}
      />
    ) : (
      <View style={[imageStyle, styles.imageFallback]}>
        <Ionicons
          name="musical-instruments-outline"
          size={fallbackSize}
          color={colors.textMuted}
        />
      </View>
    );

  if (loadingProducts) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.notFoundText}>Memuat produk...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Produk tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = likedProducts[product.id] || false;
  const imageSource = product.image_url?.trim()
    ? { uri: product.image_url.trim() }
    : product.image;
  const thumbs = [imageSource, imageSource, imageSource];

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
      Alert.alert(
        "Gagal",
        "Produk belum bisa langsung dibeli. Coba login ulang.",
      );
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
          {renderProductImage(thumbs[selectedThumb], styles.heroImage, 86)}
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
              {renderProductImage(img, styles.thumbImage, 24)}
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.stockText}>Tersedia</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatRupiah(product.price)}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={15} color={colors.accent} />
              <Text style={styles.ratingValue}>{product.rating ?? 4.2}</Text>
              <Text style={styles.reviewCount}>
                ({product.reviewCount ?? 321} Ulasan)
              </Text>
            </View>
          </View>
          <Text style={styles.description}>
            {product.description ??
              "Produk berkualitas dengan bahan nyaman dipakai sehari-hari."}
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
            color={addedToCart ? "#FFFFFF" : colors.accent}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.addToCartText,
              addedToCart && styles.addToCartTextAdded,
            ]}
          >
            {addedToCart ? "Ditambahkan!" : "Keranjang"}
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
            <Text style={styles.buyNowText}>Beli Sekarang</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetail;
