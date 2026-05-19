import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const ADMIN_SESSION_KEY = "admin_session";

export type AdminSession = {
  id?: string;
  email: string;
  name?: string;
  loggedInAt: string;
};

export const saveAdminSession = async (admin: {
  id?: string;
  email: string;
  name?: string;
}) => {
  const session: AdminSession = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    loggedInAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const getAdminSession = async () => {
  const raw = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

export const clearAdminSession = async () => {
  await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
};

/** Reset navigation stack lalu buka dashboard admin (hindari kembali ke /chat user). */
export const goToAdminDashboard = () => {
  if (typeof router.canDismiss === "function" && router.canDismiss()) {
    router.dismissAll();
  }
  router.replace("/admin/overview");
};
