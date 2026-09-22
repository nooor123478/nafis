import { useEffect } from 'react';
import { StudentAttempt } from '../types';
import { Trophy, RotateCcw, Home, Award, CheckCircle, XCircle, Clock, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationFanfare } from '../utils/audio';

interface ActivityResultsProps {
  attempt: StudentAttempt;
  onRetry: () => void;
  onGoHome: () => void;
  onGoLeaderboard: () => void;
}

export default function ActivityResults({
  attempt,
  onRetry,
  onGoHome,
  onGoLeaderboard,
}: ActivityResultsProps) {

  useEffect(() => {
    // Grand celebration confetti
    try {
      playCelebrationFanfare();
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FBBF24', '#A855F7', '#34D399', '#38BDF8']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FBBF24', '#A855F7', '#34D399', '#38BDF8']
        });
        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      // Ignore
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins} دقيقة و ${secs} ثانية`;
    return `${secs} ثانية`;
  };

  const getRankBadge = () => {
    if (attempt.percentage >= 90) return { title: '🏆 عبقري العلوم الأسطوري', color: 'text-amber-500 bg-amber-50 border-amber-300' };
    if (attempt.percentage >= 75) return { title: '⭐ بطل التحدي المتميز', color: 'text-purple-600 bg-purple-50 border-purple-300' };
    if (attempt.percentage >= 50) return { title: '🌱 مستكشف واعد ومجتهد', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' };
    return { title: '💪 محاولة جيدة، تدرب أكثر', color: 'text-blue-600 bg-blue-50 border-blue-300' };
  };

  const rank = getRankBadge();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div 
        id="results-card"
        className="rounded-3xl bg-white text-slate-800 p-6 sm:p-10 shadow-2xl border-4 border-purple-200/80 text-center relative overflow-hidden"
      >
        {/* Top Trophy Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 text-purple-950 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-amber-400/30 animate-bounce">
          🏆
        </div>

        {/* Celebration Title */}
        <p className="text-amber-500 font-extrabold text-lg mt-4">
          🎉 أحسنت صنعاً يا بطل!
        </p>
        
        <h1 className="text-3xl sm:text-4xl font-black text-purple-950 mt-1 font-['Changa',sans-serif]">
          انتهى التحدي بنجاح
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          نشاط: {attempt.activityTitle}
        </p>

        {/* Rank Badge */}
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-black ${rank.color}`}>
          <Award className="w-4 h-4" />
          <span>{rank.title}</span>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-right">
          
          {/* Total Points */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-900">
              <span className="text-xs font-bold">مجموع النقاط</span>
              <span className="text-base">⭐</span>
            </div>
            <p className="text-2xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
              {attempt.score} <span className="text-xs font-bold text-slate-400">/ {attempt.maxScore}</span>
            </p>
          </div>

          {/* Correct Answers */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-xs font-bold">إجابات صحيحة</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2 font-['Changa',sans-serif]">
              {attempt.correctAnswersCount}
            </p>
          </div>

          {/* Wrong Answers */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-900">
              <span className="text-xs font-bold">إجابات خاطئة</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-600 mt-2 font-['Changa',sans-serif]">
              {attempt.wrongAnswersCount}
            </p>
          </div>

          {/* Percentage */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-900">
              <span className="text-xs font-bold">النسبة المئوية</span>
              <Percent className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-700 mt-2 font-['Changa',sans-serif]">
              {attempt.percentage}%
            </p>
          </div>

          {/* Time Taken */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-xs font-bold">الزمن المستغرق</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-base sm:text-lg font-black text-amber-900 mt-2">
              {formatTime(attempt.timeSpentSeconds)}
            </p>
          </div>

          {/* Student Name */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-xs font-bold">المتسابق</span>
              <span className="text-base">👤</span>
            </div>
            <p className="text-sm font-black text-slate-800 mt-2 truncate">
              {attempt.studentName}
            </p>
          </div>

        </div>

        {/* Action Buttons as requested */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            id="btn-retry-activity"
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔄 إعادة النشاط</span>
          </button>

          <button
            id="btn-view-leaderboard"
            onClick={onGoLeaderboard}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm shadow-md shadow-amber-400/30 transition-all hover:scale-105 active:scale-95"
          >
            <Trophy className="w-4 h-4" />
            <span>🏆 لوحة المتصدرين</span>
          </button>

          <button
            id="btn-go-home"
            onClick={onGoHome}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>🏠 العودة للرئيسية</span>
          </button>
        </div>

      </div>
    </div>
  );
}
