"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MoonIcon, SunIcon } from "@/components/icons";

export default function PrivacyPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EEED] dark:bg-[#191919]">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <Link href="/" className="flex items-center h-full">
              <img
                src="/images/Logo Baru Sejenak-03.png"
                alt="Sejenak Logo"
                className="h-24 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:text-[#C1A7A3] transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:text-[#C1A7A3] transition-colors"
                >
                  Beranda
                </Link>
              )}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="w-5 h-5 text-[#191919] dark:text-[#F0EEED]" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-[#191919] dark:text-[#F0EEED]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              Kebijakan & Ketentuan
            </h1>
            <p className="text-lg text-[#706C6B] dark:text-[#C1A7A3]">
              Sejenak Beauty Lounge
            </p>
            <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-2">
              Terakhir diperbarui: 19 November 2025
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 mb-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              Daftar Isi
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("privacy-policy")}
                  className="text-[#C1A7A3] hover:text-[#A88F8B] transition-colors text-left"
                >
                  1. Kebijakan Privasi (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("terms-conditions")}
                  className="text-[#C1A7A3] hover:text-[#A88F8B] transition-colors text-left"
                >
                  2. Syarat & Ketentuan (Terms & Conditions)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("cancellation-refund")}
                  className="text-[#C1A7A3] hover:text-[#A88F8B] transition-colors text-left"
                >
                  3. Kebijakan Pembatalan & Pengembalian Dana
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("service-fulfillment")}
                  className="text-[#C1A7A3] hover:text-[#A88F8B] transition-colors text-left"
                >
                  4. Kebijakan Penyampaian Layanan
                </button>
              </li>
            </ul>
          </div>

          {/* Section 1: Privacy Policy */}
          <section
            id="privacy-policy"
            className="bg-white dark:bg-[#3D3B3A] rounded-xl p-8 mb-8 border border-zinc-200 dark:border-zinc-800 scroll-mt-24"
          >
            <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                1. KEBIJAKAN PRIVASI (PRIVACY POLICY)
              </h2>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Sejenak Beauty Lounge | Tanggal Berlaku: 19 November 2025
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-6 leading-relaxed">
                Kebijakan Privasi ini menjelaskan bagaimana Sejenak Beauty Lounge
                mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda
                ketika Anda menggunakan aplikasi, website, dan layanan kami. Dengan mengakses
                atau menggunakan Layanan, Anda dianggap telah membaca, memahami, dan
                menyetujui Kebijakan Privasi ini.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    1. Informasi yang Kami Kumpulkan
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-2">
                      1.1 Informasi Pribadi
                    </h4>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                      Kami dapat mengumpulkan data berikut saat Anda membuat akun atau
                      menggunakan aplikasi:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                      <li>Nama lengkap</li>
                      <li>Email</li>
                      <li>Nomor telepon</li>
                      <li>Tanggal lahir (opsional)</li>
                      <li>Foto profil (opsional)</li>
                      <li>Histori pemesanan</li>
                      <li>Preferensi perawatan</li>
                      <li>
                        Informasi pembayaran (diproses aman oleh penyedia pembayaran seperti
                        Midtrans)
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-2">
                      1.2 Data yang Dikumpulkan Secara Otomatis
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                      <li>Alamat IP</li>
                      <li>Jenis perangkat</li>
                      <li>Sistem operasi</li>
                      <li>Data aktivitas dan penggunaan aplikasi</li>
                      <li>Cookies dan teknologi pelacakan serupa</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-2">
                      1.3 Informasi Kesehatan (Consent Form)
                    </h4>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                      Sebelum melakukan treatment, Anda mungkin diminta mengisi Formulir
                      Persetujuan (Consent Form). Kami dapat mengumpulkan informasi seperti:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4 mb-3">
                      <li>Kondisi kulit tertentu</li>
                      <li>Alergi atau sensitivitas</li>
                      <li>Status kehamilan/menyusui</li>
                      <li>
                        Riwayat kesehatan yang relevan dengan perawatan spa (non-medis)
                      </li>
                      <li>Area tubuh yang sedang cedera atau perlu perhatian</li>
                      <li>Kontraindikasi yang Anda sampaikan</li>
                      <li>Pernyataan bahwa layanan kami non-medis</li>
                    </ul>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                      Informasi ini dikumpulkan hanya berdasarkan persetujuan eksplisit dan
                      digunakan untuk:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                      <li>Menjamin keamanan perawatan</li>
                      <li>Mencegah alergi atau reaksi negatif</li>
                      <li>Menyesuaikan teknik perawatan</li>
                      <li>Memenuhi standar operasional Sejenak Beauty Lounge</li>
                    </ul>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3 italic">
                      Kami tidak menyimpan rekam medis, tidak memberikan diagnosis, dan tidak
                      menggunakan data kesehatan untuk pemasaran.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    2. Penggunaan Informasi
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Kami menggunakan data Anda untuk:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Mengelola akun dan profil pengguna</li>
                    <li>Memproses pemesanan dan pembayaran</li>
                    <li>Mengirimkan notifikasi dan pengingat janji temu</li>
                    <li>Meningkatkan kualitas layanan dan fitur aplikasi</li>
                    <li>Memastikan keamanan dan mencegah penipuan</li>
                    <li>Menjalankan kewajiban hukum dan operasional</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3">
                    Informasi kesehatan hanya digunakan untuk keamanan perawatan.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    3. Berbagi Informasi dengan Pihak Ketiga
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Kami dapat membagikan informasi dengan:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Penyedia pembayaran (mis. Midtrans)</li>
                    <li>Terapis atau penyedia layanan di lokasi kami</li>
                    <li>Penyedia layanan teknologi dan infrastruktur</li>
                    <li>Penyedia layanan pesan dan notifikasi</li>
                    <li>Otoritas hukum jika diwajibkan</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3 font-semibold">
                    Kami tidak menjual informasi pribadi kepada pihak ketiga.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    4. Penyimpanan & Keamanan Data
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Kami menerapkan standar teknis dan prosedural untuk melindungi data Anda.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    5. Hak Pengguna
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Anda dapat:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Mengakses data pribadi</li>
                    <li>Memperbarui atau memperbaiki data</li>
                    <li>Meminta penghapusan data tertentu</li>
                    <li>Menarik kembali persetujuan terhadap pemrosesan data kesehatan</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3">
                    Hubungi kami melalui email:{" "}
                    <a
                      href="mailto:moment@sejenakbeautylounge.id"
                      className="text-[#C1A7A3] hover:text-[#A88F8B] underline"
                    >
                      moment@sejenakbeautylounge.id
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    6. Perubahan Kebijakan
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan
                    akan diumumkan melalui aplikasi atau website.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    7. Kontak
                  </h3>
                  <div className="text-[#706C6B] dark:text-[#C1A7A3] space-y-1">
                    <p className="font-semibold">Sejenak Beauty Lounge</p>
                    <p>
                      Jl. Islamic No.1 Blok B2, Klp. Dua, Kecamatan Kelapa Dua, Kabupaten
                      Tangerang, Banten 15810
                    </p>
                    <p>
                      Email:{" "}
                      <a
                        href="mailto:moment@sejenakbeautylounge.id"
                        className="text-[#C1A7A3] hover:text-[#A88F8B] underline"
                      >
                        moment@sejenakbeautylounge.id
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Terms & Conditions */}
          <section
            id="terms-conditions"
            className="bg-white dark:bg-[#3D3B3A] rounded-xl p-8 mb-8 border border-zinc-200 dark:border-zinc-800 scroll-mt-24"
          >
            <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                2. SYARAT & KETENTUAN (TERMS & CONDITIONS)
              </h2>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Sejenak Beauty Lounge | Tanggal Berlaku: 19 November 2025
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-6 leading-relaxed">
                Dengan membuat akun dan menggunakan layanan kami, Anda menyetujui Syarat &
                Ketentuan berikut.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    1. Penggunaan Layanan
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Pengguna harus:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Memberikan data yang benar</li>
                    <li>Tidak menyalahgunakan aplikasi</li>
                    <li>Menggunakan layanan hanya untuk tujuan yang sah</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3">
                    Kami dapat menolak layanan atau menutup akun atas pertimbangan operasional.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    2. Akun Pengguna
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Anda bertanggung jawab atas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Kerahasiaan data login</li>
                    <li>Aktivitas pada akun Anda</li>
                    <li>Melaporkan aktivitas mencurigakan kepada kami</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    3. Pemesanan & Layanan
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Seluruh janji temu berdasarkan ketersediaan</li>
                    <li>Layanan dilakukan oleh terapis profesional non-medis</li>
                    <li>Harga, durasi, dan detail layanan tercantum pada aplikasi</li>
                    <li>Pemesanan dianggap sah saat konfirmasi muncul di aplikasi</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    4. Pembayaran
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Pembayaran dapat dilakukan melalui:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Kartu kredit/debit</li>
                    <li>E-wallet</li>
                    <li>Transfer bank</li>
                    <li>Metode lain yang didukung Midtrans</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3">
                    Semua transaksi diproses secara aman oleh mitra pembayaran.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    5. Layanan Non-Medis (Disclaimer Penting)
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Anda setuju bahwa:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Sejenak Beauty Lounge bukan fasilitas medis</li>
                    <li>Terapis bukan tenaga medis</li>
                    <li>
                      Layanan bersifat relaksasi, kecantikan, dan perawatan non-medis
                    </li>
                    <li>
                      Kami tidak memberikan diagnosis, terapi medis, atau tindakan medis
                    </li>
                    <li>
                      Anda wajib memberikan informasi kesehatan yang benar sebelum treatment
                    </li>
                    <li>
                      Kami tidak bertanggung jawab atas resiko akibat informasi yang tidak
                      diungkapkan.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    6. Persetujuan (Consent Form)
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Sebelum treatment, pengguna mungkin diminta mengisi Consent Form. Dengan
                    mengisi formulir tersebut, Anda menyatakan:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Memberikan informasi dengan jujur dan lengkap</li>
                    <li>Mengetahui risiko dan prosedur treatment</li>
                    <li>
                      Memahami bahwa terapis dapat melakukan interupsi operasional wajar
                      (contoh: ibadah, kebutuhan fisik)
                    </li>
                    <li>Akan mengikuti instruksi sebelum/sesudah perawatan</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    7. Pembatalan & Refund
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Mengikuti Kebijakan Pembatalan & Refund yang berlaku.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    8. Batasan Tanggung Jawab
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Kami tidak bertanggung jawab atas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Reaksi alergi akibat informasi yang tidak diungkapkan</li>
                    <li>Keterlambatan pengguna</li>
                    <li>Kerusakan akibat kelalaian pribadi</li>
                    <li>Gangguan sistem di luar kendali kami</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    9. Hukum yang Berlaku
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Dokumen ini tunduk pada hukum Republik Indonesia.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Cancellation & Refund Policy */}
          <section
            id="cancellation-refund"
            className="bg-white dark:bg-[#3D3B3A] rounded-xl p-8 mb-8 border border-zinc-200 dark:border-zinc-800 scroll-mt-24"
          >
            <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                3. KEBIJAKAN PEMBATALAN & PENGEMBALIAN DANA
              </h2>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Sejenak Beauty Lounge | Tanggal Berlaku: 19 November 2025
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    1. Pembatalan Janji Temu
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Untuk menjaga kualitas pengalaman semua tamu:
                  </p>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Kami memahami bahwa rencana dapat berubah. Jika Anda perlu membatalkan
                    atau menjadwal ulang reservasi, kami mohon konfirmasi minimal{" "}
                    <strong>12 jam sebelum waktu yang dijadwalkan</strong>.
                  </p>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Pembatalan tanpa pemberitahuan (no-show) akan dikenakan biaya penuh (100%)
                    dari nilai reservasi.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    2. Reschedule
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Penjadwalan ulang reservasi tanpa biaya tambahan dapat dilakukan dengan
                    pemberitahuan minimal <strong>12 jam sebelumnya</strong>.
                  </p>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Permintaan penjadwalan ulang dapat kami layani berdasarkan ketersediaan
                    jadwal therapist.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    3. Pengembalian Dana (Refund)
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>
                      Semua pembayaran untuk reservasi bersifat <strong>non-refundable</strong>.
                    </li>
                    <li>
                      Refund penuh hanya dapat diberikan jika pembatalan dilakukan oleh
                      Sejenak Beauty Lounge (misal: keadaan darurat operasional).
                    </li>
                    <li>
                      Layanan yang sudah dimulai atau telah berlangsung tidak dapat dikembalikan.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    4. Kontak Refund
                  </h3>
                  <div className="text-[#706C6B] dark:text-[#C1A7A3] space-y-1">
                    <p>
                      Email:{" "}
                      <a
                        href="mailto:moment@sejenakbeautylounge.id"
                        className="text-[#C1A7A3] hover:text-[#A88F8B] underline"
                      >
                        moment@sejenakbeautylounge.id
                      </a>
                    </p>
                    <p className="text-sm mt-2">
                      Sertakan nama, nomor booking, bukti pembayaran.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Service Fulfillment Policy */}
          <section
            id="service-fulfillment"
            className="bg-white dark:bg-[#3D3B3A] rounded-xl p-8 mb-8 border border-zinc-200 dark:border-zinc-800 scroll-mt-24"
          >
            <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                4. KEBIJAKAN PENYAMPAIAN LAYANAN (SERVICE FULFILLMENT POLICY)
              </h2>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Sejenak Beauty Lounge | Tanggal Berlaku: 19 November 2025
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-6 leading-relaxed">
                Karena Sejenak Beauty Lounge menyediakan jasa, kebijakan ini mengatur tentang
                pelaksanaan layanan.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    1. Lokasi & Penyedia Layanan
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Layanan dilakukan di:
                  </p>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Jl. Islamic No.1 Blok B2, Kelapa Dua, Kabupaten Tangerang, Banten 15810
                  </p>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Oleh terapis profesional yang telah terlatih.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    2. Konfirmasi Janji Temu
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Booking dianggap sah jika:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Pengguna menyelesaikan pemesanan di aplikasi</li>
                    <li>Pembayaran berhasil (jika diperlukan)</li>
                    <li>Status "Confirmed" muncul di aplikasi</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    3. Waktu Kedatangan
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Harap tiba <strong>10 menit sebelum jadwal</strong></li>
                    <li>Keterlambatan dapat mengurangi durasi treatment</li>
                    <li>
                      Keterlambatan lebih dari batas tertentu dianggap no-show
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    4. Kualitas Layanan
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Kami berkomitmen menyediakan:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Ruangan nyaman dan higienis</li>
                    <li>Peralatan aman dan terstandarisasi</li>
                    <li>Terapis bersertifikasi dan berpengalaman</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3">
                    Keluhan dapat disampaikan dalam 24 jam setelah perawatan.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    5. Perubahan atau Gangguan Layanan
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Kami dapat menyesuaikan jadwal atau membatalkan layanan karena:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#706C6B] dark:text-[#C1A7A3] ml-4">
                    <li>Kondisi terapis</li>
                    <li>Kendala operasional</li>
                    <li>Force majeure</li>
                    <li>Keamanan pelanggan</li>
                  </ul>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3] mt-3">
                    Pengguna dapat memilih refund atau reschedule.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-3">
                    6. Kontak
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    Email:{" "}
                    <a
                      href="mailto:moment@sejenakbeautylounge.id"
                      className="text-[#C1A7A3] hover:text-[#A88F8B] underline"
                    >
                      moment@sejenakbeautylounge.id
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Back to Top Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-3 bg-[#C1A7A3] hover:bg-[#A88F8B] text-white rounded-lg font-medium transition-all"
            >
              Kembali ke Atas
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#191919] dark:bg-[#0A0A0A] text-[#F0EEED]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/images/logo minimalist.jpg"
                  alt="Sejenak Logo"
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <h3 className="font-bold">Sejenak Beauty</h3>
                  <p className="text-xs text-[#C1A7A3]">Islamic Village</p>
                </div>
              </div>
              <p className="text-sm text-[#C1A7A3]">
                Your beauty, our passion. Experience luxury treatments in a serene
                environment.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-[#C1A7A3]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Hair Services
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Facial Treatments
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Body Massage
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Nail Care
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#C1A7A3]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/appointment" className="hover:text-[#F0EEED]">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#C1A7A3]">
                <li>
                  <Link 
                    href="/privacy" 
                    className="hover:text-[#F0EEED] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy#terms-conditions" 
                    className="hover:text-[#F0EEED] transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-[#C1A7A3]">
            <p>© 2025 Sejenak Beauty Lounge. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

