// Fungsi: Utilitas backend yang dipakai ulang oleh beberapa modul.
// Format date to local string
const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return null;
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:MM':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

// Format waktu relatif (x menit lalu, x jam lalu, x hari lalu)
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} jam lalu`;
  if (diffMinutes < 43200) return `${Math.floor(diffMinutes / 1440)} hari lalu`;
  if (diffMinutes < 525600) return `${Math.floor(diffMinutes / 43200)} bulan lalu`;
  return `${Math.floor(diffMinutes / 525600)} tahun lalu`;
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indonesian format)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return phoneRegex.test(phone);
};

// Get status badge color
const getStatusBadgeColor = (status) => {
  const colors = {
    'menunggu': 'yellow',
    'divalidasi': 'blue',
    'ditolak': 'red',
    'dalam_penanganan': 'orange',
    'selesai': 'green'
  };
  return colors[status] || 'gray';
};

// Get status display name
const getStatusDisplayName = (status) => {
  const names = {
    'menunggu': 'Menunggu',
    'divalidasi': 'Divalidasi',
    'ditolak': 'Ditolak',
    'dalam_penanganan': 'Dalam Penanganan',
    'selesai': 'Selesai'
  };
  return names[status] || status;
};

// Get priority badge color
const getPriorityBadgeColor = (priority) => {
  const colors = {
    'rendah': 'green',
    'sedang': 'yellow',
    'tinggi': 'red'
  };
  return colors[priority] || 'gray';
};

module.exports = {
  formatDate,
  formatRelativeTime,
  generateRandomString,
  isValidEmail,
  isValidPhoneNumber,
  getStatusBadgeColor,
  getStatusDisplayName,
  getPriorityBadgeColor
};