import { Target, Award, Sword, CheckCircle2, Lock, Calendar } from 'lucide-react';
import EmptyState from './EmptyState';

function ProgressBar({ value = 0, max = 100, color = 'emerald' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorClass = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  }[color] || 'bg-emerald-500';

  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MilestoneCard({ milestone }) {
  const achieved = milestone.achieved;
  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${
      achieved
        ? 'border-emerald-200 bg-emerald-50/50 hover:shadow-md'
        : 'border-gray-100 bg-white hover:border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          achieved ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          {achieved ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${achieved ? 'text-emerald-800' : 'text-gray-700'}`}>
            {milestone.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{milestone.description || 'Complete this milestone'}</p>
          {achieved && milestone.achieved_at && (
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <Calendar className="w-3 h-3" />
              {new Date(milestone.achieved_at).toLocaleDateString('id-ID')}
            </div>
          )}
          {!achieved && milestone.progress !== undefined && (
            <div className="mt-2">
              <ProgressBar value={milestone.progress} max={milestone.target || 100} color="emerald" />
              <p className="text-[11px] text-gray-400 mt-1">{milestone.progress}/{milestone.target || 100}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }) {
  const achieved = badge.achieved;
  return (
    <div className={`rounded-xl border p-4 text-center transition-all duration-200 ${
      achieved
        ? 'border-amber-200 bg-amber-50/50 hover:shadow-md'
        : 'border-gray-100 bg-white hover:border-gray-200'
    }`}>
      <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-2 ${
        achieved ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        {achieved ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
      </div>
      <p className={`font-medium text-sm ${achieved ? 'text-amber-800' : 'text-gray-600'}`}>
        {badge.name}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{badge.requirement || 'Meet the requirements'}</p>
      {achieved && badge.achieved_at && (
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-amber-600">
          <Calendar className="w-3 h-3" />
          {new Date(badge.achieved_at).toLocaleDateString('id-ID')}
        </div>
      )}
    </div>
  );
}

function QuestCard({ quest }) {
  const completed = quest.completed;
  const statusColor = completed ? 'emerald' : quest.active ? 'blue' : 'gray';
  const statusText = completed ? 'Completed' : quest.active ? 'Active' : 'Not Started';

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
      completed ? 'border-emerald-200 bg-emerald-50/30' :
      quest.active ? 'border-blue-200 bg-blue-50/30' :
      'border-gray-100 bg-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          completed ? 'bg-emerald-500 text-white' :
          quest.active ? 'bg-blue-500 text-white' :
          'bg-gray-100 text-gray-400'
        }`}>
          <Sword className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm text-gray-800">{quest.name}</p>
            <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-700`}>
              {statusText}
            </span>
          </div>
          <p className="text-xs text-gray-400">{quest.description || 'Complete this quest'}</p>
          {quest.progress !== undefined && !completed && (
            <div className="mt-2">
              <ProgressBar value={quest.progress} max={quest.target || 100} color={statusColor} />
              <p className="text-[11px] text-gray-400 mt-1">{quest.progress}/{quest.target || 100}</p>
            </div>
          )}
          {completed && quest.completed_at && (
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <Calendar className="w-3 h-3" />
              {new Date(quest.completed_at).toLocaleDateString('id-ID')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProgressSection({ milestones = [], badges = [], quests = [] }) {
  return (
    <div className="space-y-8">
      {/* Milestones */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">Milestones</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {milestones.filter(m => m.achieved).length}/{milestones.length}
          </span>
        </div>
        {milestones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {milestones.map((m, i) => <MilestoneCard key={m.id || i} milestone={m} />)}
          </div>
        ) : (
          <EmptyState title="No Milestones" description="No milestones data available." icon={Target} />
        )}
      </div>

      {/* Eco Badges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-gray-900">Eco Badges</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {badges.filter(b => b.achieved).length}/{badges.length}
          </span>
        </div>
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {badges.map((b, i) => <BadgeCard key={b.id || i} badge={b} />)}
          </div>
        ) : (
          <EmptyState title="No Badges" description="No badges data available." icon={Award} />
        )}
      </div>

      {/* Active Quests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sword className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Quests</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {quests.filter(q => q.completed).length}/{quests.length}
          </span>
        </div>
        {quests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quests.map((q, i) => <QuestCard key={q.id || i} quest={q} />)}
          </div>
        ) : (
          <EmptyState title="No Quests" description="No quests data available." icon={Sword} />
        )}
      </div>
    </div>
  );
}
