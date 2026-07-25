# 🚀 Portiter — Portfolio Website

**Portiter** adalah website portfolio modern interaktif yang dibangun menggunakan React, Vite, Framer Motion, dan React Router, lengkap dengan dukungan dwibahasa (English & Indonesian).

---

## 🛠️ Persyaratan System (Prerequisites)

Pastikan Anda telah menginstal:

* [Node.js](https://nodejs.org/) (versi **18.x** atau yang lebih baru direkomendasikan)
* [npm](https://www.npmjs.com/) (terinstal otomatis bersama Node.js)

---

## ⚡ Cara Menjalankan Project di Lokal

Ikuti langkah-langkah mudah berikut untuk menjalankan project di komputer Anda:

### 1. Install Dependencies

Buka terminal/command prompt di direktori project ini, lalu jalankan perintah berikut untuk menginstal semua library yang dibutuhkan:

```bash
npm install
```

### 2. Jalankan Mode Development

Jalankan server lokal untuk melihat website secara langsung dengan fitur Hot Module Replacement (HMR):

```bash
npm run dev
```

Setelah server berjalan, buka browser Anda dan akses alamat lokal yang tertera di terminal, biasanya:
👉 **`http://localhost:5173/`**

---

## 📦 Produksi & Deployment

### 1. Build untuk Produksi

Gunakan perintah ini untuk memaketkan kode menjadi file statis (`dist/`) yang dioptimalkan untuk performa tinggi:

```bash
npm run build
```

### 2. Preview Hasil Build

Untuk menguji hasil produksi di lokal sebelum di-deploy ke hosting (seperti Vercel atau Netlify):

```bash
npm run preview
```

---

## 📂 Struktur Folder Utama

* `src/assets/` — Gambar, logo, avatar, dan aset statis internal.
* `src/components/` — Komponen visual antarmuka (Header, Hero, Experience, dll).
* `src/context/` — Context untuk manajemen bahasa (LanguageContext).
* `src/data/` — Data konten proyek dan portfolio.
* `src/pages/` — Halaman utama (Home) dan halaman detail (ProjectDetail).
* `src/index.css` — Seluruh styling visual terpusat.
* `public/` — Aset publik seperti file CV (`AkhmadNizarZakaria_AIMLEngineer.pdf`) dan favicon.
