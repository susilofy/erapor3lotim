# Panduan Membuat File Installer .EXE (Desktop Windows)
**Aplikasi Rapor SD Negeri 3 Loloan Timur**  
*Developer: Susilo Fitri Yatmoko*

---

## 🚀 Cara Paling Mudah (1 Kali Klik di Windows)

1. **Download ZIP Proyek ini** melalui menu Google AI Studio (*Export to ZIP* atau *Download*).
2. **Ekstrak file ZIP** ke folder di laptop/komputer Anda (misal: `D:\Rapor-SDN3LoloanTimur`).
3. Pastikan laptop/PC sudah terinstall **[Node.js](https://nodejs.org/)** (pilih versi LTS).
4. Klik dua kali (**double click**) pada file:
   ```text
   buat-program-exe.bat
   ```
5. Tunggu proses otomatis sampai selesai.
6. File program `.exe` yang siap pakai akan otomatis tersedia di dalam folder **`release`**:
   - `Aplikasi Rapor SDN 3 Loloan Timur-Setup-1.0.0.exe` (Installer dengan shortcut desktop otomatis)
   - `Aplikasi Rapor SDN 3 Loloan Timur 1.0.0.exe` (Versi Portable: langsung jalan tanpa install)

---

## 💻 Cara Manual Melalui Terminal (Command Prompt / PowerShell)

Buka folder proyek ini di Command Prompt (CMD) atau VS Code terminal, lalu jalankan:

1. **Install Dependensi:**
   ```bash
   npm install
   npm install --save-dev electron electron-builder
   ```

2. **Coba Jalankan Mode Desktop (Uji Coba):**
   ```bash
   npm run build
   npx electron electron/main.cjs
   ```

3. **Buat File .EXE Windows:**
   ```bash
   npm run electron:build
   ```

File installer dan portable `.exe` akan langsung berada di folder `release/`.

---

## 🌟 Keunggulan Aplikasi Versi .EXE:
- **100% Offline**: Tidak memerlukan koneksi internet sama sekali.
- **Data Tersimpan Permanen**: Data siswa, KKTP, nilai, absensi, dan catatan tersimpan di laptop.
- **Bisa Dibagikan**: Cukup copy file `.exe` ke flashdisk untuk dibagikan kepada seluruh bapak/ibu guru kelas.
