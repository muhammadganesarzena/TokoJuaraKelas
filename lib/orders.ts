import type { HistoryItem } from "../app/context/HistoryContext";

export function mapOrderRowToHistoryItem(item: Record<string, unknown>): HistoryItem {
  const fulfillmentType = (item.fulfillment_type as string) || "pickup";
  const statusRaw = item.status as string;

  return {
    id: item.id as string,
    refNumber: (item.ref_number as string) || (item.id as string),
    pickupCode: item.pickup_code as string | undefined,
    paymentMethod: (item.payment_method as string) || "qris",
    paymentStatus: item.payment_status as string | undefined,
    fulfillmentType,
    paymentTime: item.created_at
      ? new Date(item.created_at as string).toLocaleString("id-ID")
      : "-",
    totalPrice: (item.subtotal as number) ?? (item.total_price as number) ?? 0,
    adminFee: 0,
    shippingFee: (item.shipping_fee as number) || 0,
    name: (item.customer_name as string) || (item.name as string) || "-",
    email: (item.email as string) || "-",
    phone: (item.phone as string) || "-",
    address:
      fulfillmentType === "delivery"
        ? (item.address as string) || "-"
        : "Pick up di toko",
    city: (item.city as string) || "-",
    houseNote: (item.house_note as string) || undefined,
    deliveryDistanceKm: (item.delivery_distance_km as number) || undefined,
    deliveryLat: (item.delivery_lat as number) || undefined,
    deliveryLng: (item.delivery_lng as number) || undefined,
    products: (item.items as HistoryItem["products"]) || [],
    status:
      statusRaw === "selesai"
        ? "completed"
        : statusRaw === "accepted" && fulfillmentType !== "delivery"
          ? "ready_for_pickup"
          : statusRaw === "dikirim" || statusRaw === "delivering"
            ? "delivering"
            : statusRaw === "batal" || statusRaw === "rejected"
              ? "cancelled"
              : "processing",
  };
}
