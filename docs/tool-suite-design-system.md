# Ekstraksi design system Portiter untuk web tools

Sumber: gaya asli `Portiter/src/index.css` dan komponen portofolio, serta halaman `Portools/src/pages/TokenCounter.jsx` yang sudah dipindahkan. Dokumen ini adalah panduan untuk aplikasi tools dengan identitas visual serupa.

## 1. Karakter visual

**Midnight Indigo × Vanilla Cream**: latar navy gelap yang hangat, teks krem, aksen periwinkle, emas redup, dan teal. Kesan keseluruhan modern, tenang, teknis, dan ramah. Mode terang membalik dasar menjadi krem, dengan aksen yang lebih pekat. Permukaan memakai beberapa tingkat elevasi, border tipis, radius besar, glow lembut, dan gradien biru-ke-teal secara selektif.

Prinsip pemakaian: satu tugas utama per halaman; warna aksen menunjukkan prioritas atau kategori; kartu dan pill membantu pemindaian cepat; dekorasi tidak mengganggu area input dan hasil.

## 2. Palet warna

Nilai berikut berasal langsung dari variabel CSS. `accent-purple` pada kode sebenarnya berwarna **emas**; di produk baru sebaiknya dinamai `accent-gold`.

| Peran | Dark | Light | Penggunaan |
| --- | --- | --- | --- |
| `bg-primary` | `#212842` | `#F0E7D5` | Kanvas halaman |
| `bg-card` | `#1B2238` | `#F8F2E8` | Kartu, editor, panel |
| `bg-elevated` | `#2A3350` | `#E6DBC8` | Toolbar, kontrol, panel bersarang |
| `bg-hover` | `#354060` | `#DDD0BA` | Hover dan navigasi aktif |
| `border-color` | `#2A3350` | `#D8CDB8` | Garis pemisah/kartu |
| `border-hover` | `#3E4D6E` | `#C5B89E` | Interaksi hover |
| `text-primary` | `#F0E7D5` | `#212842` | Judul dan angka utama |
| `text-secondary` | `#B8B0A0` | `#3D4A60` | Isi dan deskripsi |
| `text-muted` | `#8B93A8` | `#6B6459` | Label dan metadata |
| `accent-blue` | `#93A8D4` | `#4A5E8A` | Aksi utama, link, pilihan aktif |
| `accent-gold` | `#C4A35A` | `#9A7E30` | Kategori kedua, catatan/fitur |
| `accent-green` | `#65A090` | `#3D6B5E` | Sukses, privasi, status positif |

Warna turunan: latar aksen transparan sekitar 8–12%; header `rgba(bg-primary, .85)` dengan blur 20px; menu mobile sekitar 95% opasitas; shadow hover memakai aksen sekitar 15% opasitas. Gradien identitas: `linear-gradient(135deg, var(--accent-blue), var(--accent-green))`. Kartu kategori memakai garis aksen 3px di tepi atas.

Untuk aplikasi baru, jadikan biru warna interaksi utama, teal untuk keberhasilan/privasi, emas untuk kategori atau penjelasan. Hindari memakai emas sebagai satu-satunya penanda status peringatan. Pastikan kombinasi teks kecil dan latar diuji kontrasnya saat implementasi.

## 3. Tipografi

- Font antarmuka: **Inter** lokal lewat `@fontsource/inter`; bobot tersedia 400, 500, 600, 700, 800. Fallback: system sans-serif.
- Font area teks/code di Token Counter: `JetBrains Mono`, `Fira Code`, `SF Mono`, Menlo, monospace. Font monospace tersebut belum diimpor; sistem akan memilih yang tersedia.
- Teks badan: `1rem`/16px dengan `line-height: 1.6`; deskripsi panjang sekitar `1.7–1.8`.
- Hero portofolio: `clamp(2.5rem, 6vw, 4.2rem)`, bobot 800, tracking `-2px`, line-height `1.1`.
- Judul halaman tool: `2.5rem`/40px desktop, `1.8rem`/28.8px mobile, bobot 800, tracking `-1px`.
- Judul kartu: sekitar `1.2rem`/19.2px, bobot 700. Judul seksi: sekitar `1.4–2rem`, bobot 700–800.
- Isi kartu dan tombol: `0.82–0.95rem`, bobot 500–600. Label statistik: sekitar `0.78rem`, uppercase, tracking `0.5px`; angka: `1.5rem`, bobot 800.

Pertahankan hirarki ringkas pada halaman tools: nama alat sebagai H1, satu kalimat manfaat, label input yang jelas, hasil numerik menonjol, bantuan sekunder. Gunakan monospace hanya pada editor atau hasil berupa kode/Markdown.

## 4. Layout, bentuk, dan komponen

| Elemen | Pola pada proyek | Adaptasi untuk web tools |
| --- | --- | --- |
| Container | Maksimum `1200px`, padding horizontal `24px` | Shell semua halaman dan dashboard |
| Header | Fixed, blur 20px, border bawah; logo kiri, nav pill tengah, tema/bahasa kanan | Brand produk, daftar tools, tema, bahasa; nav ringkas di tablet/mobile |
| Hero | Rata tengah, badge pill, H1 besar, deskripsi pendek, CTA | Halaman katalog tools; pada halaman editor gunakan hero lebih pendek |
| Kartu | `bg-card`, border 1px, radius `28px`, padding 28px, garis aksen atas, hover naik 2–4px | Kartu pilihan alat dan fitur |
| Radius | 8 / 12 / 20 / 28px | 8 input kecil; 12 kontrol; 20 panel; 28 kartu utama |
| Tombol | Utama gradien biru–teal; sekunder transparan + border; bentuk pill | Satu CTA utama per konteks, aksi tambahan sebagai ghost |
| Pill/badge | Radius penuh; latar aksen tipis; teks pendek | Kategori, status, tipe file, estimasi |
| Editor | Kartu radius 28px; toolbar `bg-elevated`; area input luas; footer privasi | Pola inti semua tools berbasis teks/dokumen |
| Statistik | Grid 4 kartu, angka besar, satu kartu disorot | Ringkasan output yang langsung berubah |
| Ikon | `react-icons`, terutama Feather Icons | Ikon sederhana, konsisten, selalu ditemani label untuk aksi penting |

Ukuran jarak yang berulang: 8, 12, 16, 20, 24, 28, 32, 36, 48, 60, dan 80px. Transisi dasar `0.2s`, `0.3s`, `0.5s ease`. Gerak masuk memakai fade + perpindahan vertikal 16–30px; interaksi hover cukup naik 2–4px. Kode sudah memiliki aturan `prefers-reduced-motion`.

Breakpoint yang tampak di CSS: 1023px mengubah grid 3/4 kolom menjadi 2; header ringkas di bawah 900px; 768px menumpuk banyak panel menjadi 1 kolom; 480px membuat aksi dan statistik selebar layar. Target sentuh minimum yang baik untuk versi tools: sekitar 44–48px.

## 5. Pola UI/UX yang layak dibawa

1. **Navigasi jelas:** header tetap terlihat, breadcrumb pada halaman tool, status halaman aktif, menu mobile.
2. **Hasil langsung:** halaman Token Counter memperbarui angka token, kata, karakter, dan baris saat teks berubah. Jadikan ini pola default untuk utilitas teks.
3. **Input adalah pusat halaman:** judul pendek, hasil penting dekat input, toolbar untuk opsi, area tulis luas, tindakan salin/tempel/contoh/hapus.
4. **Kepercayaan:** banner privasi di bawah editor dan label ketika hasil hanya estimasi. Untuk file converter, jelaskan secara akurat apakah pemrosesan terjadi di browser atau server.
5. **Status tindakan:** tombol copy berubah menjadi konfirmasi singkat; tombol tidak relevan dinonaktifkan saat input kosong; focus terlihat.
6. **Dukungan dua tema:** pilihan mengikuti preferensi sistem pada kunjungan pertama dan tersimpan di `localStorage`. Produk baru dapat membawa perilaku ini.
7. **Dukungan bahasa:** proyek menyediakan EN/ID melalui context; pada produk baru, simpan pilihan bahasa bila ingin konsisten antar kunjungan.

## 6. Pemetaan ke produk baru

| Halaman/alat | Struktur yang disarankan | Hasil utama |
| --- | --- | --- |
| Beranda tools | Hero ringkas → pencarian/kategori pill → grid kartu alat → bantuan singkat | Pengguna menemukan alat dalam 1–2 klik |
| Token counter | Judul + badge → model/opsi → editor → kartu statistik + indikator batas konteks | Token, kata, karakter, konteks; beri label estimasi per model |
| Word counter | Editor → statistik langsung → rincian tambahan | Kata, karakter, paragraf, kalimat, estimasi waktu baca |
| Markdown to PDF | Editor Markdown dan preview responsif → opsi kertas/margin → tombol ekspor → status unduh | PDF yang sesuai preview; tunjukkan progres/error |

Struktur rute pada subdomain tools: `/` untuk katalog, `/token-counter`, `/word-counter`, `/markdown-to-pdf`. Di desktop, editor Markdown/PDF cocok sebagai dua panel; di mobile jadikan tab **Edit / Preview**. Pada alat hitung, statistik bisa tampil di atas editor agar langsung terlihat, seperti halaman Token Counter yang sudah ada. Konten edukatif/FAQ ditempatkan setelah area kerja.

## 7. Hal yang jangan terbawa dari konteks portofolio

- Ganti avatar, nama pribadi, statistik karier, CV, daftar proyek, dan CTA kontak dengan identitas produk dan katalog alat.
- CTA halaman tool sebaiknya menyelesaikan pekerjaan pengguna: **Salin hasil**, **Unduh PDF**, atau **Buka alat lain**.
- Hindari hero setinggi halaman pada alat kerja. Tampilkan input dan hasil utama sedini mungkin, terutama pada laptop dan mobile.
- Gunakan nama token warna yang semantik pada implementasi baru; `accent-purple` perlu diganti menjadi `accent-gold` agar mudah dirawat.
- Pisahkan CSS per komponen atau per halaman saat membangun produk baru; stylesheet proyek saat ini memusatkan seluruh gaya dalam satu file yang besar.

## 8. Titik awal implementasi

Variabel `:root` dan `[data-theme="light"]` kini ada di `Portools/src/index.css`. Lanjutkan komponen `ToolCard`, `ToolPageHeader`, `EditorPanel`, `StatCard`, `ActionButton`, dan `PrivacyNotice` untuk alat berikutnya. Jadikan halaman `Portools/src/pages/TokenCounter.jsx` acuan alur interaksi, lalu sesuaikan label, output, dan opsi untuk masing-masing tool.

Kriteria desain awal: mode gelap/terang terbaca, seluruh aksi dapat dipakai lewat keyboard, menu dan editor utuh pada 390px/768px/desktop, ada state kosong/error/sukses, dan klaim akurasi/privasi sesuai implementasi sebenarnya.
