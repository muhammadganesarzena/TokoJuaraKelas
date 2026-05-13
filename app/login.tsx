import { Redirect } from "expo-router";
import { supabase } from "../../lib/supabase"

export default function Login() {
  return <Redirect href="/LoginScreen/LoginScreen" />;
}
