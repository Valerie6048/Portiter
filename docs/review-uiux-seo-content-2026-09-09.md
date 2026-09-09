Review portofolio Akhmad Nizar Zakaria — 9 September 2026

Portofolio sudah memiliki identitas visual yang konsisten dan materi AI/ML yang relevan. Kesiapan profesionalnya masih tertahan oleh beberapa masalah pada akses CV/kontak, konsistensi dokumen, bukti hasil proyek, dan konfigurasi SEO. Perbaikan tersebut lebih bernilai daripada menambah animasi atau jumlah konten.

Asumsi penilaian: tujuan utama situs adalah membantu recruiter atau calon kolaborator menilai kemampuan AI/ML dan menghubungi pemiliknya, sesuai status “Available for AI/ML Roles”.

| Aspek | Penilaian | Alasan |
| --- | --- | --- |
| Visual UI | Sudah baik | Palet navy/cream, tipografi Inter, bentuk kartu, ikon, dan spacing memiliki konsistensi. |
| UX | Perlu perbaikan nyata | Tombol salin email keluar layar mobile, tautan CV tidak konsisten, navigasi menutupi filter, header tablet sesak. |
| SEO teknis | Fondasi ada, konfigurasi penting belum tepat | Sitemap/robots dan metadata tersedia, tetapi canonical semua route menunjuk homepage dan URL tidak ditemukan mengembalikan HTTP 200. |
| Konten | Relevan, pembuktiannya perlu diperkuat | Pengalaman cukup spesifik, tetapi studi kasus masih banyak klaim kualitatif, placeholder, dan inkonsistensi sertifikat/CV. |

Penilaian ini bersifat editorial, bukan skor Lighthouse atau pengukuran ranking Google.

**Yang sudah kuat**

- Fokus RAG, forecasting, healthcare, dan marketing analytics mudah dikenali. Pengalaman menyebut pekerjaan konkret seperti eCRF, pencocokan uji klinis, P10/P50/P90, dan seasonality Ramadan.
- Nama, peran, ketersediaan kerja, CV, email, GitHub, dan LinkedIn tersedia. Tidak ada form kontak panjang yang harus diisi pengunjung.
- Struktur detail proyek sudah memiliki urutan Use Case, Approach, Results, dan Tech Stack. Struktur ini bisa dipertahankan saat memperkuat bukti.
- Dua bahasa dan dua tema berfungsi pada interaksi yang diperiksa. Accordion pengalaman memakai tombol native dan aria-expanded.
- Robots dan sitemap produksi dapat diakses dengan HTTP 200. Ada JSON-LD Person/WebSite serta title/description dinamis pada halaman proyek.

**Perbaikan utama: UI/UX**

1. **Tombol Copy email keluar layar mobile.** Pada viewport 390 × 844, tombol berada di x=340 hingga x=676; teks tombol berada di luar layar. Email masih terlihat, tetapi affordance salin praktis hilang. Penyebabnya wrapper email tetap flex horizontal sementara semua contact-card mendapat width:100% pada layar kecil. Buat aturan khusus tombol salin dengan ukuran yang sesuai atau susun email dan tombol vertikal. Bukti: [Contact.jsx:67](C:/Users/ml_devdat/local_projects/Portiter/src/components/Contact.jsx:67), [index.css:1852](C:/Users/ml_devdat/local_projects/Portiter/src/index.css:1852).

2. **Tautan CV di area proyek salah.** Filter memakai /cv.pdf, sedangkan aset yang tersedia dan dipakai hero adalah /AkhmadNizarZakaria_AIMLEngineer.pdf. Samakan sumber URL agar semua tombol mengunduh dokumen yang sama. Bukti: [FilterBar.jsx:29](C:/Users/ml_devdat/local_projects/Portiter/src/components/FilterBar.jsx:29), [Hero.jsx:88](C:/Users/ml_devdat/local_projects/Portiter/src/components/Hero.jsx:88). Kesalahan path terverifikasi dari source dan tautan DOM; unduhan produksi tidak dijalankan.

3. **Klik Projects menempatkan filter di belakang header.** Terverifikasi desktop: section dan filter berada sekitar y=0, sementara header fixed tingginya sekitar 80px. Tambahkan scroll-margin-top/scroll-padding yang sesuai dan hilangkan id="projects" yang duplikat. Tambahkan heading “Selected Projects” agar pergantian dari pengalaman ke proyek lebih jelas. Bukti: [Header.jsx:32](C:/Users/ml_devdat/local_projects/Portiter/src/components/Header.jsx:32), [ProjectGrid.jsx:78](C:/Users/ml_devdat/local_projects/Portiter/src/components/ProjectGrid.jsx:78), [FilterBar.jsx:15](C:/Users/ml_devdat/local_projects/Portiter/src/components/FilterBar.jsx:15).

4. **Header tablet terlalu padat.** Pada lebar 820px dalam bahasa Indonesia, nama merek terjepit/tertutup area navigasi dan “Token Counter” membungkus. Pertimbangkan beralih ke menu ringkas pada breakpoint yang lebih lebar atau kurangi kepadatan navigasi. Pada mobile 390px nama juga menjadi dua baris, sehingga tinggi header sekitar 99px; posisi menu mobile saat ini tetap 65px. Bukti: [Header.jsx](C:/Users/ml_devdat/local_projects/Portiter/src/components/Header.jsx), [index.css](C:/Users/ml_devdat/local_projects/Portiter/src/index.css).

5. **Aksesibilitas perlu satu pass khusus.** Breadcrumb Projects berupa span dengan onClick sehingga tidak bisa dijangkau seperti link lewat keyboard. Hamburger belum mengumumkan expanded/collapsed. Textarea Token Counter tidak punya label terkait dan outline dihapus tanpa pengganti. Dukungan reduced-motion belum ditemukan. Teks link ungu light mode memiliki rasio kontras terhitung 3,49:1 pada teks kecil; acuan minimum adalah 4,5:1. Ini masalah warna tertentu, bukan seluruh desain. Bukti: [ProjectDetail.jsx:98](C:/Users/ml_devdat/local_projects/Portiter/src/pages/ProjectDetail.jsx:98), [Header.jsx:106](C:/Users/ml_devdat/local_projects/Portiter/src/components/Header.jsx:106), [TokenCounter.jsx:568](C:/Users/ml_devdat/local_projects/Portiter/src/pages/TokenCounter.jsx:568), [index.css:67](C:/Users/ml_devdat/local_projects/Portiter/src/index.css:67). Acuan: [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

6. **Hero bisa lebih cepat membawa pembaca ke bukti.** Pada desktop sekitar 1274 × 717, tombol utama berada di bawah tampilan awal. Ini bukan larangan desain, tetapi mengurangi visibilitas tindakan berikutnya. Ringkas tinggi hero dan pertimbangkan “Lihat Studi Kasus” sebagai CTA utama, “Unduh CV” sebagai pendamping. Tampilkan proyek unggulan sebelum rincian pengalaman jika tujuan utama adalah evaluasi cepat oleh recruiter. Pertahankan ketersediaan kerja, tetapi prioritaskan capaian relevan dibanding jumlah kursus dan IPK.

**Perbaikan utama: isi dan kredibilitas**

1. **Perbaiki nama dan tanggal sertifikasi.** Website menulis Azure Machine Learning Associate dan 2026. Dokumen PDF yang ditautkan menyebut Microsoft: Azure AI Engineer Associate, diperoleh 19 Maret 2024, berlaku hingga 20 Maret 2027. TensorFlow menampilkan 2026 tanpa label, sedangkan PDF mencantumkan tanggal terbit 27 Oktober 2023 dan kedaluwarsa 27 Oktober 2026. Tampilkan label “Diperoleh” dan “Berlaku hingga”, serta nama resmi sesuai dokumen. Ini ketidakkonsistenan penyajian, bukan kesimpulan tentang keabsahan kredensial. Bukti: [certifications.json:5](C:/Users/ml_devdat/local_projects/Portiter/src/data/certifications.json:5), [PDF Azure](<C:/Users/ml_devdat/local_projects/Portiter/public/Sertifikasi/Sertif Keahlian/AzureAICert_Nizar.pdf>), [PDF TensorFlow](<C:/Users/ml_devdat/local_projects/Portiter/public/Sertifikasi/Sertif Keahlian/Akhmad_Nizar_Z_TensorFlow_Certificate.pdf>).

2. **Perbarui CV yang menjadi CTA utama.** Halaman pertama masih menyebut “with 1 year of experience”, sementara pengalaman Mei 2024–Present sudah melewati dua tahun pada tanggal audit. Nama sertifikasi Azure di CV juga perlu disamakan dengan PDF. Gunakan ringkasan yang tidak cepat basi atau perbarui saat perubahan pengalaman. Bukti: [CV utama, halaman 1](C:/Users/ml_devdat/local_projects/Portiter/public/AkhmadNizarZakaria_AIMLEngineer.pdf).

3. **Ganti placeholder dengan artefak proyek.** Detail proyek secara literal menampilkan “Visual Concept Placeholder”. Ganti dengan diagram arsitektur sebenarnya, screenshot yang boleh dibagikan, contoh input/output, atau grafik evaluasi. Jika proyek perusahaan tidak bisa dibagikan, jelaskan batasannya dan tampilkan ilustrasi anonim yang benar-benar merepresentasikan implementasi. Bukti: [ProjectDetail.jsx:158](C:/Users/ml_devdat/local_projects/Portiter/src/pages/ProjectDetail.jsx:158).

4. **Jadikan kategori kompetensi sebagai studi kasus spesifik.** Generative AI saat ini menggabungkan CTMS, eCRF, CTCAE, dan asesmen multimodal. Bagian ini banyak mengulang Experience. Pilih 2–3 kasus terkuat, misalnya “Pencocokan Pasien dengan Uji Klinis Onkologi” atau “Forecasting Permintaan pada Periode Ramadan”. Setiap kasus menjelaskan masalah, peran pribadi, periode, status prototipe/produksi, kendala, keputusan teknis, evaluasi, dan hasil. Bukti: [projectDetails.js:3](C:/Users/ml_devdat/local_projects/Portiter/src/data/projectDetails.js:3).

5. **Beri konteks pada hasil.** “Reduced ... significantly”, “accurate”, dan “improved forecasting accuracy” belum dilengkapi baseline, skala data, metode evaluasi, atau hasil pengukuran. Pembaca belum bisa menilai klaim tersebut. Untuk RAG, jelaskan evaluasi retrieval/jawaban dan penilaian manusia; untuk forecasting, jelaskan split waktu, baseline dan error; untuk MLOps, jelaskan waktu proses, biaya, atau reliabilitas yang benar-benar diukur. Jika metrik tidak tersedia, nyatakan hasil kualitatif yang bisa dibuktikan. Jangan mengisi persentase tebakan. Bukti: [projectDetails.js:40](C:/Users/ml_devdat/local_projects/Portiter/src/data/projectDetails.js:40), [hasil forecasting:94](C:/Users/ml_devdat/local_projects/Portiter/src/data/projectDetails.js:94).

6. **Label akurasi Token Counter perlu dikoreksi.** Copy menjanjikan hitungan akurat untuk beberapa provider, tetapi implementasi memakai cl100k_base untuk Claude dan o200k_base untuk Gemini melalui js-tiktoken. Penggunaan tokenizer pengganti harus diberi label estimasi atau diganti metode penghitung sesuai model. Jumlah token teks saja juga tidak mewakili seluruh request dengan system prompt, tools, dan media. Bukti: [LanguageContext.jsx:151](C:/Users/ml_devdat/local_projects/Portiter/src/context/LanguageContext.jsx:151), [TokenCounter.jsx:100](C:/Users/ml_devdat/local_projects/Portiter/src/pages/TokenCounter.jsx:100), [TokenCounter.jsx:146](C:/Users/ml_devdat/local_projects/Portiter/src/pages/TokenCounter.jsx:146). Acuan: [Claude token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), [Gemini token counting](https://ai.google.dev/gemini-api/docs/tokens).

Perbaikan editorial tambahan: ubah label “24 Certifications” menjadi “Sertifikat & kursus” karena angka menjumlahkan keduanya; prioritaskan kursus AI/ML yang relevan; gunakan “Keahlian Teknis” sebagai alternatif yang lebih alami dari “Arsenal Teknis”; lengkapi terjemahan breadcrumb detail. Kategori kafe sebaiknya Recommendation Systems/NLP jika implementasinya memang content-based filtering tanpa komponen generatif.

Contoh arah copy hero berdasarkan materi yang sudah ada: “Machine Learning Engineer — RAG untuk data klinis dan forecasting pemasaran.” Subcopy: “Saya membangun pipeline ekstraksi dokumen, pencocokan uji klinis, dan model forecasting di lingkungan Azure.” Sesuaikan kembali dengan kontribusi pribadi yang bisa dipertanggungjawabkan.

**Perbaikan utama: SEO**

1. **Canonical semua halaman menunjuk homepage.** Ini terverifikasi pada HTML produksi /project/genai dan /token-counter, serta DOM lokal halaman proyek setelah JavaScript berjalan. Canonical memberi sinyal URL utama kepada mesin pencari; mengarahkannya ke homepage bertentangan dengan tujuan menjadikan studi kasus halaman mandiri. Gunakan canonical sesuai URL tiap halaman, konsisten dengan sitemap, idealnya sejak HTML awal. Bukti: [index.html:13](C:/Users/ml_devdat/local_projects/Portiter/index.html:13), [ProjectDetail.jsx:21](C:/Users/ml_devdat/local_projects/Portiter/src/pages/ProjectDetail.jsx:21). Acuan: [Google canonical guidelines](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

2. **URL tidak ditemukan mengembalikan HTTP 200.** Dua URL produksi yang sengaja tidak ada, termasuk project ID tidak valid, tetap mengirim HTTP 200. Router tidak memiliki wildcard; proyek tidak valid hanya menampilkan pesan. Buat halaman tidak ditemukan yang jelas dan status HTTP 404 yang benar melalui konfigurasi serving yang sesuai. Fallback SPA dapat memakai noindex pada error bila status tidak dapat diatur. Risiko soft 404 ada; klasifikasi aktual Search Console belum diperiksa. Bukti: [vercel.json:4](C:/Users/ml_devdat/local_projects/Portiter/vercel.json:4), [App.jsx:14](C:/Users/ml_devdat/local_projects/Portiter/src/App.jsx:14), [ProjectDetail.jsx:38](C:/Users/ml_devdat/local_projects/Portiter/src/pages/ProjectDetail.jsx:38). Acuan: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

3. **Metadata share dan isi awal masih sama untuk setiap route.** HTML awal homepage, detail, dan tool yang diperiksa identik dengan root kosong. Title/description berubah setelah JavaScript, tetapi OG/Twitter tetap identitas homepage. Sediakan HTML hasil prerender/SSG berisi konten serta metadata per halaman. Google bisa merender JavaScript; root kosong bukan bukti bahwa situs tidak bisa diindeks. Prerender tidak harus berarti migrasi framework besar. Gunakan URL gambar share absolut dan preview yang relevan dengan tiap studi kasus. Bukti: [index.html](C:/Users/ml_devdat/local_projects/Portiter/index.html), [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Open Graph](https://ogp.me/).

4. **Bahasa Indonesia belum punya URL sendiri.** Toggle hanya mengganti state, dimulai lagi dari English ketika muat ulang, dan tidak memiliki hreflang. Bila ingin menargetkan pencarian bilingual, gunakan URL bahasa terpisah dengan self-canonical dan hreflang timbal balik. Ini prioritas lanjutan setelah canonical dan 404; bukan keharusan bila hanya satu bahasa ditargetkan untuk pencarian. Bukti: [LanguageContext.jsx:352](C:/Users/ml_devdat/local_projects/Portiter/src/context/LanguageContext.jsx:352). Acuan: [Google multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

5. **Sebagian konten baru ada setelah klik.** Panel pengalaman Predictive/MLOps tidak dirender sebelum dibuka. Render isinya sejak awal lalu kendalikan visibilitas dengan accordion bila teks tersebut ditargetkan untuk pencarian. Google tidak melakukan klik untuk memuat konten. Sebagian materi juga tersedia pada detail proyek sehingga dampaknya tidak total. Bukti: [Experience.jsx:107](C:/Users/ml_devdat/local_projects/Portiter/src/components/Experience.jsx:107). Acuan: [Google lazy-loading content](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading).

**Urutan pelaksanaan yang disarankan**

| Prioritas | Pekerjaan | Hasil yang diperiksa |
| --- | --- | --- |
| 1 | Samakan link CV; betulkan layout Copy mobile; koreksi sertifikat dan CV | CV yang benar bisa diakses dari semua CTA, kontak utuh pada layar kecil, fakta sesuai dokumen. |
| 2 | Canonical per halaman dan penanganan 404 | URL proyek menyatakan dirinya sebagai canonical; URL tidak ada menghasilkan respons yang sesuai. |
| 3 | Ganti placeholder dan kuatkan 2–3 studi kasus | Ada artefak, kontribusi pribadi, dan evaluasi yang bisa dinilai recruiter. |
| 4 | Perbaiki anchor, header tablet, keyboard/focus/contrast, label tool | Alur membaca dan menghubungi lancar pada ukuran layar yang diuji. |
| 5 | Prerender, metadata share, strategi bahasa, optimasi tool | Isi/metadata tersedia lebih awal dan halaman tool lebih ringan. |

**Cakupan verifikasi dan batas penilaian**

- Source code, data proyek, terjemahan, metadata, routing, aset publik, dan dokumen CV/sertifikat dibaca. PDF terkait dirender dan diperiksa visual.
- Browser lokal: homepage dan detail GenAI, navigasi proyek, kontak mobile, menu, bahasa, dan tema; desktop sekitar 1274 × 717, mobile 390 × 844, tablet 820 × 1180. Ini belum merupakan pengujian semua ukuran, seluruh halaman, dan semua browser.
- HTTP produksi: homepage, /project/genai, /token-counter, dua URL tidak valid, robots.txt, dan sitemap.xml. Respons lima halaman HTML yang diperiksa identik, 3.685 byte, dengan homepage canonical. Ini tidak memastikan semua konten runtime produksi identik dengan checkout lokal.
- Build berhasil. Lint gagal dengan 5 error: unused imports/variable, deklarasi komponen di dalam render, dan export context terkait Fast Refresh. Hal ini merupakan catatan pemeliharaan, bukan lima bug UX tambahan.
- Chunk Token Counter sekitar 5,62 MB minified / 2,61 MB gzip. Route sudah lazy-loaded sehingga ini terutama risiko waktu buka tool, bukan otomatis beban homepage. Belum diukur Core Web Vitals atau kecepatan jaringan nyata.
- Belum diperiksa Search Console, Google-selected canonical, jumlah halaman terindeks, ranking keyword, analytics konversi, Lighthouse, Rich Results Test, atau preview share lintas platform.
- Tidak ada source aplikasi yang diubah dalam review ini. Laporan ini adalah artefak audit; build dan artefak pemeriksaan PDF dibuat untuk verifikasi.
