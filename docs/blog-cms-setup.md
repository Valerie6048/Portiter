# Menyiapkan Blog CMS Portiter

## Supabase

1. Buat proyek Supabase terpisah untuk development dan production. Jangan memakai database production saat mencoba migrasi lokal.
2. Untuk proyek baru, jalankan kedua migrasi berurutan dengan Supabase CLI (`supabase db push`) atau SQL Editor: `202611030001_blog_cms.sql`, lalu `202611060001_portiter_blog_tables.sql`. Jika migrasi pertama sudah dijalankan manual, **jalankan hanya migrasi kedua** lewat SQL Editor. Jangan ulang migrasi pertama karena tabel lama sudah ada.
3. Buat user owner di Authentication. Untuk proyek hosted, matikan **Allow new users to sign up** di Authentication → Sign In / Providers → Email. `supabase/config.toml` juga menonaktifkan signup untuk Supabase lokal, tetapi tidak mengubah pengaturan Auth proyek hosted.
4. Tambahkan UUID owner ke allowlist. UUID berikut berasal dari akun yang sudah dibuat. Jika akun dev dan production berbeda, gunakan UUID masing-masing proyek:

   ```sql
   insert into public.portiter_blog_admins (user_id)
   values ('42e66edc-50d0-4742-92e7-78c3a625b193')
   on conflict (user_id) do nothing;
   ```

5. Untuk tahap coba, admin cukup login dengan email dan password. Akses tulis tetap dibatasi UUID akun di `portiter_blog_admins` melalui RLS. MFA tidak diwajibkan saat ini.
6. Salin `.env.example` menjadi `.env.local` atau `.env` dan isi URL proyek serta publishable/anon key. Keduanya diabaikan Git. Nilai browser boleh dipublikasikan karena akses dibatasi RLS. Jangan menaruh service-role key di frontend.

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

Gunakan **Project URL** di atas, bukan alamat Data API yang berakhir dengan `/rest/v1`. Kode menerima alamat Data API bila terlanjur ditempel, lalu menggunakan origin proyek untuk Auth, REST, dan Storage.

Jalankan `npm.cmd run dev` untuk membuka situs dan `/admin/login`. Tanpa `.env` atau `.env.local`, blog lokal tampil kosong dan login menjelaskan variabel yang dibutuhkan. Generator build statis juga membaca kedua file tersebut.

Jalankan kedua migrasi dan isi allowlist admin sebelum menjalankan `npm.cmd run build` dengan kredensial proyek. Jika build menampilkan `Could not find the table 'public.portiter_blog_translations' in the schema cache`, migrasi rename belum diterapkan pada proyek yang dituju atau cache API belum segar. Migrasi kedua sudah memanggil `NOTIFY pgrst, 'reload schema'`. Build sengaja berhenti agar halaman dan sitemap tidak terbit dengan data blog kosong.

## Vercel dan halaman statis

Tambahkan `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, dan `SUPABASE_ANON_KEY` ke environment Production dan Preview Vercel. Build production sengaja gagal jika Supabase belum dikonfigurasi atau query konten gagal; ini mencegah deployment menghasilkan sitemap kosong.

Buat Vercel Deploy Hook untuk branch production. Simpan URL tersebut hanya sebagai Edge Function secret. Build membaca terjemahan publik melalui query read-only; draft tetap tertutup oleh RLS. Rewrites Vercel hanya mengarahkan `/admin` ke SPA; route blog harus ada sebagai file statis agar slug tak dikenal berstatus 404.

## Jadwal artikel dan sinkronisasi build

Deploy function dan set secret berikut di Supabase:

```powershell
supabase functions deploy blog-publisher
supabase secrets set --project-ref <project-ref> `
  VERCEL_DEPLOY_HOOK_URL="<vercel-deploy-hook-url>" `
  BLOG_CRON_SECRET="<random-long-secret>"
```

Supabase menyediakan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` otomatis di Edge Function. Jangan set manual kedua nama tersebut.

Function ini memvalidasi header rahasia sendiri, sehingga `supabase/config.toml` menonaktifkan pemeriksaan JWT gateway untuk function ini. Jangan hapus validasi `BLOG_CRON_SECRET` di function. Aktifkan extension `pg_cron`, `pg_net`, dan Vault di Supabase. Buat dua secret Vault (gunakan nilai yang sama dengan Edge Function untuk secret kedua):

```sql
select vault.create_secret(
  'https://<project-ref>.supabase.co/functions/v1/blog-publisher',
  'blog_publisher_url',
  'Endpoint cron untuk blog Portiter'
);
select vault.create_secret(
  '<nilai BLOG_CRON_SECRET yang sama>',
  'blog_cron_secret',
  'Header rahasia cron blog Portiter'
);
```

Setelah itu jalankan `supabase/cron.sql` lewat SQL Editor. Script membuang jadwal bernama sama sebelum membuat ulang, agar setup bisa diulang tanpa menambah Cron duplikat. Cron memeriksa jadwal dan antrean build setiap menit.

Perubahan pada artikel publik menambahkan row ke `portiter_blog_deploy_jobs`. Dashboard membedakan `queued`, `triggered`, dan `failed`; job yang gagal memicu Deploy Hook bisa dicoba ulang. Status hasil build dan error kompilasi lengkap dilihat di Vercel.

## Generator artikel dengan Tavily dan Gemini di Vertex AI express mode

Generator tersedia di **Admin → Artikel → Generate artikel**. Masukkan topik dan pilih satu bahasa. Generator memakai Tavily Search dan Extract untuk memperoleh setidaknya tiga sumber yang dapat dibaca, lalu Gemini menyiapkan artikel, ringkasan, SEO, serta saran kategori/tag yang sudah ada. Hasil disimpan sebagai draft; admin memeriksa isi dan tautan sumber di editor sebelum menekan **Terbitkan sekarang**. Cover dapat dipilih dari media library. Bahasa lain tetap draft kosong.

Generator memanggil `gemini-3.8-flash` melalui **Vertex AI express mode pada Google Cloud**, memakai API key `AQ.` yang terikat ke Agent Platform API. Ini berbeda dari `GEMINI_API_KEY` (`AIza`) untuk endpoint Gemini Developer API. Simpan key GCP hanya sebagai secret Supabase Edge Function; jangan menaruhnya di variabel `VITE_*` atau repository.

Set secret berikut secara terpisah di proyek Supabase development dan production sebelum deploy:

| Secret | Isi |
| --- | --- |
| `TAVILY_API_KEY` | API key Tavily |
| `GCP_API_KEY` | API key Vertex AI express mode (`AQ.`) yang diizinkan memakai Agent Platform API |
| `GEMINI_MODEL` | Opsional; default `gemini-3.8-flash` |
| `BLOG_GENERATOR_ALLOWED_ORIGINS` | Origin website production, Preview, dan lokal, dipisah koma |

`GEMINI_API_KEY` tidak dipakai untuk alur ini. Key express mode dikirim lewat header `x-goog-api-key` ke endpoint `aiplatform.googleapis.com`. Setelah secret siap, deploy function:

```powershell
supabase functions deploy blog-generate --project-ref <project-ref>
```

Isi `BLOG_GENERATOR_ALLOWED_ORIGINS` dengan origin persis untuk website production, Preview, dan lokal yang dipakai; nilai default function hanya mencakup `https://www.akhmdnzr.fun` serta localhost port 5173. Function memerlukan JWT user dan memeriksa allowlist `portiter_blog_admins` sebelum memanggil provider. Simpan key di Supabase Edge Function secrets; kredensial yang hanya tersimpan di Vercel tidak tersedia bagi function ini.

Untuk uji Preview, buat artikel pada proyek Supabase development, periksa kedua pilihan bahasa, sumber, metadata dan cover, lalu terbitkan dan tunggu build Vercel berhasil. Jika penyimpanan draft gagal, hasil generator tetap berada di halaman selama tab belum ditutup sehingga bisa dicoba simpan lagi. Error riset atau Gemini tidak membuat artikel baru.

## Backup dan pemulihan

Dashboard mengekspor tabel konten dan metadata media ke JSON melalui **Ekspor backup**. **Pulihkan backup** melakukan upsert berdasarkan UUID agar pemulihan bisa diulang tanpa menghapus data tambahan. Gunakan backup yang dipercaya dan periksa proyek tujuan sebelum memulihkan.

JSON tidak berisi byte file gambar. Cadangkan dan pulihkan objek bucket `blog-media` secara terpisah dengan Storage dashboard/API/CLI, sambil mempertahankan object path. Saat impor ke proyek Supabase lain, URL media pada metadata dan konten artikel disesuaikan ke proyek tujuan. Uji pemulihan database, metadata, dan objek media sebelum mengandalkan backup.

## Pemeriksaan setelah konfigurasi

- Login owner, logout, lalu login lagi dengan email dan password. Pastikan UUID owner sudah tercantum di `portiter_blog_admins`.
- Buat draft EN/ID; pastikan versi satu bahasa tetap privat walau bahasa lain diterbitkan.
- Upload gambar, gunakan sebagai cover dan di body, cek alt/caption, lalu pastikan upload tanpa login ditolak.
- Publish, archive, restore, Trash, restore sebagai Draft, dan purge permanen; pantau `portiter_blog_deploy_jobs`.
- Buat jadwal di masa mendatang dalam Asia/Jakarta dan periksa transisi otomatis serta deployment sesudah waktunya.
- Periksa raw HTML artikel, canonical/hreflang/structured data, RSS, sitemap, header `X-Robots-Tag` admin, dan HTTP 404 untuk slug tak dikenal.

Lakukan verifikasi ini lagi di Vercel Preview dan Production setelah konfigurasi akun selesai. Build lokal saja tidak membuktikan webhook, Cron, email Auth, atau Vercel telah menerima konfigurasi.
