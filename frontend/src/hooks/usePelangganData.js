// Aplikasi Pelanggan - SIGAP
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addPelangganLaporanComment,
  deletePelangganLaporan,
  getPelangganLaporan,
  getPelangganLaporanCount,
  getPublicPelangganLaporan,
  togglePelangganLaporanLike,
} from "../services/api";

const MY_REPORT_LIMIT = 10;

const statusLabels = {
  menunggu: "Belum Diproses",
  divalidasi: "Divalidasi",
  ditolak: "Ditolak",
  dalam_penanganan: "Sedang Diproses",
  selesai: "Selesai",
};

const formatReportDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  const timeText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  const dateText = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return `Pukul ${timeText}, Tanggal ${dateText}`;
};

const mapReport = (report, { personal = false } = {}) => {
  const isAnonymous = !personal && (report.opsi_privasi === "anonim" || report.opsi_privasi === "anonim_rahasia");

  return {
    id: report.id,
    author: isAnonymous ? "Anonim" : report.pelanggan?.nama_lengkap || "Pelanggan",
    avatar: isAnonymous ? "" : report.pelanggan?.foto_base64 || "",
    date: formatReportDate(report.created_at || report.createdAt),
    location: report.lokasi || "-",
    title: report.judul || "Laporan Gangguan",
    category: report.sub_kategori || report.kategori?.nama_kategori || "Laporan Gangguan",
    excerpt: report.deskripsi || report.judul || "Tidak ada deskripsi laporan.",
    photo: report.foto || "",
    status: statusLabels[report.status] || report.status || "Belum Diproses",
    rawStatus: report.status || "menunggu",
    likes: report.like_count || 0,
    comments: report.comment_count || 0,
    liked: Boolean(report.liked),
  };
};

export default function usePelangganData({ authenticated = false } = {}) {
  const [profile, setProfile] = useState({
    nama: "",
    username: "",
    bio: "",
    noLangganan: "",
    email: "",
    telepon: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    foto: "",
  });
  const [publicReportData, setPublicReportData] = useState({
    reports: [],
    totalReports: 0,
    totalReportCount: 0,
  });
  const [myReportData, setMyReportData] = useState({
    reports: [],
    totalReports: 0,
  });
  const [visibleLimit, setVisibleLimit] = useState(10);
  const [publicReportsLoading, setPublicReportsLoading] = useState(true);
  const [myReportsLoading, setMyReportsLoading] = useState(false);
  const [loadingMoreReports, setLoadingMoreReports] = useState(false);
  const [myReportPagination, setMyReportPagination] = useState({
    page: 1,
    limit: MY_REPORT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const loadReportData = useCallback(async (limit) => {
    const [response, countResponse] = await Promise.all([
      getPublicPelangganLaporan({ page: 1, limit }),
      getPelangganLaporanCount(),
    ]);
    const laporan = response?.data?.laporan || [];
    const total = response?.data?.pagination?.total ?? laporan.length;
    const totalReportCount = countResponse?.data?.total ?? total;

    return {
      reports: laporan.map(mapReport),
      totalReports: total,
      totalReportCount,
    };
  }, []);

  const loadMyReportData = useCallback(async (page = 1) => {
    const response = await getPelangganLaporan({ page, limit: MY_REPORT_LIMIT });
    const laporan = response?.data?.laporan || [];
    const pagination = response?.data?.pagination || {};

    return {
      reports: laporan.map((report) => mapReport(report, { personal: true })),
      totalReports: response?.data?.pagination?.total ?? laporan.length,
      pagination: {
        page: pagination.page || page,
        limit: pagination.limit || MY_REPORT_LIMIT,
        total: pagination.total ?? laporan.length,
        totalPages: pagination.totalPages || 1,
      },
    };
  }, []);

  const refreshPublicReports = async ({ silent = false, limit = visibleLimit } = {}) => {
    try {
      const nextData = await loadReportData(limit);
      setPublicReportData(nextData);
    } catch (error) {
      if (!silent) {
        console.error("Gagal memuat laporan publik:", error);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadPublicReports = async () => {
      try {
        setPublicReportsLoading(true);
        const nextData = await loadReportData(visibleLimit);

        if (!ignore) {
          setPublicReportData(nextData);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal memuat laporan publik:", error);
        }
      } finally {
        if (!ignore) setPublicReportsLoading(false);
      }
    };

    loadPublicReports();

    return () => {
      ignore = true;
    };
  }, [loadReportData, visibleLimit]);

  useEffect(() => {
    let ignore = false;

    const loadReports = async () => {
      if (!authenticated) {
        setMyReportData({ reports: [], totalReports: 0 });
        setMyReportPagination({
          page: 1,
          limit: MY_REPORT_LIMIT,
          total: 0,
          totalPages: 1,
        });
        return;
      }

      try {
        setMyReportsLoading(true);
        const nextData = await loadMyReportData(1);

        if (!ignore) {
          setMyReportData(nextData);
          setMyReportPagination(nextData.pagination);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal memuat laporan pelanggan:", error);
        }
      } finally {
        if (!ignore) setMyReportsLoading(false);
      }
    };

    loadReports();

    return () => {
      ignore = true;
    };
  }, [authenticated, loadMyReportData]);

  const refreshMyReports = async ({ silent = false, page = myReportPagination.page } = {}) => {
    if (!authenticated) {
      setMyReportData({ reports: [], totalReports: 0 });
      setMyReportPagination({
        page: 1,
        limit: MY_REPORT_LIMIT,
        total: 0,
        totalPages: 1,
      });
      return;
    }

    try {
      if (!silent) setMyReportsLoading(true);
      const nextData = await loadMyReportData(page);
      setMyReportData(nextData);
      setMyReportPagination(nextData.pagination);
    } catch (error) {
      if (!silent) {
        console.error("Gagal memuat laporan pelanggan:", error);
      }
    } finally {
      if (!silent) setMyReportsLoading(false);
    }
  };

  const loadMoreReports = async () => {
    const nextLimit = visibleLimit + 10;
    setLoadingMoreReports(true);
    try {
      const nextData = await loadReportData(nextLimit);
      setVisibleLimit(nextLimit);
      setPublicReportData(nextData);
    } finally {
      setLoadingMoreReports(false);
    }
  };

  const changeMyReportPage = async (page) => {
    const nextPage = Math.min(Math.max(Number(page) || 1, 1), myReportPagination.totalPages || 1);
    await refreshMyReports({ page: nextPage });
  };

  const deleteReport = async (id) => {
    const response = await deletePelangganLaporan(id);
    const nextPage = myReportPagination.page > 1 && myReportData.reports.length === 1
      ? myReportPagination.page - 1
      : myReportPagination.page;

    await Promise.all([
      refreshMyReports({ page: nextPage, silent: true }),
      refreshPublicReports({ silent: true }),
    ]);

    return response;
  };

  const likeReport = async (id) => {
    const response = await togglePelangganLaporanLike(id);
    const nextCounts = response?.data || {};

    setPublicReportData((current) => ({
      ...current,
      reports: current.reports.map((report) => (
        report.id === id
          ? { ...report, likes: nextCounts.like_count ?? report.likes, liked: nextCounts.liked ?? report.liked }
          : report
      )),
    }));

    return response;
  };

  const commentReport = async (id, komentar) => {
    const response = await addPelangganLaporanComment(id, komentar);
    const nextCounts = response?.data || {};

    setPublicReportData((current) => ({
      ...current,
      reports: current.reports.map((report) => (
        report.id === id
          ? { ...report, comments: nextCounts.comment_count ?? report.comments }
          : report
      )),
    }));

    return response;
  };

  const reports = useMemo(() => publicReportData.reports, [publicReportData.reports]);
  const myReports = useMemo(() => myReportData.reports, [myReportData.reports]);

  return {
    profile,
    setProfile,
    reports,
    myReports,
    totalReports: publicReportData.totalReports,
    totalMyReports: myReportData.totalReports,
    totalReportCount: publicReportData.totalReportCount,
    publicReportsLoading,
    myReportsLoading,
    myReportPagination,
    canViewMoreReports: publicReportData.totalReports > 10 && reports.length < publicReportData.totalReports,
    loadingMoreReports,
    loadMoreReports,
    changeMyReportPage,
    deleteReport,
    likeReport,
    commentReport,
    refreshPublicReports,
    refreshMyReports,
  };
}
