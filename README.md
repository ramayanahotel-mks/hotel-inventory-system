# 🏨 Hotel Inventory System

Sistem manajemen inventaris hotel yang lengkap dan mudah digunakan.

## ✨ Fitur Utama

- 📊 **Dashboard Analytics** - Overview lengkap inventaris
- 📦 **Manajemen Item** - Tambah, edit, hapus item
- 🏷️ **Kategori & Lokasi** - Organisasi yang rapi
- 📈 **Laporan Lengkap** - Export data ke CSV
- 👥 **Multi-User Role** - Admin, Manager, Staff
- 🔄 **Real-time Updates** - Data selalu terkini
- 📱 **Responsive Design** - Akses dari device apapun

## 🚀 Setup Otomatis (Recommended)

### 1. Persiapan
- Akun [Supabase](https://supabase.com) gratis
- Buat project baru di Supabase
- Catat URL dan API key dari Settings → API

### 2. Instalasi
\`\`\`bash
# Clone atau download project
git clone <repository-url>
cd hotel-inventory-system

# Install dependencies
npm install

# Jalankan aplikasi
npm run dev
\`\`\`

### 3. Setup Wizard
1. Buka `http://localhost:3000/setup`
2. Masukkan kredensial Supabase
3. Klik "Mulai Setup Otomatis"
4. Tunggu hingga selesai (5-10 menit)
5. Aplikasi siap digunakan!

## 🔧 Setup Manual

Jika ingin setup manual, ikuti langkah berikut:

### 1. Environment Variables
Buat file `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 2. Database Setup
Jalankan SQL script di Supabase SQL Editor:
\`\`\`sql
-- Lihat file scripts/supabase-schema.sql
\`\`\`

### 3. Deploy
\`\`\`bash
# Build aplikasi
npm run build

# Deploy ke Vercel
npm i -g vercel
vercel --prod
\`\`\`

## 👥 Default Users

Setelah setup, gunakan akun berikut:

| Role | Email | Password | Akses |
|------|-------|----------|-------|
| Admin | admin@hotel.com | admin123 | Full access |
| Manager | manager@hotel.com | manager123 | Limited admin |
| Staff | staff@hotel.com | staff123 | View & basic edit |

## 📱 Penggunaan

### Dashboard
- Overview total item, kategori, lokasi
- Grafik kondisi item
- Item dengan stok rendah
- Aktivitas terbaru

### Manajemen Item
- Tambah item baru dengan form lengkap
- Edit item existing
- Hapus item (dengan konfirmasi)
- Filter dan pencarian
- Export ke CSV

### Kategori & Lokasi
- Kelola kategori item
- Atur lokasi penyimpanan
- Organisasi yang rapi

### Laporan
- Generate laporan berdasarkan tanggal
- Export data ke CSV
- Filter berdasarkan kategori/lokasi

## 🛠️ Teknologi

- **Frontend**: Next.js 15, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## 📞 Support

Jika mengalami masalah:

1. **Setup Wizard Error**: Coba refresh dan ulangi
2. **Database Connection**: Periksa URL dan API key Supabase
3. **Deployment Issues**: Pastikan environment variables sudah benar
4. **General Issues**: Buka issue di repository

## 🔄 Updates

Sistem ini akan terus diupdate dengan fitur baru:
- [ ] Notifikasi real-time
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Barcode scanning
- [ ] Multi-language support

## 📄 License

MIT License - bebas digunakan untuk keperluan komersial maupun personal.

---

**Dibuat dengan ❤️ untuk kemudahan manajemen inventaris hotel Anda**
