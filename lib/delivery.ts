export const STORE_LOCATION = {
  latitude: -6.2144749,
  longitude: 106.6483386,
};

export const FREE_DELIVERY_KM = 5;
export const MAX_DELIVERY_KM = 20;
export const DELIVERY_RATE_PER_KM = 2500;

export const getShippingFee = (distanceKm: number | null) => {
  if (distanceKm === null) return 0;
  if (distanceKm <= FREE_DELIVERY_KM) return 0;
  return Math.ceil(distanceKm) * DELIVERY_RATE_PER_KM;
};

export const isDeliveryTooFar = (distanceKm: number | null) =>
  distanceKm !== null && distanceKm > MAX_DELIVERY_KM;

export const formatOrderStatus = (status: string, fulfillmentType?: string) => {
  switch (status) {
    case "pending":
      return "Menunggu verifikasi";
    case "accepted":
      return fulfillmentType === "delivery" ? "Sedang dikirim" : "Siap diambil";
    case "dikirim":
    case "delivering":
      return "Sedang dikirim";
    case "selesai":
      return "Selesai";
    case "rejected":
    case "batal":
      return "Dibatalkan";
    default:
      return status;
  }
};
