import { Shield, Lock, Calendar, ChevronRight } from 'lucide-react';

const RANKS = [
  { name: 'Guest', color: 'gray', icon: '🌱', description: 'Starting your eco journey' },
  { name: 'Explorer', color: 'blue', icon: '🔍', description: 'Exploring green actions' },
  { name: 'Guardian', color: 'emerald', icon: '🛡️', description: 'Guarding the environment' },
  { name: 'Hero', color: 'amber', icon: '⭐', description: 'Eco Hero status achieved' },
];

const colorMap = {
  gray: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', line: 'bg-gray-200' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', line: 'bg-blue-200' },
  emerald: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', line: 'bg-emerald-200' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', line: 'bg-amber-200' },
};

export default function RankTimeline({ rankLogs = [] }) {
  const achievedRanks = {};
  rankLogs.forEach((log) => {
    achievedRanks[log.rank] = log.achieved_at;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-900">Rank History</h3>
      </div>

      <div className="space-y-0">
        {RANKS.map((rank, index) => {
          const achieved = !!achievedRanks[rank.name];
          const achievedDate = achievedRanks[rank.name];
          const c = colorMap[rank.color];
          const isLast = index === RANKS.length - 1;

          return (
            <div key={rank.name} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  achieved ? `${c.bg} ${c.border} border-2` : 'bg-gray-50 border border-gray-200'
                }`}>
                  {achieved ? rank.icon : <Lock className="w-4 h-4 text-gray-300" />}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-12 ${achieved ? c.line : 'bg-gray-100'}`} />
                )}
              </div>

              {/* Content */}
              <div className="pb-8 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold text-sm ${achieved ? c.text : 'text-gray-400'}`}>
                    {rank.name}
                  </h4>
                  {achieved && (
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${c.bg} ${c.text}`}>
                      Achieved
                    </span>
                  )}
                  {!achieved && (
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-400">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{rank.description}</p>
                {achieved && achievedDate && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(achievedDate).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
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
