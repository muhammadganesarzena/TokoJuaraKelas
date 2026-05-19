import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRefreshControl } from "../hooks/useRefreshControl";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./Cart.styles";

const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

const Cart: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cartItems, updateQuantity, totalPrice, refreshCart } = useCart();
  const { refreshing, onRefresh } = useRefreshControl(refreshCart);

  useFocusEffect(
    useCallback(() => {
      void refreshCart();
    }, [refreshCart]),
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Keranjang Kosong!</Text>
          <Text style={styles.emptySubtitle}>
            Produk yang kamu tambahkan akan muncul di sini.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#2D6A4F"]}
                tintColor="#2D6A4F"
              />
            }
          >
            {cartItems.map(({ id, product, quantity }) => (
              <View key={id} style={styles.cartCard}>
                <View style={styles.cartImageWrapper}>
                  <Image
                    source={product.image}
                    style={styles.cartImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName}>{product.name}</Text>
                  <Text style={styles.cartPrice}>
                    {formatRupiah(product.price)}
                  </Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatRupiah(totalPrice)}</Text>
            </View>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => router.push("/Payment/Payment")}
            >
              <Text style={styles.buyNowText}>Beli Sekarang</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Cart;
