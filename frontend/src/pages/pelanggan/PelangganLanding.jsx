// Landing page publik Pelanggan - SIGAP
import {
  HeroSection,
  LatestReportsSection,
  MainFeaturesSection,
  ReportCountBanner,
  ReportFlowPanel,
  ValuesSection,
} from "./PelangganHome";

export default function PelangganLanding({
  reports,
  totalReports = 0,
  totalReportCount = 0,
  canViewMoreReports = false,
  loadingMoreReports = false,
  onReportClick,
  onViewMoreReports,
  onLikeReport,
  onCommentReport,
  onRequireLogin,
}) {
  return (
    <>
      <HeroSection showActions={false} />
      <ValuesSection />
      <MainFeaturesSection />
      <ReportFlowPanel />
      <ReportCountBanner total={totalReportCount} />
      <LatestReportsSection
        reports={reports}
        totalReports={totalReports}
        canViewMoreReports={canViewMoreReports}
        loadingMoreReports={loadingMoreReports}
        onReportClick={onReportClick}
        onViewMoreReports={onViewMoreReports}
        onLikeReport={onLikeReport}
        onCommentReport={onCommentReport}
        onRequireLogin={onRequireLogin}
      />
    </>
  );
}
