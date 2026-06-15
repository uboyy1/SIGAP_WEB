// API Pelanggan - SIGAP: Konten informasi publik pelanggan.
const aboutContent = {
  title: 'Apa Itu SIGAP?',
  eyebrow: 'Sistem Informasi Gangguan Air PDAM',
  headline: 'SIGAP membantu pelanggan melaporkan gangguan air dengan lebih mudah.',
  description:
    'SIGAP adalah layanan digital PDAM Tirta Karajae untuk menerima laporan gangguan air, memantau proses tindak lanjut, dan memberi informasi status penanganan secara lebih transparan kepada pelanggan.',
  focusItems: [
    'Gangguan aliran air',
    'Kerusakan meteran',
    'Kebocoran jaringan',
    'Keluhan layanan pelanggan'
  ],
  benefits: [
    {
      icon: 'time',
      title: 'Pelaporan Lebih Cepat',
      text: 'Pelanggan dapat mengirim laporan gangguan air secara online tanpa harus datang ke kantor pelayanan.'
    },
    {
      icon: 'status',
      title: 'Status Lebih Transparan',
      text: 'Setiap laporan dapat dipantau mulai dari menunggu validasi, diproses petugas, sampai selesai.'
    },
    {
      icon: 'archive',
      title: 'Data Tersimpan Rapi',
      text: 'Riwayat laporan, bukti foto, lokasi, dan catatan penanganan tersimpan sebagai arsip layanan.'
    }
  ],
  steps: [
    'Pelanggan membuat laporan gangguan.',
    'Petugas memvalidasi data laporan.',
    'Teknisi menerima penugasan penanganan.',
    'Pelanggan mendapatkan pembaruan status.'
  ],
  commitment:
    'SIGAP dirancang untuk mendukung pelayanan yang responsif, terdokumentasi, dan mudah dipantau. Dengan data laporan yang lebih lengkap, petugas dapat memahami kondisi lapangan dengan lebih baik sebelum melakukan tindak lanjut.',
  proposal: {
    title: 'Sistem Informasi Gangguan Air PDAM',
    description:
      'Aplikasi web interaktif untuk membantu pelanggan PDAM melaporkan gangguan air, memantau status penanganan, dan membantu petugas mengelola tindak lanjut laporan.',
    targetUsers: ['Pelanggan PDAM', 'Admin PDAM', 'Kepala Teknisi', 'Teknisi lapangan'],
    mainFeatures: [
      'Registrasi dan login pelanggan yang aman',
      'CRUD laporan gangguan air lengkap dengan foto dan lokasi',
      'Dashboard pelanggan untuk memantau status laporan',
      'Manajemen laporan oleh admin dan kepala teknisi',
      'Notifikasi perkembangan laporan',
      'Riwayat dan detail penanganan laporan'
    ],
    courseMaterials: [
      { no: 1, materi: 'React Component, JSX, State, dan Props', implementasi: 'Komponen halaman pelanggan, form laporan, kartu laporan, dan modal.' },
      { no: 2, materi: 'Manajemen State React', implementasi: 'State autentikasi, profil, laporan publik, dan navigasi pelanggan.' },
      { no: 3, materi: 'Routing menggunakan React Router', implementasi: 'Navigasi aplikasi frontend untuk halaman pelanggan, admin, dan kepala teknisi.' },
      { no: 4, materi: 'RESTful API menggunakan Express.js', implementasi: 'Endpoint /api/pelanggan untuk autentikasi, laporan, kategori, notifikasi, dan info publik.' },
      { no: 5, materi: 'Middleware pada Express.js', implementasi: 'Perlindungan akses, validasi request, rate limiter, CORS, helmet, upload file, dan sanitasi input.' },
      { no: 6, materi: 'Integrasi Penyimpanan Data', implementasi: 'Pengelolaan data pengguna, laporan, kategori gangguan, notifikasi, tugas, komentar, dan like.' },
      { no: 7, materi: 'CRUD Data', implementasi: 'Pelanggan dapat membuat, melihat, mengubah, dan menghapus laporan.' },
      { no: 8, materi: 'Integrasi Frontend dan Backend melalui API', implementasi: 'Frontend React mengambil data melalui service API ke backend Express.' },
      { no: 9, materi: 'Autentikasi pengguna', implementasi: 'Login pelanggan dan pembatasan akses sesuai peran pada halaman privat.' }
    ]
  }
};

const termsContent = {
  title: 'Term of Use (Syarat & Ketentuan Penggunaan SIGAP)',
  sections: [
    'Persyaratan Persetujuan',
    'Definisi',
    'Tujuan Penggunaan',
    'Akun Pengguna',
    'Penggunaan Website',
    'Privasi dan Perlindungan Data',
    'Hak Pengguna',
    'Kewajiban Pengguna',
    'Tanggung Jawab PDAM',
    'Batasan Tanggung Jawab',
    'Pelanggaran dan Sanksi',
    'Perubahan Ketentuan',
    'Kontak dan Bantuan'
  ].map((title) => ({
    title,
    bullets: [
      'Pengguna wajib memberikan data yang benar dan dapat dipertanggungjawabkan.',
      'Layanan digunakan untuk kebutuhan pelaporan gangguan air PDAM.',
      'PDAM berhak memproses laporan sesuai ketentuan layanan.'
    ]
  }))
};

const getAboutContent = (req, res) => {
  return res.status(200).json({
    success: true,
    data: aboutContent
  });
};

const getTermsContent = (req, res) => {
  return res.status(200).json({
    success: true,
    data: termsContent
  });
};

module.exports = {
  getAboutContent,
  getTermsContent
};
