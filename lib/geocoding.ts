import { STORE_LOCATION } from "./delivery";

export type AddressSearchResult = {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

/** Cari alamat/jalan di Indonesia (OpenStreetMap Nominatim). */
export async function searchAddress(
  query: string,
): Promise<AddressSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const { latitude, longitude } = STORE_LOCATION;
  const delta = 0.45;

  const params = new URLSearchParams({
    format: "json",
    q: trimmed,
    limit: "8",
    countrycodes: "id",
    addressdetails: "1",
    viewbox: [
      longitude - delta,
      latitude + delta,
      longitude + delta,
      latitude - delta,
    ].join(","),
  });

  const response = await fetch(`${NOMINATIM_BASE}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TokoJuaraKelas/1.0 (delivery-address-search)",
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mencari alamat. Coba lagi.");
  }

  const data = (await response.json()) as {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
  }[];

  return data.map((item) => ({
    id: String(item.place_id),
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));
}
