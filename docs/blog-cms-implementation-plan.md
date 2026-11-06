# Rencana Implementasi Blog dan CMS Portiter

## Ringkasan

Portiter memiliki blog publik berbahasa Indonesia dan Inggris serta dashboard admin satu pemilik. Supabase menyediakan Postgres, Auth, dan Storage; halaman publik tetap dibangun sebagai HTML statis di Vercel. Publish, perubahan artikel yang sudah tayang, pengarsipan, dan jadwal terbit masuk antrean deployment otomatis. Perubahan biasanya terlihat setelah build Vercel selesai dalam beberapa menit.

## Arsitektur dan Perilaku

- Halaman blog bahasa Inggris memakai `/blog` dan `/blog/:slug`; bahasa Indonesia memakai `/id/blog` dan `/id/blog/:slug`. Terjemahan memiliki status publikasi sendiri dan navigasi bahasa hanya muncul jika pasangan terjemahannya sudah tayang.
- CMS menyediakan dashboard, pencarian, filter status/bahasa, pagination, editor visual, preview privat, cover dan media library, kategori, tag, SEO, riwayat revisi, autosave, ekspor, serta pemulihan backup.
- Status terjemahan: Draft, Scheduled, dan Published. Archive menyembunyikan semua versi bahasa dan bisa dipulihkan ke status sebelumnya. Trash adalah penghapusan lunak; pemulihan mengubah semua versi menjadi Draft. Hapus permanen hanya tersedia dari Trash dan memerlukan konfirmasi.
- Slug dapat diedit sebelum terbit pertama kali dan dikunci setelahnya. Jadwal ditampilkan sebagai Asia/Jakarta dan disimpan dalam UTC.
- Tabel utama: `portiter_blog_posts`, `portiter_blog_translations`, `portiter_blog_categories`, `portiter_blog_tags`, relasi artikel-taksonomi, `portiter_blog_media_assets`, `portiter_blog_post_revisions`, dan `portiter_blog_deploy_jobs`.
- Pengunjung anonim hanya membaca terjemahan yang sudah tayang, belum diarsipkan, dan tidak berada di Trash. Tindakan admin memerlukan akun owner yang UUID-nya masuk allowlist serta RLS; signup publik dimatikan. MFA ditunda selama tahap coba.
- Generator build menghasilkan HTML awal, canonical, hreflang, metadata Open Graph/Twitter, structured data `BlogPosting`, sitemap, dan RSS. Preview admin diberi header `noindex`; slug publik yang tidak ada tidak ditulis sebagai fallback SPA.
- Perubahan publik menulis antrean deployment. Cron Supabase berjalan per menit, menerbitkan jadwal jatuh tempo, lalu menggabungkan antrean menjadi satu pemicu Vercel Deploy Hook. Kunci service role dan Deploy Hook hanya disimpan sebagai secret.
- Renderer konten memakai allowlist node/mark, escaping teks, URL aman, dan embed YouTube privacy-enhanced. GA4 hanya memakai perilaku pageview yang sudah ada dan tidak menerima isi tulisan atau teks pencarian.

## Tahapan

1. Siapkan proyek Supabase dev/prod, migrasi skema dan RLS, bucket publik dengan operasi tulis admin, akun owner, variabel environment, serta panduan setup.
2. Tambahkan route blog, renderer, kartu artikel, pencarian/filter/pagination, artikel terkait, switch bahasa, metadata, sitemap, RSS, dan halaman statis per terjemahan.
3. Buat admin login, dashboard, daftar artikel, editor Tiptap, autosave, revisi, preview privat, upload/pemakaian ulang media, kategori/tag, cover, SEO, dan jadwal.
4. Tambahkan lifecycle archive/Trash/restore/purge, aksi massal, backup JSON, pemulihan idempotent, antrean build, edge publisher, dan jadwal Cron.
5. Verifikasi lokal dan di Vercel Preview dengan Supabase terpisah, siapkan secret dan user produksi, deploy migrasi, lalu cek build dan siklus artikel sebelum mengumumkan blog.

## Pengujian dan Kriteria Penerimaan

- Pastikan anonim tidak dapat membaca Draft, Scheduled, artikel archived/Trash, preview, atau menulis database/Storage. Akun yang UUID-nya tidak terdaftar sebagai admin ditolak untuk operasi tulis.
- Uji simpan draft, autosave, switch terjemahan, preview, cover/media, revisi dan restore, publish, jadwal Asia/Jakarta, archive/restore, Trash/restore ke Draft, bulk action, serta hard delete dengan konfirmasi.
- Uji keamanan renderer untuk HTML/script, skema URL berbahaya, gambar, tautan, blok kode, dan allowlist embed.
- Uji antrean dan idempotensi deployment, pemulihan job gagal, kegagalan pemicu Deploy Hook, publish terjadwal, serta build saat Supabase tidak tersedia.
- Periksa raw HTML artikel untuk konten, metadata, canonical, hreflang, `BlogPosting`, serta pastikan sitemap/RSS hanya berisi terjemahan publik. Unknown slug menghasilkan HTTP 404 di production.
- Uji ekspor-impor JSON. Salinan file gambar di Supabase Storage perlu dicadangkan dan dipulihkan terpisah dari backup database/JSON.

## Asumsi dan Batas V1

- Admin V1 adalah satu pemilik dan memakai antarmuka pengelolaan berbahasa Indonesia.
- Kategori dan tag memiliki label serta slug EN/ID; satu artikel dapat memakai kategori/tag bersama untuk kedua bahasanya.
- Komentar, akun pembaca, newsletter, dan multi-author tidak termasuk V1.
- Paket Supabase/Vercel dipilih pemilik; batas paket diperiksa sebelum deployment.
