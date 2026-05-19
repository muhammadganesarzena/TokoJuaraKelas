import { Redirect, Stack, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getAdminSession } from "../../lib/adminSession";

export default function AdminLayout() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const isLoginRoute = pathname.includes("LoginAdmin");

  useEffect(() => {
    getAdminSession().then((session) => {
      setHasSession(!!session);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasSession && !isLoginRoute) {
    return <Redirect href="/admin/LoginAdmin" />;
  }

  if (hasSession && isLoginRoute) {
    return <Redirect href="/admin/overview" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="LoginAdmin" />
      <Stack.Screen name="overview" />
      <Stack.Screen name="products" />
      <Stack.Screen name="banners" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="inventory-nfc" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="users" />
      <Stack.Screen name="support" />
      <Stack.Screen name="Dashboard" />
    </Stack>
  );
}
