-- Jalankan di Supabase SQL Editor agar status pesanan update otomatis (realtime)
-- Dashboard → Database → Replication → pastikan tabel `orders` aktif

alter publication supabase_realtime add table orders;
