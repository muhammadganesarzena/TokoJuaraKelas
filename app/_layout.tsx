import { Stack, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { CartProvider } from "./context/CartContext";
import { HistoryProvider } from "./context/HistoryContext";
import { ProductProvider } from "./context/ProductContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider } from "./context/ThemeContext";

const TAB_ORDER = [
  "/Homepage/Homepage",
  "/History/History",
  "/Wishlist/Wishlist",
  "/Profile/Profile",
];

const getTabIndex = (path: string): number =>
  TAB_ORDER.findIndex((tab) => path.includes(tab.split("/")[1]));

type AnimationType = "slide_from_right" | "slide_from_left" | "fade";

export default function RootLayout() {
  const pathname = usePathname();
  const prevPathRef = useRef<string>(pathname);
  const [animation, setAnimation] = useState<AnimationType>("fade");

  useEffect(() => {
    const prevIndex: number = getTabIndex(prevPathRef.current);
    const currIndex: number = getTabIndex(pathname);

    if (prevIndex !== -1 && currIndex !== -1) {
      if (currIndex > prevIndex) {
        setAnimation("slide_from_right");
      } else if (currIndex < prevIndex) {
        setAnimation("slide_from_left");
      }
    } else {
      setAnimation("fade");
    }

    prevPathRef.current = pathname;
  }, [pathname]);

  return (
    <ThemeProvider>
      <ProductProvider>
        <ProfileProvider>
          <CartProvider>
            <HistoryProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: animation,
                  animationDuration: 250,
                }}
              >
                <Stack.Screen name="index" options={{ animation: "fade" }} />
                <Stack.Screen
                  name="onboarding"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen name="login" options={{ animation: "fade" }} />
                <Stack.Screen
                  name="reset-password"
                  options={{ animation: "fade" }}
                />

                <Stack.Screen
                  name="LoginScreen/LoginScreen"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="LoginScreen/RegisterScreen"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="LoginScreen/reset-password"
                  options={{ animation: "slide_from_right" }}
                />

                <Stack.Screen name="Homepage/Homepage" />
                <Stack.Screen
                  name="ProductDetail/ProductDetail"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="Cart/Cart"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="Payment/Payment"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="Payment/OrderConfirmation"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen name="History/History" />
                <Stack.Screen
                  name="History/HistoryDetail"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen name="Wishlist/Wishlist" />
                <Stack.Screen name="Profile/Profile" />
                <Stack.Screen
                  name="Profile/EditProfile"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="admin/overview"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="admin/products"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="admin/categories"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="admin/orders"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="admin/users"
                  options={{ animation: "fade" }}
                />
              </Stack>
            </HistoryProvider>
          </CartProvider>
        </ProfileProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}
