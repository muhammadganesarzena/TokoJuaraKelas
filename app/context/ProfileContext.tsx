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
  refreshProfile: () => Promise<void>;
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

  const mapProfile = (data: any, email: string): ProfileType => ({
    name: data?.full_name || "",
    nim: data?.username || "",
    email: data?.email || email || "",
    image: null,
    major: "",
    dob: "",
    classOf: "",
    gender: "",
  });

  const fetchProfile = async () => {
    setLoadingProfile(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setProfile(defaultProfile);
        return;
      }

      const user = session.user;
      const userEmail = user.email || "";

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, phone, address, email")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(mapProfile(data, userEmail));
        return;
      }

      const fallbackName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        userEmail.split("@")[0] ||
        "User";

      const fallbackUsername =
        user.user_metadata?.username ||
        userEmail.split("@")[0] ||
        `user_${user.id.slice(0, 8)}`;

      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fallbackName,
            username: fallbackUsername,
            phone: null,
            address: null,
            email: userEmail,
          },
          { onConflict: "id" },
        )
        .select("id, full_name, username, phone, address, email")
        .single();

      if (insertError) throw insertError;

      setProfile(mapProfile(insertedProfile, userEmail));

      setProfile(mapProfile(insertedProfile, userEmail));

      setProfile(mapProfile(insertedProfile, userEmail));
    } catch (error) {
      console.error("Gagal ambil profil:", error);
      setProfile(defaultProfile);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setProfile(defaultProfile);
          setLoadingProfile(false);
          return;
        }

        fetchProfile();
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        loadingProfile,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside provider");
  return context;
};
