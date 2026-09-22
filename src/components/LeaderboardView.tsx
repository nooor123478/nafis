import { useState } from 'react';
import { LeaderboardUser, GradeId } from '../types';
import { Trophy, Medal, Award, Flame, Clock, CheckCircle2 } from 'lucide-react';

interface LeaderboardViewProps {
  leaderboard: LeaderboardUser[];
}

export default function LeaderboardView({ leaderboard }: LeaderboardViewProps) {
  const [sortBy, setSortBy] = useState<'points' | 'correct' | 'time'>('points');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  const filtered = leaderboard.filter((user) => {
    if (filterGrade !== 'all' && user.gradeId !== Number(filterGrade)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'points') return b.totalPoints - a.totalPoints;
    if (sortBy === 'correct') return b.correctAnswers - a.correctAnswers;
    if (sortBy === 'time') return a.fastestTimeSeconds - b.fastestTimeSeconds;
    return 0;
  });

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const restStudents = sorted.slice(3);

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      
      {/* Title & Filters */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
          <Trophy className="w-4 h-4" />
          <span>منصة التتويج وشرف التحديات</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-['Changa',sans-serif]">
          🏆 لوحة المتصدرين وأبطال العلوم
        </h1>
        <p className="text-xs sm:text-sm text-purple-200">
          ترتيب أبطال التحديات في مختلف الصفوف وفق النقاط والإجابات الصحيحة والسرعة
        </p>
      </div>

      {/* Filter and Sort Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-200">الترتيب حسب:</span>
          <button
            onClick={() => setSortBy('points')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              sortBy === 'points' ? 'bg-amber-400 text-purple-950 shadow-md' : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            ⭐ النقاط
          </button>
          <button
            onClick={() => setSortBy('correct')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              sortBy === 'correct' ? 'bg-amber-400 text-purple-950 shadow-md' : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            ✅ الإجابات الصحيحة
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              sortBy === 'time' ? 'bg-amber-400 text-purple-950 shadow-md' : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            ⏱️ الزمن الأسرع
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-200">الصف:</span>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-400/30 text-xs font-bold text-white"
          >
            <option value="all">جميع الصفوف</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>الصف {n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top1 && (
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto text-center">
            
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={top2.avatar}
                    alt={top2.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-slate-300 shadow-xl"
                  />
                  <span className="absolute -bottom-2 -left-1 w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-sm flex items-center justify-center shadow-md">
                    🥈
                  </span>
                </div>
                <div className="w-full bg-slate-200/95 backdrop-blur-md rounded-t-3xl pt-4 pb-3 px-2 shadow-xl border-t-4 border-slate-300 h-36 flex flex-col justify-between text-slate-800">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black truncate">{top2.name}</h4>
                    <span className="text-[10px] text-slate-500 font-bold block">الصف {top2.gradeId}</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-black text-purple-950 font-['Changa',sans-serif]">
                      ⭐ {top2.totalPoints}
                    </p>
                    <span className="text-[10px] text-slate-500">المركز الثاني</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            <div className="flex flex-col items-center -translate-y-3">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                  👑
                </div>
                <img
                  src={top1.avatar}
                  alt={top1.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-2xl"
                />
                <span className="absolute -bottom-2 -left-1 w-8 h-8 rounded-full bg-amber-400 text-purple-950 font-black text-base flex items-center justify-center shadow-lg">
                  🥇
                </span>
              </div>
              <div className="w-full bg-amber-400 text-purple-950 rounded-t-3xl pt-5 pb-3 px-2 shadow-2xl border-t-4 border-amber-300 h-44 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs sm:text-base font-black truncate">{top1.name}</h4>
                  <span className="text-[11px] text-purple-900 font-extrabold block">الصف {top1.gradeId} • بطل التحدي</span>
                </div>
                <div>
                  <p className="text-base sm:text-xl font-black font-['Changa',sans-serif]">
                    ⭐ {top1.totalPoints}
                  </p>
                  <span className="text-[11px] font-black uppercase tracking-wider">المركز الأول</span>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={top3.avatar}
                    alt={top3.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-amber-700 shadow-xl"
                  />
                  <span className="absolute -bottom-2 -left-1 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                    🥉
                  </span>
                </div>
                <div className="w-full bg-amber-100/95 backdrop-blur-md rounded-t-3xl pt-4 pb-3 px-2 shadow-xl border-t-4 border-amber-600 h-32 flex flex-col justify-between text-amber-950">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black truncate">{top3.name}</h4>
                    <span className="text-[10px] text-amber-800 font-bold block">الصف {top3.gradeId}</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-black text-purple-950 font-['Changa',sans-serif]">
                      ⭐ {top3.totalPoints}
                    </p>
                    <span className="text-[10px] text-amber-800">المركز الثالث</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Rest of Students Ranking List */}
      <div className="rounded-3xl bg-white text-slate-800 p-5 sm:p-6 shadow-2xl border border-purple-100 space-y-3">
        <h3 className="text-sm font-black text-purple-950 border-b border-purple-100 pb-2">
          قائمة الترتيب العام لجميع المشاركين:
        </h3>

        <div className="divide-y divide-slate-100">
          {sorted.map((student, idx) => (
            <div
              key={student.id}
              className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-purple-50/50 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Rank Number */}
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                  idx === 0 ? 'bg-amber-100 text-amber-900 font-black' :
                  idx === 1 ? 'bg-slate-200 text-slate-800' :
                  idx === 2 ? 'bg-amber-50 text-amber-800' :
                  'bg-purple-50 text-purple-900'
                }`}>
                  {idx + 1}
                </span>

                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                />

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-purple-950">{student.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>الصف {student.gradeId}</span>
                    <span>•</span>
                    <span className="text-purple-700 font-bold">{student.badge}</span>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-4 text-xs text-right">
                <div className="hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-bold">صحيحة</span>
                  <span className="text-emerald-700 font-bold">✅ {student.correctAnswers}</span>
                </div>

                <div className="hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-bold">أسرع زمن</span>
                  <span className="text-slate-600 font-bold">⏱️ {student.fastestTimeSeconds} ث</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">مجموع النقاط</span>
                  <span className="text-base font-black text-amber-700 font-['Changa',sans-serif]">
                    ⭐ {student.totalPoints}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
