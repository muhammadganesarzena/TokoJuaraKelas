import { router } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./Cart.styles";

const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

const Cart: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cartItems, updateQuantity, totalPrice } = useCart();

  return (
    <View style={styles.root}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Your Cart Is Empty!</Text>
          <Text style={styles.emptySubtitle}>
            {"When you add products, they'll appear here."}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {cartItems.map(({ product, quantity }) => (
              <View key={product.id} style={styles.cartCard}>
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
                    onPress={() => updateQuantity(product.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product.id, 1)}
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
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Cart;
