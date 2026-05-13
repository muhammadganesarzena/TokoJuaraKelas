import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./Wishlist.styles";

const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

const Wishlist = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { wishlist, toggleLike } = useProducts();
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const goToDetail = (item: any) => {
    router.push({
      pathname: "/ProductDetail/ProductDetail",
      params: { id: item.id, name: item.name, price: item.price },
    });
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(
      () => setAddedItems((prev) => ({ ...prev, [item.id]: false })),
      1500,
    );
  };

  const renderItem = ({ item }: any) => {
    const isAdded = addedItems[item.id];
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.heart}
          onPress={() => toggleLike(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart" size={22} color="#2D6A4F" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goToDetail(item)}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.price}>{formatRupiah(item.price)}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity
          style={[styles.button, isAdded && styles.buttonAdded]}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons
            name={isAdded ? "checkmark" : "cart-outline"}
            size={14}
            color="#FFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.buttonText}>
            {isAdded ? "Added!" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Saved Items!</Text>
          <Text style={styles.emptyDesc}>
            {"You don't have any saved items.\nGo to home and add some."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 120 }}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Homepage/Homepage")}
        >
          <Ionicons name="home-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/History/History")}
        >
          <Ionicons name="time-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart" size={24} color="#2D6A4F" />
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Profile/Profile")}
        >
          <Ionicons name="person-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Wishlist;
