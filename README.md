# Bastyasaka — Absensi (React + Vite)

Aplikasi absensi berbasis web untuk siswa dengan face‑recognition (frontend: React + Vite).

## Fitur
- Login / register (Supabase)
- Registrasi wajah & deteksi wajah (face-api.js)
- Lakukan absen otomatis lewat kamera
- Dashboard, riwayat, dan pengaturan siswa

## Quick start 🔧
Prerequisites: Node.js (v16+), npm

1. Install dependensi

```bash
npm install
```

2. Jalankan development server

```bash
npm run dev
```

3. Build untuk produksi

```bash
npm run build
npm run preview
```

## Konfigurasi environment
- Buat file `.env.local` (tidak termasuk di repo):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- Jangan commit file berisi kredensial ke repository (meskipun private).

## Upload ke Kaggle (sebagai private dataset) 📦
1. Install Kaggle CLI dan siapkan API token: https://www.kaggle.com/docs/api

```bash
pip install kaggle
# letakkan kaggle.json di ~/.kaggle/kaggle.json (Windows: C:\\Users\\<you>\\.kaggle\\kaggle.json)
```

2. Update `dataset-metadata.json` di root — ubah `id` menjadi: `YOUR_KAGGLE_USERNAME/bastyasaka-attendance`.

3. Buat dataset private dari folder proyek:

```bash
kaggle datasets create -p . --private
```

(Opsi lain: buat Kernel/Notebook di Kaggle dan push; biasanya `kaggle kernels push -p <path>`.)

## Keamanan ⚠️
- **Jangan** memasukkan API keys atau file `.env` ke repo publik.
- Meskipun Anda memilih private dataset/repo, sebaiknya hapus atau mask kredensial sebelum upload.

---

*Catatan: dokumentasi template asli (Vite) dilanjutkan di bawah.*

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
