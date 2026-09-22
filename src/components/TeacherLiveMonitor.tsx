import { useState, useEffect, useRef } from 'react';
import { Activity, LiveSession, LiveParticipant, LiveQuestionStats, UserProfile, LiveTeam, LiveGameMode } from '../types';
import { liveSocketService } from '../services/liveService';
import { 
  Users, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  Flame, 
  HelpCircle,
  Lightbulb,
  Award,
  BarChart2,
  Share2,
  X,
  Shuffle,
  ShieldAlert,
  UserCheck,
  Crown,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playTeamPointSound, playTeamLeadChangeSound, playCelebrationFanfare } from '../utils/audio';

interface TeacherLiveMonitorProps {
  activity: Activity;
  currentUser: UserProfile;
  onExit: () => void;
  onSaveLiveResults: (session: LiveSession) => void;
}

export default function TeacherLiveMonitor({
  activity,
  currentUser,
  onExit,
  onSaveLiveResults,
}: TeacherLiveMonitorProps) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'teams' | 'monitor' | 'leaderboard'>('teams');
  const [teamCount, setTeamCount] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [leadChangeBanner, setLeadChangeBanner] = useState<{
    newLeaderName: string;
    newLeaderIcon: string;
    newLeaderScore: number;
    previousLeaderName?: string;
  } | null>(null);
  const [recentScoredTeam, setRecentScoredTeam] = useState<{
    teamId: string;
    points: number;
    teamName: string;
  } | null>(null);

  const soundEnabledRef = useRef(soundEnabled);
  const previousLeaderIdRef = useRef<string | null>(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Initialize and connect live socket
  useEffect(() => {
    liveSocketService.connect().then(() => {
      liveSocketService.createSession(activity, currentUser.id, currentUser.name, 'individual');
    }).catch((err) => {
      console.error('Failed to connect to live challenge server:', err);
      setErrorMsg('تعذر الاتصال بخادم التحدي المباشر.');
    });

    const unsubscribe = liveSocketService.subscribe((event) => {
      if (event.type === 'session:created' || event.type === 'session:started' || event.type === 'session:updated') {
        const updatedSession = event.payload.session as LiveSession;
        setSession(updatedSession);

        if (updatedSession.gameMode === 'teams' && updatedSession.teams) {
          const sorted = Object.values(updatedSession.teams).sort((a, b) => b.totalScore - a.totalScore);
          const top = sorted.length > 0 && sorted[0].totalScore > 0 ? sorted[0] : null;
          previousLeaderIdRef.current = top ? top.id : null;
        }

        if (updatedSession.status === 'finished') {
          if (soundEnabledRef.current) {
            playCelebrationFanfare();
          }
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.6 },
          });
        }
      } else if (event.type === 'session:team_scored') {
        // Sound effect for scoring a point in team challenge
        if (soundEnabledRef.current) {
          playTeamPointSound();
        }
        setRecentScoredTeam({
          teamId: event.payload.teamId,
          points: event.payload.pointsAdded,
          teamName: event.payload.teamName,
        });
        setTimeout(() => {
          setRecentScoredTeam((prev) => (prev?.teamId === event.payload.teamId ? null : prev));
        }, 2200);
      } else if (event.type === 'session:team_lead_changed') {
        // Triumphant sound effect when a team overtakes another
        if (soundEnabledRef.current) {
          playTeamLeadChangeSound();
        }
        setLeadChangeBanner({
          newLeaderName: event.payload.newLeaderName,
          newLeaderIcon: event.payload.newLeaderIcon,
          newLeaderScore: event.payload.newLeaderScore,
          previousLeaderName: event.payload.previousLeaderName,
        });
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.4 },
        });
        setTimeout(() => {
          setLeadChangeBanner(null);
        }, 5000);
      } else if (event.type === 'error') {
        setErrorMsg(event.payload.message);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activity, currentUser]);

  const copyPin = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleAddDemoStudents = () => {
    liveSocketService.addDemoStudents();
  };

  const handleToggleGameMode = (mode: LiveGameMode) => {
    liveSocketService.setGameMode(mode, teamCount);
    if (mode === 'teams') {
      setActiveSubTab('teams');
    } else {
      setActiveSubTab('monitor');
    }
  };

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    liveSocketService.setGameMode('teams', count);
  };

  const handleAutoBalance = () => {
    liveSocketService.autoBalanceTeams();
  };

  const handleAssignStudentTeam = (studentId: string, teamId: string) => {
    liveSocketService.assignStudentTeam(studentId, teamId);
  };

  const handleStartChallenge = () => {
    liveSocketService.startChallenge();
  };

  const handleRevealAnswer = () => {
    liveSocketService.revealAnswer();
  };

  const handleNextQuestion = () => {
    liveSocketService.nextQuestion();
  };

  const handleFinishChallenge = () => {
    if (session) {
      liveSocketService.finishChallenge();
    }
  };

  const participantsList = session ? Object.values(session.participants) : [];
  const currentQIndex = session ? session.currentQuestionIndex : 0;
  const currentQ = activity.questions[currentQIndex];
  const qStats = session?.questionStats[currentQIndex] || {
    questionIndex: currentQIndex,
    totalAnswered: 0,
    choiceDistribution: [0, 0, 0, 0],
    correctCount: 0,
    wrongCount: 0,
  };

  const isTeamsMode = session?.gameMode === 'teams';
  const teamsList: LiveTeam[] = (session && session.teams) ? Object.values(session.teams) : [];
  const sortedTeams = [...teamsList].sort((a, b) => b.totalScore - a.totalScore);

  const sortedParticipants = [...participantsList].sort((a, b) => b.score - a.score);
  const totalStudents = participantsList.length;
  const answeredStudents = participantsList.filter((p) => p.hasAnsweredCurrent).length;
  const answerPercentage = totalStudents > 0 ? Math.round((answeredStudents / totalStudents) * 100) : 0;

  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="p-8 rounded-3xl bg-red-950/40 border border-red-500/30 text-white space-y-4">
          <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-black font-['Changa',sans-serif]">خطأ في جلسة التحدي المباشر</h2>
          <p className="text-red-200 text-sm">{errorMsg}</p>
          <button
            onClick={onExit}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm"
          >
            العودة للوحة المعلم
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-24 text-center space-y-4 text-white">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-black text-lg font-['Changa',sans-serif]">جاري إنشاء غرفة التحدي المباشر وتجهيز الخادم...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Bar Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2D124D] via-[#4A1E82] to-[#2D124D] border border-purple-400/30 p-5 sm:p-6 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              بث مباشر في الفصل • Live Challenge
            </span>
            <span className="text-xs bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-400/30 font-bold">
              الصف {activity.gradeId}
            </span>
            {isTeamsMode ? (
              <span className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-2.5 py-0.5 rounded-full font-black border border-cyan-300/40 flex items-center gap-1 shadow-sm">
                <Users className="w-3 h-3" />
                نمط تحدي الفرق 👥
              </span>
            ) : (
              <span className="text-xs bg-purple-800/80 text-purple-200 px-2.5 py-0.5 rounded-full font-bold border border-purple-400/20">
                تنافس فردي 👤
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-['Changa',sans-serif]">
            {activity.title}
          </h1>
        </div>

        {/* PIN Code Box & Audio Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Sound Effects Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black shadow-md ${
              soundEnabled
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 hover:bg-amber-400/30'
                : 'bg-purple-950/70 border-purple-400/20 text-purple-300/60 hover:bg-purple-900/60'
            }`}
            title={soundEnabled ? 'المؤثرات الصوتية مفعّلة (انقر للكتم)' : 'المؤثرات الصوتية مكتومة (انقر للتشغيل)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">أصوات التحدي مفعّلة</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-purple-300/60" />
                <span className="hidden sm:inline">الأصوات مكتومة</span>
              </>
            )}
          </button>

          <div className="bg-purple-950/80 border-2 border-amber-400/60 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-inner">
            <div>
              <span className="text-[10px] text-amber-300/80 font-bold block">رمز انضمام الطلاب (PIN)</span>
              <span className="text-2xl sm:text-3xl font-black font-['Changa',sans-serif] tracking-widest text-amber-400">
                {session.pin}
              </span>
            </div>
            <button
              onClick={copyPin}
              title="نسخ رمز PIN"
              className="p-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors"
            >
              {copiedPin ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={onExit}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-colors"
            title="إنهاء والعودة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* LEAD CHANGE ALERT BANNER */}
      {leadChangeBanner && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 sm:p-5 shadow-2xl border-2 border-amber-300 animate-bounce flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
              {leadChangeBanner.newLeaderIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-200 fill-yellow-200 animate-spin" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-100">
                  انقلبت موازين التحدي! صدارة جديدة للفصل 👑
                </span>
                {leadChangeBanner.previousLeaderName && (
                  <span className="hidden sm:inline text-[11px] bg-black/20 px-2 py-0.5 rounded-full text-amber-100">
                    تجاوز فريق {leadChangeBanner.previousLeaderName}
                  </span>
                )}
              </div>
              <p className="font-black text-lg sm:text-2xl font-['Changa',sans-serif]">
                فريق «{leadChangeBanner.newLeaderName}» يقتنص المركز الأول برصيد {leadChangeBanner.newLeaderScore} نقطة! 🚀🔥
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="px-3 py-1.5 rounded-xl bg-white/25 border border-white/40 text-xs font-black backdrop-blur-sm whitespace-nowrap shadow">
              تغيير الصدارة ⚡
            </span>
          </div>
        </div>
      )}

      {/* LOBBY STAGE: Waiting for students & Mode Selection */}
      {session.status === 'lobby' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/95 backdrop-blur-md text-slate-800 p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6">
            
            {/* Mode Selector Pill */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/90 border border-purple-200/80">
              <div>
                <span className="text-xs font-black text-purple-900 block">اختر نمط التحدي المباشر بالفصل:</span>
                <span className="text-[11px] text-slate-600 font-medium">
                  {isTeamsMode 
                    ? 'يتعاون الطلاب ضمن مجموعات وتُجمع نقاط كل عضو لصالح رصيد الفريق!' 
                    : 'يتنافس كل طالب بمفرده على قائمة الصدارة الفردية.'}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-purple-200 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleGameMode('individual')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    !isTeamsMode
                      ? 'bg-purple-900 text-white shadow-md'
                      : 'text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  <span>👤 تنافس فردي</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleGameMode('teams')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    isTeamsMode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>👥 تحدي الفرق (تجميع النقاط)</span>
                </button>
              </div>
            </div>

            {/* If Teams Mode: Team Configuration Toolbar */}
            {isTeamsMode && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/70 space-y-3 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-950">عدد الفرق:</span>
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => handleTeamCountChange(count)}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all border ${
                          teamsList.length === count
                            ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                            : 'bg-white border-blue-200 text-blue-950 hover:bg-blue-100'
                        }`}
                      >
                        {count} فرق
                      </button>
                    ))}
                  </div>

                  {participantsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoBalance}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-900 text-xs font-black hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-blue-600" />
                      <span>توزيع متوازن عشوائي بالتساوي ⚖️</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PIN Announcement Box */}
            <div className="space-y-2 max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-purple-950 font-['Changa',sans-serif]">
                اطلب من الطلاب الانضمام بالرمز:
              </h2>
              <div className="inline-block my-2 px-8 py-3 rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 text-4xl sm:text-5xl font-black font-['Changa',sans-serif] tracking-widest shadow-xl shadow-amber-400/30">
                {session.pin}
              </div>
              <p className="text-xs text-slate-600">
                يدخل الطالب المنصة وينقر على <span className="font-bold text-purple-900">«رمز النشاط / PIN»</span> ثم يدخل الرمز للانضمام فوراً!
              </p>
            </div>

            {/* Quick Demo Students Simulator Button */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleAddDemoStudents}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black transition-all hover:scale-105 active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>+ إضافة طلاب تجريبيين للتجربة السريعة (6 طلاب)</span>
              </button>
            </div>

            {/* TEAMS MODE LOBBY: Grouped Team Cards */}
            {isTeamsMode ? (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-black text-purple-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    مجموعات الفصل المشاركة ({teamsList.length} فرق • {participantsList.length} طالب)
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    يمكنك تغيير فريق أي طالب بالنقر على القائمة
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamsList.map((team) => {
                    const members = participantsList.filter((p) => p.teamId === team.id);
                    return (
                      <div
                        key={team.id}
                        className="rounded-2xl border-2 p-4 space-y-3 bg-white shadow-sm flex flex-col justify-between"
                        style={{
                          borderColor: team.color === 'blue' ? '#38bdf8' : team.color === 'purple' ? '#c084fc' : team.color === 'amber' ? '#fbbf24' : '#34d399',
                        }}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{team.icon}</span>
                            <div>
                              <h3 className="text-sm font-black text-slate-900">{team.name}</h3>
                              <span className="text-[11px] font-bold text-slate-500">
                                {members.length} أعضاء
                              </span>
                            </div>
                          </div>
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-black"
                            style={{
                              backgroundColor: team.color === 'blue' ? '#e0f2fe' : team.color === 'purple' ? '#f3e8ff' : team.color === 'amber' ? '#fef3c7' : '#d1fae5',
                              color: team.color === 'blue' ? '#0369a1' : team.color === 'purple' ? '#7e22ce' : team.color === 'amber' ? '#b45309' : '#047857',
                            }}
                          >
                            رصيد: {team.totalScore} pt
                          </span>
                        </div>

                        {/* Members in Team */}
                        <div className="space-y-1.5 min-h-[90px]">
                          {members.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl">
                              بانتظار انضمام أعضاء لهذا الفريق...
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {members.map((p) => (
                                <div
                                  key={p.id}
                                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <img
                                      src={p.avatar}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="w-6 h-6 rounded-full object-cover border shrink-0"
                                    />
                                    <span className="font-bold text-slate-800 truncate">{p.name}</span>
                                  </div>

                                  {/* Quick Switch Team Dropdown */}
                                  <select
                                    value={team.id}
                                    onChange={(e) => handleAssignStudentTeam(p.id, e.target.value)}
                                    className="text-[10px] font-black bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 text-slate-700 cursor-pointer hover:border-purple-300"
                                    title="نقل لفريق آخر"
                                  >
                                    {teamsList.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* INDIVIDUAL MODE LOBBY: Avatar Grid */
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto text-sm">
                  <span className="font-black text-purple-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    الطلاب المتصلون حالياً ({participantsList.length})
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {participantsList.length === 0 ? 'بانتظار أول طالب...' : 'جاهزون للانطلاق 🚀'}
                  </span>
                </div>

                {participantsList.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-purple-200 rounded-3xl max-w-2xl mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-xl animate-bounce">
                      ⏳
                    </div>
                    <p className="text-sm font-bold text-slate-500">لا يوجد طلاب متصلون بعد في الغرفة</p>
                    <p className="text-xs text-slate-400">شارك الرمز مع فصلك أو انقر على زر إضافة طلاب تجريبيين للاختبار</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
                    {participantsList.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col items-center text-center gap-2 animate-fadeIn"
                      >
                        <img
                          src={p.avatar}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                        />
                        <span className="text-xs font-black text-purple-950 truncate w-full">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          جاهز ✅
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Launch Button */}
            <div className="pt-6">
              <button
                disabled={participantsList.length === 0}
                onClick={handleStartChallenge}
                className={`px-8 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 mx-auto shadow-xl transition-all ${
                  participantsList.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 hover:scale-105 active:scale-95 shadow-emerald-500/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5 fill-white" />
                <span>
                  {isTeamsMode 
                    ? 'انطلاق تحدي الفرق الحماسي 👥🚀' 
                    : 'انطلاق التحدي الفردي لجميع الطلاب 🚀'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUESTION STAGE (in_progress or question_review) */}
      {(session.status === 'in_progress' || session.status === 'question_review') && currentQ && (
        <div className="space-y-6">

          {/* TEAMS BATTLE ARENA (Active if Teams Mode) */}
          {isTeamsMode && (
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/40 p-5 text-white shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm font-['Changa',sans-serif] text-amber-300">
                    ساحة مواجهة الفرق المباشرة • Live Team Battle
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playTeamPointSound();
                      setTimeout(() => playTeamLeadChangeSound(), 400);
                    }}
                    className="text-[11px] bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5 font-bold"
                    title="تجربة صوت النقطة وتغيير الصدارة"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    تجربة صوت الفصل 🎵
                  </button>
                  <div className="text-xs text-purple-300 font-bold">
                    الفريق المتصدر حالياً: <span className="text-amber-400 font-black">{sortedTeams[0]?.name || '—'}</span> 👑
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sortedTeams.map((team, idx) => {
                  const teamMembers = participantsList.filter(p => p.teamId === team.id);
                  const answeredInTeam = teamMembers.filter(p => p.hasAnsweredCurrent).length;
                  const isLeading = idx === 0 && team.totalScore > 0;
                  const isJustScored = recentScoredTeam?.teamId === team.id;

                  return (
                    <div
                      key={team.id}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isJustScored
                          ? 'ring-2 ring-emerald-400 bg-emerald-950/40 border-emerald-400 scale-[1.02]'
                          : isLeading 
                            ? 'bg-purple-900/60 border-amber-400/80 shadow-lg shadow-amber-400/10' 
                            : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl transition-transform ${isJustScored ? 'scale-125' : ''}`}>{team.icon}</span>
                          <div>
                            <p className="font-black text-xs text-white truncate">{team.name}</p>
                            <p className="text-[10px] text-purple-300 font-bold">{teamMembers.length} أعضاء</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-black font-mono transition-colors ${isJustScored ? 'text-emerald-300 scale-110' : 'text-amber-400'}`}>
                            {team.totalScore} pt
                          </div>
                          {isJustScored && (
                            <span className="animate-bounce block text-[9px] font-black bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-md shadow">
                              +{recentScoredTeam.points} ⚡
                            </span>
                          )}
                          {!isJustScored && isLeading && (
                            <span className="text-[9px] font-black bg-amber-400 text-purple-950 px-1.5 py-0.2 rounded-md">
                              المركز 1 👑
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Team Answer Progress */}
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-purple-200">إجابات السؤال:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {answeredInTeam}/{teamMembers.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Question & Live Distribution Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Question Card */}
              <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6">
                
                {/* Question Header Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-900 text-xs font-black">
                      السؤال {currentQIndex + 1} من {activity.questions.length}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black">
                      ⭐ {currentQ.points || 10} نقطة
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        الطلاب يجيبون الآن...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم إعلان الإجابة والشرح
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text & Media */}
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-purple-950 font-['Changa',sans-serif] leading-relaxed">
                    {currentQ.questionText}
                  </h2>
                  {currentQ.imageUrl && (
                    <div className="rounded-2xl overflow-hidden max-h-64 bg-purple-50 flex items-center justify-center border border-purple-100">
                      <img
                        src={currentQ.imageUrl}
                        alt="Question media"
                        referrerPolicy="no-referrer"
                        className="max-h-64 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Choices & Live Distribution */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>خيارات السؤال وتوزيع إجابات الفصل:</span>
                    <span>{qStats.totalAnswered} طالب أجابوا</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.choices.map((choice, idx) => {
                      const count = qStats.choiceDistribution[idx] || 0;
                      const percent = qStats.totalAnswered > 0 ? Math.round((count / qStats.totalAnswered) * 100) : 0;
                      const isCorrect = idx === currentQ.correctAnswerIndex;
                      const isRevealed = session.status === 'question_review';

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                            isRevealed && isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                              : isRevealed && !isCorrect
                              ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                              : 'bg-white border-purple-100 text-slate-800'
                          }`}
                        >
                          {/* Background distribution bar */}
                          <div
                            className={`absolute top-0 bottom-0 right-0 opacity-15 transition-all duration-500 ${
                              isRevealed && isCorrect ? 'bg-emerald-500' : 'bg-purple-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                                  isRevealed && isCorrect
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-purple-100 text-purple-900'
                                }`}
                              >
                                {['أ', 'ب', 'ج', 'د'][idx] || idx + 1}
                              </span>
                              <span className="font-bold text-sm">{choice}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-mono font-black">
                              <span>{count}</span>
                              <span className="text-[10px] text-slate-400 font-sans">({percent}%)</span>
                              {isRevealed && isCorrect && (
                                <Check className="w-4 h-4 text-emerald-600 ml-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Science Explanation Box in Review Stage */}
                {session.status === 'question_review' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-900">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>الشرح والتفسير العلمي النموذجي:</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {currentQ.explanation || 'تم إرفاق الإجابة الصحيحة وتأكيد المعيار العلمي للنشاط.'}
                    </p>
                  </div>
                )}

                {/* Teacher Control Actions Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-bold">
                    أجاب {answeredStudents} من {totalStudents} طالب ({answerPercentage}%)
                  </div>

                  <div className="flex items-center gap-3">
                    {session.status === 'in_progress' ? (
                      <button
                        onClick={handleRevealAnswer}
                        className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>كشف الإجابة والشرح للطلاب</span>
                      </button>
                    ) : (
                      currentQIndex + 1 < activity.questions.length ? (
                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <span>السؤال التالي</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleFinishChallenge}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-purple-950 font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>إعلان النتائج النهائية ومنصة التتويج 🏆</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side Column: Tabs (Teams / Monitor / Leaderboard) */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white text-slate-800 p-5 shadow-2xl border border-purple-100 space-y-4">
                
                {/* Sub Tab Navigation */}
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-purple-50 border border-purple-100 text-xs font-black">
                  {isTeamsMode && (
                    <button
                      onClick={() => setActiveSubTab('teams')}
                      className={`flex-1 py-2 rounded-xl transition-all ${
                        activeSubTab === 'teams'
                          ? 'bg-purple-900 text-white shadow-sm'
                          : 'text-purple-900 hover:bg-purple-100'
                      }`}
                    >
                      ترتيب الفرق
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSubTab('monitor')}
                    className={`flex-1 py-2 rounded-xl transition-all ${
                      activeSubTab === 'monitor'
                        ? 'bg-purple-900 text-white shadow-sm'
                        : 'text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    متابعة الطلاب
                  </button>
                  <button
                    onClick={() => setActiveSubTab('leaderboard')}
                    className={`flex-1 py-2 rounded-xl transition-all ${
                      activeSubTab === 'leaderboard'
                        ? 'bg-purple-900 text-white shadow-sm'
                        : 'text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    لوحة الصدارة
                  </button>
                </div>

                {/* Sub-tab: Teams Ranking */}
                {isTeamsMode && activeSubTab === 'teams' && (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {sortedTeams.map((team, rank) => {
                      const members = participantsList.filter(p => p.teamId === team.id);
                      const bestMember = [...members].sort((a, b) => b.score - a.score)[0];

                      return (
                        <div
                          key={team.id}
                          className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🎖️'}</span>
                              <span className="text-base">{team.icon}</span>
                              <span className="font-black text-purple-950">{team.name}</span>
                            </div>
                            <span className="font-black font-mono text-purple-950 text-sm">
                              {team.totalScore} pt
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-purple-100">
                            <span>الأعضاء: {members.length}</span>
                            {bestMember && (
                              <span className="text-amber-700 font-bold truncate max-w-[150px]">
                                نجم الفريق: {bestMember.name} ({bestMember.score} pt)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub-tab 1: Live Answers Status */}
                {activeSubTab === 'monitor' && (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>الطالب</span>
                      <span>الحالة</span>
                    </div>

                    {participantsList.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-purple-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-black text-purple-950 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold">
                              {p.score} نقطة {p.teamName ? `• ${p.teamName}` : ''}
                            </p>
                          </div>
                        </div>

                        <div>
                          {p.hasAnsweredCurrent ? (
                            session.status === 'question_review' ? (
                              p.lastAnswerCorrect ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> صحيح
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> خطأ
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center gap-1 animate-pulse">
                                <Check className="w-3 h-3" /> تم الإرسال
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1">
                              <Clock className="w-3 h-3" /> يفكر...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-tab 2: Class Leaderboard */}
                {activeSubTab === 'leaderboard' && (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {sortedParticipants.map((p, rank) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs border ${
                          rank === 0
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-black'
                            : rank === 1
                            ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                            : rank === 2
                            ? 'bg-orange-50 border-orange-200 text-orange-950 font-bold'
                            : 'bg-purple-50/50 border-purple-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 text-center font-black text-xs font-['Changa',sans-serif]">
                            {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                          </span>
                          <img
                            src={p.avatar}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-purple-200"
                          />
                          <div className="truncate min-w-0">
                            <p className="truncate font-black">{p.name}</p>
                            {p.teamName && (
                              <p className="text-[9px] text-slate-400 font-normal truncate">{p.teamName}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          {p.streak > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 flex items-center gap-0.5 font-sans">
                              <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                              {p.streak}
                            </span>
                          )}
                          <span className="text-purple-950">{p.score} pt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* FINISHED STAGE: Podium & Final Results */}
      {session.status === 'finished' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white text-slate-800 p-8 shadow-2xl border border-purple-100 space-y-8 text-center">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>اكتمل التحدي المباشر بنجاح!</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-purple-950 font-['Changa',sans-serif]">
                {isTeamsMode ? 'تتويج الفريق البطل وأبطال المجموعات 🏆' : 'منصة تتويج أبطال العلوم في الفصل 🏆'}
              </h2>
              <p className="text-sm text-slate-600">
                تألق رائع وتنافس متميز في نشاط «{activity.title}»
              </p>
            </div>

            {/* If Teams Mode: Team Championship Podium */}
            {isTeamsMode ? (
              <div className="space-y-8">
                {/* Champion Team Banner */}
                {sortedTeams[0] && (
                  <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-purple-950 shadow-2xl border-4 border-amber-200 space-y-3 animate-fadeIn">
                    <div className="text-5xl animate-bounce">👑</div>
                    <span className="text-xs font-black uppercase tracking-wider bg-purple-950 text-amber-300 px-3 py-1 rounded-full">
                      الفريق البطل الحاصل على المركز الأول 🥇
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black font-['Changa',sans-serif]">
                      {sortedTeams[0].name}
                    </h3>
                    <div className="text-2xl font-black font-mono">
                      بإجمالي نقاط: {sortedTeams[0].totalScore} نقطة!
                    </div>

                    {/* Members of Winning Team */}
                    <div className="pt-3 border-t border-purple-950/20">
                      <span className="text-xs font-black block mb-2">أعضاء الفريق الفائز:</span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {participantsList.filter(p => p.teamId === sortedTeams[0].id).map(p => (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-white text-xs font-bold shadow-sm"
                          >
                            <img
                              src={p.avatar}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span>{p.name} ({p.score} pt)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Teams Ranking Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {sortedTeams.map((team, idx) => {
                    const members = participantsList.filter(p => p.teamId === team.id);
                    const topMember = [...members].sort((a, b) => b.score - a.score)[0];

                    return (
                      <div
                        key={team.id}
                        className={`p-5 rounded-2xl border-2 text-right space-y-3 bg-white shadow-sm ${
                          idx === 0 ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{team.icon}</span>
                            <div>
                              <h4 className="font-black text-base text-slate-900">{team.name}</h4>
                              <span className="text-xs font-bold text-slate-500">
                                المركز {idx + 1} • {members.length} أعضاء
                              </span>
                            </div>
                          </div>

                          <div className="text-xl font-black font-mono text-purple-950">
                            {team.totalScore} pt
                          </div>
                        </div>

                        {topMember && (
                          <div className="p-2.5 rounded-xl bg-purple-50 text-xs font-bold text-purple-900 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              نجم الفريق (MVP):
                            </span>
                            <span className="font-black">{topMember.name} ({topMember.score} pt)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Individual Podium (Top 3) */
              <div className="flex flex-wrap items-end justify-center gap-4 pt-6 max-w-2xl mx-auto">
                {/* 2nd Place */}
                {sortedParticipants[1] && (
                  <div className="flex-1 min-w-[140px] max-w-[180px] flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={sortedParticipants[1].avatar}
                        alt={sortedParticipants[1].name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 shadow-md"
                      />
                      <span className="absolute -bottom-2 -right-1 text-2xl">🥈</span>
                    </div>
                    <span className="font-black text-sm text-purple-950 truncate w-full">
                      {sortedParticipants[1].name}
                    </span>
                    <span className="text-xs font-black text-slate-600 font-mono">
                      {sortedParticipants[1].score} نقطة
                    </span>
                    <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 h-28 rounded-t-2xl flex items-center justify-center font-black text-2xl text-slate-700 font-['Changa',sans-serif] shadow-inner">
                      2
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {sortedParticipants[0] && (
                  <div className="flex-1 min-w-[160px] max-w-[200px] flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="absolute -top-6 text-3xl animate-bounce">👑</div>
                      <img
                        src={sortedParticipants[0].avatar}
                        alt={sortedParticipants[0].name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl"
                      />
                      <span className="absolute -bottom-2 -right-1 text-2xl">🥇</span>
                    </div>
                    <span className="font-black text-base text-purple-950 truncate w-full">
                      {sortedParticipants[0].name}
                    </span>
                    <span className="text-sm font-black text-amber-700 font-mono">
                      {sortedParticipants[0].score} نقطة
                    </span>
                    <div className="w-full bg-gradient-to-t from-amber-400 to-amber-300 h-40 rounded-t-2xl flex items-center justify-center font-black text-3xl text-purple-950 font-['Changa',sans-serif] shadow-lg">
                      1
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {sortedParticipants[2] && (
                  <div className="flex-1 min-w-[140px] max-w-[180px] flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={sortedParticipants[2].avatar}
                        alt={sortedParticipants[2].name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border-4 border-orange-300 shadow-md"
                      />
                      <span className="absolute -bottom-2 -right-1 text-2xl">🥉</span>
                    </div>
                    <span className="font-black text-sm text-purple-950 truncate w-full">
                      {sortedParticipants[2].name}
                    </span>
                    <span className="text-xs font-black text-orange-700 font-mono">
                      {sortedParticipants[2].score} نقطة
                    </span>
                    <div className="w-full bg-gradient-to-t from-orange-300 to-orange-200 h-20 rounded-t-2xl flex items-center justify-center font-black text-2xl text-orange-950 font-['Changa',sans-serif] shadow-inner">
                      3
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Class Standings Table */}
            <div className="pt-8 border-t border-slate-100 max-w-3xl mx-auto space-y-3">
              <h3 className="text-lg font-black text-purple-950 font-['Changa',sans-serif] text-right">
                سجل نتائج طلاب الفصل بالكامل ({sortedParticipants.length}):
              </h3>

              <div className="space-y-2">
                {sortedParticipants.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-purple-900 font-mono">
                        #{idx + 1}
                      </span>
                      <img
                        src={p.avatar}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-purple-200"
                      />
                      <div className="text-right">
                        <span className="font-black text-purple-950 block">{p.name}</span>
                        {p.teamName && (
                          <span className="text-[10px] text-purple-700 font-bold block">{p.teamName}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold font-mono">
                      <span className="text-amber-700">⭐ {p.score} نقطة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  onSaveLiveResults(session);
                  onExit();
                }}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>حفظ نتائج الفصل والعودة للوحة التحكم</span>
              </button>

              <button
                onClick={onExit}
                className="px-5 py-3.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold text-sm transition-colors"
              >
                العودة للوحة المعلم
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
