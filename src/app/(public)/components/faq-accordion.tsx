'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Apakah tiket masuk TerraFest berbayar?',
    answer:
      'Seluruh tiket masuk TerraFest 2026 diselenggarakan secara gratis untuk civitas akademika ITERA dan masyarakat umum melalui sistem war tiket kuota terbatas. Pastikan Anda mengklaim tiket lebih awal sebelum kuota habis.',
  },
  {
    id: 'faq-2',
    question: 'Bagaimana cara mendapatkan dan menunjukkan e-tiket?',
    answer:
      'Cukup klik tombol "Klaim Tiket", masuk menggunakan akun Google Anda, dan konfirmasi jenis tiket. Tiket digital sah ber-QR token unik akan langsung muncul di halaman "Tiket Saya" dan dapat ditunjukkan lewat layar smartphone saat masuk pintu gerbang.',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana sistem keamanan gerbang dan verifikasi tiket?',
    answer:
      'Setiap tiket dilengkapi token QR kriptografis unik berbasis hash SHA-256. Di pintu masuk (Gate A dan Gate B), petugas panitia menggunakan pemindai kamera berkecepatan tinggi yang memvalidasi tiket secara langsung ke basis data pusat untuk mencegah pemalsuan atau pemakaian ganda (anti double-entry).',
  },
  {
    id: 'faq-4',
    question: 'Barang apa saja yang dilarang dibawa ke dalam festival?',
    answer:
      'Pengunjung dilarang membawa senjata tajam/api, minuman beralkohol, obat-obatan terlarang, kembang api/flare, serta drone tanpa izin panitia. Botol minum tumbler diperbolehkan dengan pengisian air di water station yang disediakan.',
  },
  {
    id: 'faq-5',
    question: 'Di mana lokasi panggung festival dan fasilitas pendukung?',
    answer:
      'TerraFest berlokasi di Lapangan Utama Kampus ITERA, Lampung Selatan. Festival dilengkapi dua panggung penampilan (Terra Main Stage & Nebula Stage), area bazar kuliner UMKM mahasiswa, mushola, posko medis darurat, dan toilet umum ramah disabilitas.',
  },
];

export function FAQAccordion() {
  const [openId, setOpenId] = React.useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {FAQS.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="ios-glass-card ios-blur rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 transition-all duration-200"
          >
            <button
              onClick={() => toggle(faq.id)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 group"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {faq.question}
              </span>
              <div
                className={`h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in duration-200">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
