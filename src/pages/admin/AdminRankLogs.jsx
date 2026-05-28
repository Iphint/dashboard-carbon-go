import { useState, useEffect, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import RankTimeline from '../../components/admin/RankTimeline';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { getRankLogs } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

export default function AdminRankLogs() {
  const { t } = useAdminLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRankLogs();
      setLogs(res.data?.logs || res.data || []);
    } catch {
      setLogs([]);
      setError(t('fetchRankLogsError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <CardSkeleton count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!logs.length) return (
    <div>
      <RankTimeline rankLogs={[]} summary />
      <div className="mt-4">
        <EmptyState title={t('noRankLogs')} description={t('noRankLogsDesc')} icon={TrendingUp} />
      </div>
    </div>
  );

  return <RankTimeline rankLogs={logs} summary />;
}
