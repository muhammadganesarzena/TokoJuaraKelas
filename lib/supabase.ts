import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cdvsqtrbxczuqgfdcnfw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdnNxdHJieGN6dXFnZmRjbmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjAxNDQsImV4cCI6MjA5MzAzNjE0NH0.oz2u6u4IZugzi_-63e4RPoc7a5qfmtGCZKxqDuVyv5o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
