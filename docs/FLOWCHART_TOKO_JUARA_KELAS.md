# Flowchart — Toko Juara Kelas

Dokumen ini mendeskripsikan alur aplikasi **Toko Juara Kelas** (React Native / Expo) untuk laporan UAS IF670.  
Diagram menggunakan sintaks **Mermaid** — render di [mermaid.live](https://mermaid.live) lalu export PNG/SVG untuk Word/PDF.

---

## 1. Alur aplikasi keseluruhan (high-level)

```mermaid
flowchart TD
    START([Buka Aplikasi]) --> INDEX[index.tsx]
    INDEX --> SPLASH[Splash Screen]
    SPLASH --> ONBOARD[Onboarding 3 slide]
    ONBOARD -->|Skip / Mulai| LOGIN[Login Screen]

    LOGIN --> CHECK{Email & password?}
    CHECK -->|Kredensial admin di tabel admins| ADMIN_LOGIN[Sesi Admin AsyncStorage]
    CHECK -->|User Supabase Auth| USER_HOME[Beranda Homepage]
    CHECK -->|Google OAuth| GOOGLE{Profil ada?}
    GOOGLE -->|Tidak| REG_GOOGLE[RegisterScreen mode Google]
    GOOGLE -->|Ya| USER_HOME
    REG_GOOGLE --> USER_HOME

    ADMIN_LOGIN --> ADMIN_OVER[Admin Overview]
    USER_HOME --> NAV[Bottom Nav: Beranda / Riwayat / Wishlist / Chat / Profil]

    LOGIN -->|Belum punya akun| REGISTER[RegisterScreen + OTP email]
    REGISTER --> USER_HOME
    LOGIN -->|Lupa password| RESET[Reset Password]
    RESET --> LOGIN

    NAV --> SHOP[Belanja & Checkout]
    NAV --> HIST[Riwayat Pesanan]
    NAV --> CHAT_USER[Chat User]
    NAV --> PROF[Profil / Edit Profil]
```

---

## 2. Alur autentikasi & sesi

```mermaid
flowchart TD
    subgraph User["Pengguna (Supabase Auth)"]
        L1[Login email + password] --> AUTH{signInWithPassword}
        AUTH -->|Sukses| CLEAR1[clearAdminSession]
        CLEAR1 --> HOME[Beranda]
        AUTH -->|Gagal| ERR1[Alert Login Gagal]

        L2[Login Google] --> OAUTH[signInWithOAuth + WebBrowser]
        OAUTH --> SESS{Session & profil profiles?}
        SESS -->|Profil kosong| REG[RegisterScreen]
        SESS -->|Profil ada| HOME

        R1[Register] --> OTP[Kirim OTP email]
        OTP --> VERIFY[Verifikasi OTP]
        VERIFY --> INSERT[Insert profiles + Auth user]
        INSERT --> HOME

        R2[Lupa password] --> EMAIL_RESET[Supabase resetPasswordForEmail]
        EMAIL_RESET --> LINK[User buka link email]
        LINK --> NEW_PW[Set password baru]
        NEW_PW --> L1
    end

    subgraph Admin["Admin (tabel admins + AsyncStorage)"]
        L3[Login dengan email admin] --> ADM_CHK{Match admins.email & password?}
        ADM_CHK -->|Ya| SIGNOUT[supabase.auth.signOut]
        SIGNOUT --> SAVE[saveAdminSession]
        SAVE --> OVERVIEW[/admin/overview]
        ADM_CHK -->|Tidak| AUTH

        GUARD[Admin _layout guard] -->|Tanpa sesi| LOGIN_ADM[/admin/LoginAdmin]
        GUARD -->|Ada sesi| PANEL[Panel Admin]
        LOGOUT[Keluar dari sidebar] --> CLEAR2[clearAdminSession]
        CLEAR2 --> LOGIN_ADM
    end

    subgraph DeepLink["Deep link /login"]
        DL[/login route] --> DL_CHK{Sesi admin?}
        DL_CHK -->|Ya| OVERVIEW
        DL_CHK -->|Supabase session user?| HOME
        DL_CHK -->|Tidak| L1
    end
```

---

## 3. Alur belanja pengguna (customer journey)

```mermaid
flowchart TD
    HOME[Beranda Homepage] --> FILTER{Filter kategori / cari?}
    FILTER --> LIST[Daftar produk dari Supabase]
    LIST --> DETAIL[Product Detail]
    DETAIL --> LIKE{Toggle wishlist?}
    LIKE -->|Hati| WL_STATE[State lokal likedProducts]
    DETAIL --> CART_BTN{Tambah ke keranjang?}
    CART_BTN -->|Ya| CART_ADD[INSERT/UPDATE cart_items]
    DETAIL --> BUY[Beli sekarang]
    BUY --> CART_CLEAR[Kosongkan cart + 1 item]
    CART_CLEAR --> PAY

    HOME --> WL_TAB[Wishlist tab]
    WL_TAB --> WL_STATE

    HOME --> CART_ICON[Icon keranjang]
    CART_ICON --> CART[Cart Screen]
    CART --> QTY[Ubah qty / hapus item]
    QTY --> CART_DB[(cart_items Supabase)]
    CART --> PAY[Payment / Checkout]

    PAY --> FUL{Jenis pengiriman?}
    FUL -->|Pick up| FORM_P[Form data + upload bukti QRIS]
    FUL -->|Antar| MAP[Pilih lokasi di peta + cari alamat]
    MAP --> DIST{Jarak 5–20 km?}
    DIST -->|Terlalu jauh| ERR_MAP[Alert jarak tidak valid]
    DIST -->|Valid| ONGKIR[Hitung ongkir geolib]
    ONGKIR --> FORM_D[Form alamat + bukti QRIS]

    FORM_P --> VALID{Validasi form?}
    FORM_D --> VALID
    VALID -->|Tidak| ERR_FORM[Tampilkan error field]
    VALID -->|Ya| UPLOAD[Upload bukti ke Storage payment-proofs]
    UPLOAD --> INSERT_ORD[INSERT orders status pending]
    INSERT_ORD --> CLEAR_CART[clearCart]
    CLEAR_CART --> CONF[Order Confirmation]
    CONF --> HIST_NAV[User ke Riwayat / Homepage]
```

---

## 4. Siklus status pesanan

```mermaid
flowchart TD
  subgraph Customer["Aksi pelanggan"]
    C1[Checkout + bukti QRIS] --> PENDING[(status: pending)]
    C2[Riwayat → Detail order] --> VIEW[Lihat status & bukti]
    C3{Pesanan antar & status dikirim?}
    C3 -->|Ya| COMP_BTN[Konfirmasi Sudah Diterima]
    COMP_BTN --> SELESAI_C[UPDATE orders → selesai]
  end

  subgraph Admin["Aksi admin — Pesanan"]
    A1[Buka detail pesanan] --> PENDING
    A2{Verifikasi pembayaran?}
    A2 -->|Tolak| REJECTED[(status: rejected)]
    A2 -->|Terima| TYPE{fulfillment_type?}
    TYPE -->|delivery| DIKIRIM[(status: dikirim)]
    TYPE -->|pickup| ACCEPTED[(status: accepted + pickup_code)]
    ACCEPTED --> READY[Customer: Siap diambil]
    READY --> PICKUP_BTN[Admin: Konfirmasi Sudah Diambil]
    PICKUP_BTN --> SELESAI_A[(status: selesai)]
    DIKIRIM --> C3
    SELESAI_C --> DONE[Selesai / completed di UI]
    SELESAI_A --> DONE
  end

  PENDING --> A2
```

**Mapping status di UI pelanggan (HistoryContext):**

| Status DB | Tipe | Label UI |
|-----------|------|----------|
| `pending` | semua | Diproses |
| `accepted` | pickup | Siap diambil |
| `dikirim` | delivery | Sedang dikirim |
| `selesai` | semua | Selesai |
| `rejected` / `batal` | semua | Dibatalkan |

---

## 5. Navigasi utama pengguna (bottom navigation)

```mermaid
flowchart LR
    subgraph BottomNav["UserBottomNav"]
        H[Beranda<br/>/Homepage/Homepage]
        R[Riwayat<br/>/History/History]
        W[Wishlist<br/>/Wishlist/Wishlist]
        C[Chat<br/>/chat]
        P[Profil<br/>/Profile/Profile]
    end

    H -->|Tap produk| PD[ProductDetail]
    PD --> CART[Cart]
    CART --> PAY[Payment]

    R -->|Tap item| RD[HistoryDetail]
    RD -->|Antar + dikirim| COMPLETE[completeOrder → selesai]

    P --> EP[EditProfile<br/>simpan ke ProfileContext lokal]

    W --> PD
```

---

## 6. Alur panel admin

```mermaid
flowchart TD
    LOGIN_A[/admin/LoginAdmin] --> GUARD{Sesi admin valid?}
    GUARD -->|Tidak| LOGIN_A
    GUARD -->|Ya| OVER[Ringkasan /admin/overview]

    OVER --> SB[Admin Sidebar]
    SB --> PROD[Produk CRUD + upload gambar]
    SB --> BAN[Feed Banner CRUD]
    SB --> CAT[Kategori CRUD]
    SB --> NFC[Stok NFC]
    SB --> ORD[Pesanan verifikasi]
    SB --> SUP[Chat /admin/support]
    SB --> USR[Pengguna read-only profiles]
    SB --> THEME[Toggle dark mode]
    SB --> OUT[Logout → clearAdminSession]

    PROD --> DB1[(products + Storage product-images)]
    BAN --> DB2[(home_banners + Storage)]
    CAT --> DB3[(categories)]
    ORD --> DB4[(orders)]
    SUP --> DB5[(chat_messages + Realtime)]
    USR --> DB6[(profiles)]
```

---

## 7. Alur inventori NFC (admin)

```mermaid
flowchart TD
    NFC_PAGE[/admin/inventory-nfc] --> MODE{Mode?}
    MODE -->|Scan| SCAN[NFCScanner baca UID tag]
    MODE -->|Cari UID manual| SEARCH[Input UID]

    SCAN --> ENSURE{Tag ada di nfc_tags?}
    SEARCH --> ENSURE
    ENSURE -->|Tidak| INSERT_TAG[INSERT nfc_tags]
    ENSURE -->|Ya| LOAD[SELECT nfc_items by uid]
    INSERT_TAG --> LOAD

    LOAD --> LIST[Tampil daftar barang]
    LIST --> ADD[+ Tambah barang]
    LIST --> EDIT[Tap barang → edit]
    ADD --> MODAL[NFCItemModal]
    EDIT --> MODAL
    MODAL --> PHOTO[Pilih foto galeri optional]
    PHOTO --> SAVE_ITEM[INSERT/UPDATE nfc_items + Storage]
    SAVE_ITEM --> LIST

    LIST --> RENAME[Simpan nama tag]
    RENAME --> UPDATE_TAG[UPDATE nfc_tags.name]
```

---

## 8. Alur chat dukungan (realtime)

```mermaid
flowchart TD
    subgraph UserChat["Pelanggan /chat"]
        U1{Login Supabase?} -->|Tidak| U_LOGIN[Alert → Login]
        U1 -->|Ya| U2[Load chat_messages by user_id]
        U2 --> U3[Subscribe Realtime channel]
        U3 --> U4[Kirim pesan sender_role user]
        U4 --> DB[(chat_messages)]
    end

    subgraph AdminChat["Admin /admin/support"]
        A1{Sesi admin?} -->|Tidak| A_LOGIN[Redirect LoginAdmin]
        A1 -->|Ya| A2[List user yang pernah chat]
        A2 --> A3[Pilih user → load messages]
        A3 --> A4[Subscribe Realtime]
        A4 --> A5[Balas sender_role admin]
        A5 --> DB
    end

    DB --> U3
    DB --> A4
```

---

## 9. Diagram konteks sistem (data & layanan)

```mermaid
flowchart TB
    APP[Aplikasi Mobile<br/>Expo React Native]
    APP --> SB[(Supabase)]
    SB --> AUTH[Auth email / Google]
    SB --> PG[(PostgreSQL)]
    SB --> ST[Storage buckets]
    SB --> RT[Realtime]

    APP --> DEV1[Image Picker / Kamera]
    APP --> DEV2[Maps & Geolocation]
    APP --> DEV3[NFC Manager Android]
    APP --> DEV4[AsyncStorage sesi]
    APP --> OSM[OpenStreetMap Nominatim geocoding]

    PG --> T1[products categories orders profiles]
    PG --> T2[cart_items chat_messages home_banners]
    PG --> T3[nfc_tags nfc_items admins]
```

---

## Cara memasukkan ke laporan

1. Buka https://mermaid.live
2. Salin blok ` ```mermaid ` dari file ini
3. Export **PNG** atau **SVG**
4. Sisipkan di bab **Desain Model Aplikasi** dengan caption, misalnya: *Gambar 1. Alur autentikasi pengguna dan admin*

---

*Nama aplikasi: Toko Juara Kelas · Framework: React Native (Expo) · Backend: Supabase*
