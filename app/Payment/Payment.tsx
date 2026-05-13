import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "./Payment.styles";

const formatRupiah = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  cardName?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
};

const Payment: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cartItems, totalPrice } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [sameAddress, setSameAddress] = useState(true);
  const [billingType, setBillingType] = useState<"personal" | "commercial">(
    "personal",
  );
  const [selectedMethod, setSelectedMethod] = useState<
    "mastercard" | "visa" | "amex" | "discover"
  >("visa");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refNumber] = useState(() =>
    String(Math.floor(Math.random() * 999999999)).padStart(12, "0"),
  );
  const [paymentTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  });

  const adminFee = 5000;

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (phone.trim().length < 8) e.phone = "Phone number is too short";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email.trim()))
      e.email = "Invalid email format";
    if (!address.trim()) e.address = "Address is required";
    if (!city.trim()) e.city = "City is required";
    if (!cardName.trim()) e.cardName = "Card holder name is required";
    if (!cardNumber.trim()) e.cardNumber = "Card number is required";
    else if (cardNumber.replace(/\s/g, "").length < 16)
      e.cardNumber = "Card number must be 16 digits";
    if (!expMonth.trim()) e.expMonth = "Required";
    else {
      const m = parseInt(expMonth, 10);
      if (m < 1 || m > 12) e.expMonth = "Invalid month";
    }
    if (!expYear.trim()) e.expYear = "Required";
    else if (expYear.trim().length < 4) e.expYear = "Use 4 digits";
    if (!cvv.trim()) e.cvv = "Required";
    else if (cvv.trim().length < 3) e.cvv = "Min 3 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    field: keyof FieldErrors,
    value: string,
    setter: (v: string) => void,
  ) => {
    setter(value);
    if (attempted && errors[field])
      setErrors((prev) => {
        const u = { ...prev };
        delete u[field];
        return u;
      });
  };

  const handlePayment = () => {
    setAttempted(true);
    if (validate()) setShowSuccess(true);
  };

  const handleContinue = () => {
    setShowSuccess(false);
    router.push({
      pathname: "/Payment/OrderConfirmation",
      params: {
        refNumber,
        paymentTime,
        totalPrice: String(totalPrice),
        adminFee: String(adminFee),
        name: name || "Guest",
        email: email || "-",
        phone: phone || "-",
        address: address || "-",
        city: city || "-",
      },
    });
  };

  const paymentMethods = [
    { id: "mastercard", label: "MC" },
    { id: "visa", label: "VISA" },
    { id: "amex", label: "AMEX" },
    { id: "discover", label: "DISC" },
  ] as const;

  const inputStyle = (field: keyof FieldErrors) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>Shipping</Text>
        <View style={styles.shippingCard}>
          <View style={styles.shippingInfo}>
            <Text style={styles.shippingName}>{name || "Your Name"}</Text>
            <Text style={styles.shippingDetail}>
              {email || "email@example.com"}
            </Text>
            <Text style={styles.shippingDetail}>{phone || "+62 xxx"}</Text>
            <Text style={styles.shippingDetail}>
              {address || "Your address"}
              {city ? `, ${city}` : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#E8622A" />
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkbox, sameAddress && styles.checkboxChecked]}
            onPress={() => setSameAddress(!sameAddress)}
          >
            {sameAddress && (
              <Ionicons name="checkmark" size={14} color="#FFF" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            Billing and delivery addresses are same.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={styles.sectionTitle}>Recipient Information</Text>
        </View>

        <Text style={styles.inputLabel}>Name and Surname*</Text>
        <TextInput
          style={inputStyle("name")}
          placeholder="Enter full name"
          placeholderTextColor={colors.textPlaceholder}
          value={name}
          onChangeText={(v) => handleChange("name", v, setName)}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.inputLabel}>Phone Number*</Text>
        <TextInput
          style={inputStyle("phone")}
          placeholder="+62 812 3456 7890"
          placeholderTextColor={colors.textPlaceholder}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(v) => handleChange("phone", v, setPhone)}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.inputLabel}>E-mail Address*</Text>
        <TextInput
          style={inputStyle("email")}
          placeholder="email@example.com"
          placeholderTextColor={colors.textPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => handleChange("email", v, setEmail)}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Section 2 */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
        </View>

        <Text style={styles.inputLabel}>Address*</Text>
        <TextInput
          style={inputStyle("address")}
          placeholder="Street address"
          placeholderTextColor={colors.textPlaceholder}
          value={address}
          onChangeText={(v) => handleChange("address", v, setAddress)}
        />
        {errors.address && (
          <Text style={styles.errorText}>{errors.address}</Text>
        )}

        <Text style={styles.inputLabel}>City*</Text>
        <TextInput
          style={inputStyle("city")}
          placeholder="City"
          placeholderTextColor={colors.textPlaceholder}
          value={city}
          onChangeText={(v) => handleChange("city", v, setCity)}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

        {/* Section 3 */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionTitle}>Billing Information</Text>
        </View>
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkbox, sameAddress && styles.checkboxChecked]}
            onPress={() => setSameAddress(!sameAddress)}
          >
            {sameAddress && (
              <Ionicons name="checkmark" size={14} color="#FFF" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Same as delivery address.</Text>
        </View>
        <Text style={styles.inputLabel}>Billing Type*</Text>
        <View style={styles.radioRow}>
          {(["personal", "commercial"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={styles.radioItem}
              onPress={() => setBillingType(t)}
            >
              <View
                style={[
                  styles.radio,
                  billingType === t && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioLabel}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Payment</Text>
        <View style={styles.cardSection}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={styles.cardHeaderText}>Add Credit / Debit Card</Text>
          </View>
          <View style={styles.methodRow}>
            <Text style={styles.methodTitle}>Payment Method</Text>
            <View style={styles.methodIcons}>
              {paymentMethods.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.methodChip,
                    selectedMethod === m.id && styles.methodChipSelected,
                  ]}
                  onPress={() => setSelectedMethod(m.id)}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      selectedMethod === m.id && styles.methodChipTextSelected,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.inputLabel}>Name on card*</Text>
          <TextInput
            style={inputStyle("cardName")}
            placeholder="Card holder name"
            placeholderTextColor={colors.textPlaceholder}
            value={cardName}
            onChangeText={(v) => handleChange("cardName", v, setCardName)}
          />
          {errors.cardName && (
            <Text style={styles.errorText}>{errors.cardName}</Text>
          )}

          <Text style={styles.inputLabel}>Card number*</Text>
          <TextInput
            style={inputStyle("cardNumber")}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={(v) => handleChange("cardNumber", v, setCardNumber)}
          />
          {errors.cardNumber && (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          )}

          <View style={styles.cardRow}>
            <View style={styles.cardRowHalf}>
              <Text style={styles.inputLabel}>Month*</Text>
              <TextInput
                style={inputStyle("expMonth")}
                placeholder="MM"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                maxLength={2}
                value={expMonth}
                onChangeText={(v) => handleChange("expMonth", v, setExpMonth)}
              />
              {errors.expMonth && (
                <Text style={styles.errorText}>{errors.expMonth}</Text>
              )}
            </View>
            <View style={styles.cardRowHalf}>
              <Text style={styles.inputLabel}>Year*</Text>
              <TextInput
                style={inputStyle("expYear")}
                placeholder="YYYY"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                maxLength={4}
                value={expYear}
                onChangeText={(v) => handleChange("expYear", v, setExpYear)}
              />
              {errors.expYear && (
                <Text style={styles.errorText}>{errors.expYear}</Text>
              )}
            </View>
          </View>

          <Text style={styles.inputLabel}>Security Code*</Text>
          <TextInput
            style={[...inputStyle("cvv"), { width: 120 }]}
            placeholder="CVV"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            value={cvv}
            onChangeText={(v) => handleChange("cvv", v, setCvv)}
          />
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>

        {/* Order Items */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
          Order Items
        </Text>
        {cartItems.map(({ product, quantity }) => (
          <View key={product.id} style={styles.orderItem}>
            <Image
              source={product.image}
              style={styles.orderImage}
              resizeMode="contain"
            />
            <View style={styles.orderInfo}>
              <Text style={styles.orderName}>{product.name}</Text>
              <Text style={styles.orderQty}>Qty: {quantity}</Text>
            </View>
            <Text style={styles.orderPrice}>
              {formatRupiah(product.price * quantity)}
            </Text>
          </View>
        ))}

        {/* Summary */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
          Order Summary
        </Text>
        <View style={styles.summaryCard}>
          {[
            ["Subtotal", totalPrice],
            ["Admin Fee", adminFee],
            ["Shipping", 0],
          ].map(([label, val]) => (
            <View key={label as string} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(val as number)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatRupiah(totalPrice + adminFee)}
            </Text>
          </View>
        </View>

        {attempted && Object.keys(errors).length > 0 && (
          <View style={styles.errorSummary}>
            <Ionicons name="alert-circle" size={18} color="#FF3B30" />
            <Text style={styles.errorSummaryText}>
              Please fill in all required fields above.
            </Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payBtnText}>Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={56} color="#34C759" />
            </View>
            <Text style={styles.modalTitle}>Payment Success!</Text>
            <Text style={styles.modalAmount}>
              {formatRupiah(totalPrice + adminFee)}
            </Text>
            <View style={styles.modalDivider} />
            {[
              ["Ref Number", refNumber],
              ["Payment Time", paymentTime],
              ["Payment Method", "Credit Card"],
              ["Sender Name", cardName || name],
            ].map(([label, val]) => (
              <View key={label} style={styles.modalRow}>
                <Text style={styles.modalLabel}>{label}</Text>
                <Text style={styles.modalValue}>{val}</Text>
              </View>
            ))}
            <View style={styles.modalDivider} />
            {[
              ["Amount", totalPrice],
              ["Admin Fee", adminFee],
            ].map(([label, val]) => (
              <View key={label as string} style={styles.modalRow}>
                <Text style={styles.modalLabel}>{label}</Text>
                <Text style={styles.modalValue}>
                  {formatRupiah(val as number)}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Payment;
