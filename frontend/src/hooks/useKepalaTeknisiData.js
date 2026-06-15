// Fungsi: Custom hook React untuk mengambil dan mengelola state reusable.
// frontend/src/hooks/useKepalaTeknisiData.js
import { useMemo, useState, useEffect, useCallback } from "react";
import { 
  getKepalaTeknisiDashboardStats, 
  getLaporanMasukKT, 
  getRiwayatPelaporanKT, 
  getAnalisisKinerjaKT, 
  getLaporanDaruratKT,
  getCurrentUser
} from "../services/api";

const initialFilters = {
  status: "Semua Status",
  kategori: "Semua Jenis",
  prioritas: "Semua Prioritas",
  search: "",
};

const initialHistoryFilters = {
  status: "Semua Status",
  kategori: "Semua Jenis",
  search: "",
};

const initialEmergencyFilters = {
  jenis: "Semua Kendala",
  status: "Semua Status",
  search: "",
};

export default function useKepalaTeknisiData() {
  const [dashboard, setDashboard] = useState({
    stats: [
      { value: 0, label: "Total Pelanggan", icon: "users", color: "blue" },
      { value: 0, label: "Total Teknisi", icon: "team", color: "purple" },
      { value: 0, label: "Total Laporan", icon: "report", color: "green" },
      { value: 0, label: "Laporan Selesai", icon: "check", color: "blue" },
      { value: 0, label: "Gangguan Aktif", icon: "alert", color: "orange" },
    ],
    monthlyReports: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    statusDistribution: [
      { label: "Selesai", value: 0, color: "#4bb264" },
      { label: "Dalam Proses", value: 0, color: "#ef4b45" },
      { label: "Ditolak", value: 0, color: "#ff9d25" },
    ],
  });

  const [filters, setFilters] = useState(initialFilters);
  const [historyFilters, setHistoryFilters] = useState(initialHistoryFilters);
  const [emergencyFilters, setEmergencyFilters] = useState(initialEmergencyFilters);
  const [emergencySummary, setEmergencySummary] = useState({
    stats: [
      { value: 0, label: "Total Laporan Darurat", icon: "alert", color: "blue" },
      { value: 0, label: "Laporan Baru", icon: "clock", color: "red" },
      { value: 0, label: "Selesai Ditangani", icon: "check", color: "green" },
    ],
  });
  const [performance, setPerformance] = useState({
    successRate: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    dateRange: "",
  });
  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    telepon: "",
    idAdmin: "",
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getKepalaTeknisiDashboardStats();
        if (res.success && res.data) {
          setDashboard(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };
    fetchDashboard();
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCurrentUser();
        if (res.success && res.data) {
          setProfile({
            nama: res.data.nama_lengkap || "",
            email: res.data.email || "",
            telepon: res.data.no_telp || "",
            idAdmin: res.data.username || res.data.id?.toString() || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch performance data
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await getAnalisisKinerjaKT();
        if (res.success && res.data) {
          setPerformance(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
      }
    };
    fetchPerformance();
  }, []);

  // Fetch emergency summary
  useEffect(() => {
    const fetchEmergencySummary = async () => {
      try {
        const res = await getLaporanDaruratKT({ limit: 1 });
        if (res.success && res.data && res.data.summary) {
          setEmergencySummary({
            stats: [
              { value: res.data.summary.total || 0, label: "Total Laporan Darurat", icon: "alert", color: "blue" },
              { value: res.data.summary.baru || 0, label: "Laporan Baru", icon: "clock", color: "red" },
              { value: res.data.summary.selesai || 0, label: "Selesai Ditangani", icon: "check", color: "green" },
            ],
          });
        }
      } catch (err) {
        console.error("Failed to fetch emergency summary:", err);
      }
    };
    fetchEmergencySummary();
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const updateHistoryFilter = useCallback((key, value) => {
    setHistoryFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const updateEmergencyFilter = useCallback((key, value) => {
    setEmergencyFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const updateProfile = useCallback((newProfile) => {
    setProfile(newProfile);
  }, []);

  return {
    dashboard,
    emergencySummary,
    performance,
    filters,
    historyFilters,
    emergencyFilters,
    profile,
    setProfile: updateProfile,
    updateFilter,
    updateHistoryFilter,
    updateEmergencyFilter,
  };
}