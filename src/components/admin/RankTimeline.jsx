import { Shield, Lock, Calendar, Pencil, Trash2 } from 'lucide-react';
import { useAdminLanguage } from '../../context/LanguageContext';

const DEFAULT_RANKS = [
  { name: 'Guest', labelKey: 'guest', color: 'gray', icon: '🌱', descriptionKey: 'guestDesc' },
  { name: 'Explorer', labelKey: 'explorer', color: 'blue', icon: '🔍', descriptionKey: 'explorerDesc' },
  { name: 'Guardian', labelKey: 'guardian', color: 'emerald', icon: '🛡️', descriptionKey: 'guardianDesc' },
  { name: 'Hero', labelKey: 'hero', color: 'amber', icon: '⭐', descriptionKey: 'heroDesc' },
];

const colorMap = {
  gray: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', line: 'bg-gray-200' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', line: 'bg-blue-200' },
  emerald: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', line: 'bg-emerald-200' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', line: 'bg-amber-200' },
  violet: { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-700', line: 'bg-violet-200' },
  rose: { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-700', line: 'bg-rose-200' },
};

const customColors = ['violet', 'rose', 'blue', 'emerald', 'amber'];

function buildRankList(rankLogs) {
  const defaultByKey = new Map(DEFAULT_RANKS.map((rank) => [rank.name.toLowerCase(), rank]));
  const logByKey = new Map(
    rankLogs.map((log) => [String(log.rank || log.rank_name || '').trim().toLowerCase(), log])
  );
  const rankList = DEFAULT_RANKS.map((rank) => ({
    ...rank,
    id: logByKey.get(rank.name.toLowerCase())?.id,
    is_default: true,
  }));

  rankLogs.forEach((log) => {
    const rankName = String(log.rank || log.rank_name || '').trim();
    const rankKey = rankName.toLowerCase();
    if (!rankName || defaultByKey.has(rankKey) || rankList.some((rank) => rank.name.toLowerCase() === rankKey)) return;

    const customIndex = rankList.length - DEFAULT_RANKS.length;
    rankList.push({
      id: log.id,
      name: rankName,
      color: customColors[customIndex % customColors.length],
      icon: '🏅',
      custom: true,
      is_default: Boolean(log.is_default),
    });
  });

  return rankList;
}

export default function RankTimeline({ rankLogs = [], summary = false, onEdit, onDelete }) {
  const { t } = useAdminLanguage();
  const ranks = buildRankList(rankLogs);
  const achievedRanks = {};
  rankLogs.forEach((log) => {
    achievedRanks[String(log.rank).toLowerCase()] = log.achieved_at || true;
  });

  const countByRank = Object.fromEntries(
    rankLogs.map((log) => [String(log.rank).toLowerCase(), Number(log.achieved_count || 0)])
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-900">{summary ? t('rankLogs') : t('rankHistory')}</h3>
      </div>

      <div className="space-y-0">
        {ranks.map((rank, index) => {
          const rankKey = rank.name.toLowerCase();
          const achieved = summary ? countByRank[rankKey] > 0 : !!achievedRanks[rankKey];
          const achievedDate = achievedRanks[rankKey];
          const c = colorMap[rank.color];
          const isLast = index === ranks.length - 1;
          const summaryCount = countByRank[rankKey] || 0;
          const highlighted = summary || achieved;
          const rankLabel = rank.labelKey ? t(rank.labelKey) : rank.name;
          const description = rank.descriptionKey ? t(rank.descriptionKey) : (rank.description_en || rank.description_id || t('customRankDesc'));

          return (
            <div key={rank.name} className={`flex gap-4 ${summary ? `rounded-2xl border p-4 mb-3 ${c.bg} ${c.border}` : ''}`}>
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  summary
                    ? `bg-white ${c.border} border-2 shadow-sm`
                    : achieved ? `${c.bg} ${c.border} border-2` : 'bg-gray-50 border border-gray-200'
                }`}>
                  {highlighted ? rank.icon : <Lock className="w-4 h-4 text-gray-300" />}
                </div>
                {!isLast && !summary && (
                  <div className={`w-0.5 h-12 ${achieved ? c.line : 'bg-gray-100'}`} />
                )}
              </div>

              {/* Content */}
              <div className="pb-8 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-semibold text-sm ${highlighted ? c.text : 'text-gray-400'}`}>
                    {rankLabel}
                  </h4>
                  {achieved && !summary && (
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${c.bg} ${c.text}`}>
                      {t('achieved')}
                    </span>
                  )}
                  {summary && (
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-white text-gray-700">
                      {t('achievedByUsers', { count: summaryCount })}
                    </span>
                  )}
                  {!achieved && !summary && (
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-400">
                      {t('locked')}
                    </span>
                  )}
                  {summary && rank.custom && !rank.is_default && (
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit?.(rank)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 border border-gray-200 hover:text-emerald-700 hover:border-emerald-200"
                        title={t('editRank')}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(rank)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 border border-gray-200 hover:text-red-600 hover:border-red-200"
                        title={t('deleteRank')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                {!summary && achieved && achievedDate && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {t('achievedOn')} {new Date(achievedDate).toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
