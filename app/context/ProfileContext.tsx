import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ProfileType = {
  name: string;
  nim: string;
  email: string;
  image: string | null;
  major: string;
  dob: string;
  classOf: string;
  gender: string;
};

type ProfileContextType = {
  profile: ProfileType;
  setProfile: (data: ProfileType) => void;
  loadingProfile: boolean;
};

const defaultProfile: ProfileType = {
  name: "",
  nim: "",
  email: "",
  image: null,
  major: "",
  dob: "",
  classOf: "",
  gender: "",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: any) => {
  const [profile, setProfile] = useState<ProfileType>(defaultProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        // Ambil user yang sedang login
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Ambil data dari tabel profiles
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, username, phone, address")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          name: data.full_name || "",
          nim: data.username || "",
          email: user.email || "",
          image: null,
          major: "",
          dob: "",
          classOf: "",
          gender: "",
        });
      } catch (error) {
        console.error("Gagal ambil profil:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();

    // Otomatis refresh jika session berubah (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loadingProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside provider");
  return context;
};
