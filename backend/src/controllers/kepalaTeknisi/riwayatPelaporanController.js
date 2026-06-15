// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/riwayatPelaporanController.js
const { Op } = require('sequelize');
const { Laporan, User, KategoriGangguan, Tugas } = require('../../models');

// Helper function untuk format tanggal
const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function untuk mapping status
const getStatusDisplay = (status) => {
  const map = {
    selesai: 'Selesai',
    ditolak: 'Ditolak',
    dalam_penanganan: 'Dalam Penanganan',
    divalidasi: 'Divalidasi'
  };
  return map[status] || status;
};

// Get riwayat pelaporan dengan filter kategori, status, dan search
const getRiwayatPelaporan = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      kategori = '', 
      search = '' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = { 
      status: { [Op.notIn]: ['menunggu'] } 
    };

    // Filter berdasarkan status
    if (status && status !== 'Semua Status') {
      const statusMap = { 
        'Selesai': 'selesai', 
        'Ditolak': 'ditolak', 
        'Dalam Penanganan': 'dalam_penanganan', 
        'Divalidasi': 'divalidasi' 
      };
      if (statusMap[status]) {
        whereClause.status = statusMap[status];
      }
    }
    
    // Filter berdasarkan kategori (menggunakan ID atau Nama)
    if (kategori && kategori !== 'Semua Jenis' && kategori !== 'Semua Kategori') {
      // Cek apakah parameter adalah ID (angka) atau nama
      if (/^\d+$/.test(String(kategori))) {
        // Jika angka, treat as ID
        whereClause.kategori_gangguan_id = Number(kategori);
      } else {
        // Jika bukan angka, cari berdasarkan nama_kategori
        const kategoriData = await KategoriGangguan.findOne({
          where: { nama_kategori: kategori },
          attributes: ['id']
        });
        if (kategoriData) {
          whereClause.kategori_gangguan_id = kategoriData.id;
        } else {
          // Jika kategori tidak ditemukan, return empty result
          return res.status(200).json({
            success: true,
            data: {
              riwayat: [],
              summary: {
                selesai: 0,
                ditolak: 0,
                dalam_penanganan: 0,
                divalidasi: 0
              },
              pagination: {
                total: 0,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: 0
              }
            }
          });
        }
      }
    }
    
    // Filter berdasarkan search
    if (search) {
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } }
      ];
    }

    // Query data dengan pagination
    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'pelanggan', 
          attributes: ['nama_lengkap', 'no_langganan'] 
        },
        { 
          model: KategoriGangguan, 
          as: 'kategori', 
          attributes: ['nama_kategori'] 
        },
        { 
          model: Tugas, 
          as: 'tugas', 
          required: false,
          include: [
            { 
              model: User, 
              as: 'teknisi', 
              attributes: ['nama_lengkap'] 
            }
          ] 
        }
      ],
      limit: parseInt(limit), 
      offset: parseInt(offset),
      order: [['updated_at', 'DESC']]
    });

    // Format data untuk response
    const formatted = rows.map(l => {
      const updatedAt = l.updatedAt || l.updated_at;
      return {
        id: l.id,
        pelapor: l.pelanggan?.nama_lengkap || '-',
        judul: l.judul,
        kategori: l.kategori?.nama_kategori || '-',
        status: l.status,
        status_display: getStatusDisplay(l.status),
        teknisi: l.tugas?.teknisi?.nama_lengkap || '-',
        updated_at: updatedAt,
        updated_at_formatted: formatDateTime(updatedAt),
        prioritas: l.prioritas,
        deskripsi: l.deskripsi,
        lokasi: l.lokasi
      };
    });

    // Hitung summary untuk semua data (tanpa filter pagination)
    const summary = {
      selesai: await Laporan.count({ where: { status: 'selesai' } }),
      ditolak: await Laporan.count({ where: { status: 'ditolak' } }),
      dalam_penanganan: await Laporan.count({ where: { status: 'dalam_penanganan' } }),
      divalidasi: await Laporan.count({ where: { status: 'divalidasi' } })
    };

    return res.status(200).json({
      success: true,
      data: { 
        riwayat: formatted, 
        summary, 
        pagination: { 
          total: count, 
          page: parseInt(page), 
          limit: parseInt(limit), 
          totalPages: Math.ceil(count / limit) 
        } 
      }
    });
  } catch (error) {
    console.error('Get riwayat pelaporan error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + error.message 
    });
  }
};

// Get detail riwayat laporan by ID
const getRiwayatDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await Laporan.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'pelanggan', 
          attributes: ['id', 'nama_lengkap', 'no_langganan', 'no_telp', 'email', 'alamat'] 
        },
        { 
          model: KategoriGangguan, 
          as: 'kategori', 
          attributes: ['id', 'nama_kategori'] 
        },
        { 
          model: Tugas, 
          as: 'tugas', 
          required: false,
          include: [
            { 
              model: User, 
              as: 'teknisi', 
              attributes: ['id', 'nama_lengkap', 'username', 'no_telp', 'email'] 
            }
          ] 
        }
      ]
    });
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    
    const createdAt = laporan.createdAt || laporan.created_at;
    const updatedAt = laporan.updatedAt || laporan.updated_at;
    
    return res.status(200).json({
      success: true,
      data: {
        id: laporan.id,
        pelanggan: laporan.pelanggan,
        kategori: laporan.kategori,
        judul: laporan.judul,
        deskripsi: laporan.deskripsi,
        lokasi: laporan.lokasi,
        nomor_telepon: laporan.nomor_telepon,
        foto: laporan.foto,
        prioritas: laporan.prioritas,
        status: laporan.status,
        status_display: getStatusDisplay(laporan.status),
        tanggal_kejadian: laporan.tanggal_kejadian,
        created_at: createdAt,
        created_at_formatted: formatDateTime(createdAt),
        updated_at: updatedAt,
        updated_at_formatted: formatDateTime(updatedAt),
        tugas: laporan.tugas ? {
          id: laporan.tugas.id,
          status: laporan.tugas.status,
          judul_tugas: laporan.tugas.judul_tugas,
          deskripsi_tugas: laporan.tugas.deskripsi_tugas,
          catatan_teknisi: laporan.tugas.catatan_teknisi,
          tanggal_ditugaskan: laporan.tugas.tanggal_ditugaskan,
          tanggal_diambil: laporan.tugas.tanggal_diambil,
          tanggal_selesai: laporan.tugas.tanggal_selesai,
          teknisi: laporan.tugas.teknisi
        } : null
      }
    });
  } catch (error) {
    console.error('Get riwayat detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

module.exports = { 
  getRiwayatPelaporan,
  getRiwayatDetail 
};
