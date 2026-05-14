import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [redirectTo, setRedirectTo] = useState<
    "/Homepage/Homepage" | "/LoginScreen/LoginScreen" | null
  >(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setRedirectTo(
        session?.user ? "/Homepage/Homepage" : "/LoginScreen/LoginScreen",
      );
    };

    checkSession();
  }, []);

  if (!redirectTo) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={redirectTo} />;
}
