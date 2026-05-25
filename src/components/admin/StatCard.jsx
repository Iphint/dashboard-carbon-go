export default function StatCard({ title, value, icon: Icon, color = 'emerald', subtitle }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${c.border} hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 leading-tight">{title}</p>
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className={`w-5 h-5 ${c.text}`} />}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
