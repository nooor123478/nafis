import { useState, useEffect, useRef } from 'react';
import { LiveSession, UserProfile, LiveTeam } from '../types';
import { liveSocketService } from '../services/liveService';
import { 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Flame, 
  Award, 
  ArrowLeft,
  Lightbulb,
  Check,
  AlertCircle,
  Crown,
  ShieldCheck,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playTeamPointSound, 
  playTeamLeadChangeSound, 
  playSuccessSound, 
  playErrorSound, 
  playCelebrationFanfare 
} from '../utils/audio';

interface StudentLiveRunnerProps {
  pin: string;
  currentUser: UserProfile;
  onExit: () => void;
}

export default function StudentLiveRunner({
  pin,
  currentUser,
  onExit,
}: StudentLiveRunnerProps) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [leadChangeNotification, setLeadChangeNotification] = useState<{
    newLeaderName: string;
    newLeaderIcon: string;
    newLeaderScore: number;
    isMyTeam: boolean;
  } | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    earnedPoints: number;
    choiceIndex: number;
    newTotalScore: number;
    streak: number;
    teamId?: string;
    teamName?: string;
    teamTotalScore?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const startTimeRef = useRef<number>(Date.now());
  const soundEnabledRef = useRef(soundEnabled);
  const myTeamIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Connect and join room
  useEffect(() => {
    liveSocketService.connect().then(() => {
      liveSocketService.joinSession(
        pin,
        currentUser.id,
        currentUser.name,
        currentUser.avatar
      );
    }).catch((err) => {
      console.error('Failed to connect:', err);
      setErrorMsg('تعذر الاتصال بالغرفة المباشرة.');
    });

    const unsubscribe = liveSocketService.subscribe((event) => {
      if (event.type === 'student:joined_success' || event.type === 'session:updated' || event.type === 'session:started') {
        const newSession: LiveSession = event.payload.session;
        setSession(newSession);

        if (newSession.participants && newSession.participants[currentUser.id]) {
          myTeamIdRef.current = newSession.participants[currentUser.id].teamId;
        }

        // If question changed, reset student's per-question state
        if (newSession.status === 'in_progress') {
          const participant = newSession.participants[currentUser.id];
          if (participant && !participant.hasAnsweredCurrent) {
            setSelectedChoice(null);
            setHasSubmitted(false);
            setLastFeedback(null);
            const currentQ = newSession.activity.questions[newSession.currentQuestionIndex];
            const limit = currentQ?.timeLimitSeconds || 20;
            setTimeLeft(limit);
            startTimeRef.current = Date.now();
          }
        }

        if (newSession.status === 'finished') {
          if (soundEnabledRef.current) {
            playCelebrationFanfare();
          }
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      } else if (event.type === 'student:answer_recorded') {
        setLastFeedback(event.payload);
        if (event.payload.isCorrect) {
          if (soundEnabledRef.current) {
            if (event.payload.teamId) {
              playTeamPointSound();
            } else {
              playSuccessSound();
            }
          }
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } else {
          if (soundEnabledRef.current) {
            playErrorSound();
          }
        }
      } else if (event.type === 'session:team_scored') {
        // Play team point sound when points are scored
        if (soundEnabledRef.current) {
          playTeamPointSound();
        }
      } else if (event.type === 'session:team_lead_changed') {
        // Triumphant sound when team overtakes
        if (soundEnabledRef.current) {
          playTeamLeadChangeSound();
        }
        const isMyTeam = event.payload.newLeaderId === myTeamIdRef.current;
        setLeadChangeNotification({
          newLeaderName: event.payload.newLeaderName,
          newLeaderIcon: event.payload.newLeaderIcon,
          newLeaderScore: event.payload.newLeaderScore,
          isMyTeam,
        });
        if (isMyTeam) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.4 },
          });
        }
        setTimeout(() => {
          setLeadChangeNotification(null);
        }, 4500);
      } else if (event.type === 'error') {
        setErrorMsg(event.payload.message);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pin, currentUser]);

  // Timer countdown
  useEffect(() => {
    if (!session || session.status !== 'in_progress' || hasSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status, session?.currentQuestionIndex, hasSubmitted]);

  const handleSelectChoice = (choiceIndex: number) => {
    if (hasSubmitted || !session || session.status !== 'in_progress') return;

    setSelectedChoice(choiceIndex);
    setHasSubmitted(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    liveSocketService.submitAnswer(choiceIndex, timeSpent);
  };

  const handleSelectTeam = (teamId: string) => {
    liveSocketService.selectTeam(teamId);
  };

  if (errorMsg) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="p-8 rounded-3xl bg-red-950/40 border border-red-500/30 text-white space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-black font-['Changa',sans-serif]">تعذر الانضمام للتحدي المباشر</h2>
          <p className="text-red-200 text-sm">{errorMsg}</p>
          <button
            onClick={onExit}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-24 text-center space-y-4 text-white">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-black text-lg font-['Changa',sans-serif]">جاري الدخول لغرفة التحدي المباشر PIN: {pin}...</p>
      </div>
    );
  }

  const currentQIndex = session.currentQuestionIndex;
  const currentQ = session.activity.questions[currentQIndex];
  const participantsList = Object.values(session.participants);
  const myData = session.participants[currentUser.id] || {
    score: 0,
    streak: 0,
    teamId: undefined,
    teamName: undefined,
    hasAnsweredCurrent: false,
  };

  const isTeamsMode = session.gameMode === 'teams';
  const teamsList: LiveTeam[] = session.teams ? Object.values(session.teams) : [];
  const sortedTeams = [...teamsList].sort((a, b) => b.totalScore - a.totalScore);
  const myTeam = isTeamsMode && myData.teamId && session.teams ? session.teams[myData.teamId] : null;
  const myTeamRank = myTeam ? sortedTeams.findIndex(t => t.id === myTeam.id) + 1 : 0;
  const myTeammates = isTeamsMode && myTeam ? participantsList.filter(p => p.teamId === myTeam.id) : [];

  // Compute student current rank in class
  const sortedByScore = [...participantsList].sort((a, b) => b.score - a.score);
  const myRank = sortedByScore.findIndex((p) => p.id === currentUser.id) + 1;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2D124D] via-[#4A1E82] to-[#2D124D] border border-purple-400/30 p-5 text-white shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300">طالب في التحدي المباشر</span>
              <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-400/30">
                PIN: {session.pin}
              </span>
              {isTeamsMode && (
                <span className="text-[10px] bg-cyan-600/80 text-white px-2 py-0.5 rounded-full font-black">
                  تحدي الفرق 👥
                </span>
              )}
            </div>
            <p className="text-sm font-black truncate max-w-[180px] sm:max-w-none">
              {currentUser.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* My Personal Points */}
          <div className="bg-purple-950/70 border border-purple-400/30 px-3 py-1.5 rounded-2xl flex items-center gap-2">
            <span className="text-xs text-amber-400 font-black">⭐ {myData.score}</span>
            {myData.streak > 1 && (
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-amber-300" />
                {myData.streak}
              </span>
            )}
          </div>

          {/* If Team Mode: My Team Score Badge */}
          {myTeam && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-400/40 px-3 py-1.5 rounded-2xl hidden sm:flex items-center gap-1.5 text-xs">
              <span>{myTeam.icon}</span>
              <span className="font-bold text-white truncate max-w-[100px]">{myTeam.name}</span>
              <span className="font-black text-cyan-300 font-mono">({myTeam.totalScore} pt)</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold"
          >
            خروج
          </button>
        </div>
      </div>

      {/* Dynamic Lead Change Alert Banner */}
      {leadChangeNotification && (
        <div className={`rounded-2xl p-4 text-white shadow-xl flex items-center justify-between gap-3 animate-bounce border-2 ${
          leadChangeNotification.isMyTeam
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-300'
            : 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{leadChangeNotification.newLeaderIcon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
                  {leadChangeNotification.isMyTeam ? 'فريقكم في الصدارة الآن! 🎉' : 'تغير متصدر التحدي! ⚡'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-black font-['Changa',sans-serif]">
                فريق «{leadChangeNotification.newLeaderName}» يتصدر الفصل برصيد {leadChangeNotification.newLeaderScore} نقطة!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full whitespace-nowrap">
            صدارة جديدة 👑
          </span>
        </div>
      )}

      {/* LOBBY STAGE */}
      {session.status === 'lobby' && (
        <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-2xl border border-purple-100 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-3xl animate-bounce shadow-inner">
            🚀
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تم انضمامك لغرفة التحدي بنجاح!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950 font-['Changa',sans-serif]">
              {session.activityTitle}
            </h2>
            <p className="text-sm text-slate-600">
              المعلم: <span className="font-bold text-purple-900">{session.teacherName}</span>
            </p>
          </div>

          {/* IF TEAMS MODE: Team membership box & team selection */}
          {isTeamsMode && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 space-y-4 max-w-lg mx-auto text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  أنت تنافس ضمن فريق:
                </span>
                {myTeam && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                    {myTeammates.length} أعضاء
                  </span>
                )}
              </div>

              {myTeam ? (
                <div className="p-3.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{myTeam.icon}</span>
                    <div>
                      <h4 className="font-black text-base text-slate-900">{myTeam.name}</h4>
                      <p className="text-xs text-slate-500">نقاط إجاباتك ستُجمع لصالح هذا الفريق!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  جاري توزيعك على أحد الفرق...
                </div>
              )}

              {/* Team switch options for student in lobby */}
              {teamsList.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-blue-200/60">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    يمكنك اختيار الانضمام لفريق آخر قبل بدء التحدي:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {teamsList.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => handleSelectTeam(team.id)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                          myData.teamId === team.id
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                        }`}
                      >
                        <span className="flex items-center gap-1 truncate">
                          <span>{team.icon}</span>
                          <span className="truncate">{team.name}</span>
                        </span>
                        {myData.teamId === team.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-center gap-2 text-purple-950 font-black text-sm">
              <Clock className="w-4 h-4 text-purple-600 animate-spin" />
              <span>بانتظار إشارة الانطلاق من المعلم...</span>
            </div>
            <p className="text-xs text-slate-500">
              {isTeamsMode
                ? 'تعاون مع فريقك لتحقيق أعلى مجموع نقاط في الفصل!'
                : 'جهز تركيزك وسرعتك، ستبدأ الأسئلة في نفس اللحظة لجميع زملائك!'}
            </p>
          </div>

          {/* Classmates in Room */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-500 block">
              زملاؤك المتواجدون في الغرفة ({participantsList.length}):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
              {participantsList.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-bold text-purple-950"
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{p.name}</span>
                  {p.teamName && (
                    <span className="text-[10px] text-purple-600 font-normal">({p.teamName})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION IN PROGRESS STAGE */}
      {session.status === 'in_progress' && currentQ && (
        <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6">
          
          {/* Header & Timer Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-500">
              <span className="text-purple-950 bg-purple-100 px-3 py-1 rounded-xl">
                السؤال {currentQIndex + 1} من {session.activity.questions.length}
              </span>

              {/* Team reminder badge during question */}
              {myTeam && (
                <span className="text-xs bg-blue-100 text-blue-900 px-2.5 py-1 rounded-xl font-black flex items-center gap-1">
                  <span>{myTeam.icon}</span>
                  <span>{myTeam.name}</span>
                </span>
              )}

              <div className="flex items-center gap-1.5 font-mono text-purple-950 font-black text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{timeLeft} ثانية</span>
              </div>
            </div>

            {/* Visual Timer Progress */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-400'
                }`}
                style={{
                  width: `${(timeLeft / (currentQ.timeLimitSeconds || 20)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-purple-950 font-['Changa',sans-serif] leading-relaxed">
              {currentQ.questionText}
            </h2>
            {currentQ.imageUrl && (
              <div className="rounded-2xl overflow-hidden max-h-56 bg-purple-50 flex items-center justify-center border border-purple-100">
                <img
                  src={currentQ.imageUrl}
                  alt="Question"
                  referrerPolicy="no-referrer"
                  className="max-h-56 object-contain"
                />
              </div>
            )}
          </div>

          {/* Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleSelectChoice(idx)}
                  className={`p-5 rounded-2xl font-bold text-sm text-right transition-all flex items-center justify-between gap-3 border-2 ${
                    isSelected
                      ? 'bg-purple-900 border-purple-950 text-white shadow-xl scale-[1.02]'
                      : hasSubmitted
                      ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-purple-50 border-purple-100 hover:border-purple-300 text-purple-950 hover:scale-[1.01] active:scale-[0.99] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        isSelected ? 'bg-amber-400 text-purple-950' : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {['أ', 'ب', 'ج', 'د'][idx] || idx + 1}
                    </span>
                    <span>{choice}</span>
                  </div>

                  {isSelected && <Check className="w-5 h-5 text-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Status message once submitted */}
          {hasSubmitted && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-black text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>تم تسجيل إجابتك بنجاح! 🎯</span>
              </div>
              <p className="text-xs text-slate-600">
                {isTeamsMode 
                  ? 'إجابتك الصحيحة ستزيد رصيد فريقك، بانتظار إعلان المعلم للنتيجة!'
                  : 'في انتظار انتهاء الوقت وإعلان المعلم للنتيجة والشرح العلمي...'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* QUESTION REVIEW STAGE */}
      {session.status === 'question_review' && currentQ && (
        <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6">
          
          {/* Result Banner */}
          {lastFeedback ? (
            lastFeedback.isCorrect ? (
              <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-2 animate-bounce">
                <div className="text-4xl">🎉</div>
                <h3 className="text-xl font-black text-emerald-950 font-['Changa',sans-serif]">
                  إجابة صحيحة يا بطل!
                </h3>
                <p className="text-sm font-black text-emerald-800">
                  حصلت على +{lastFeedback.earnedPoints} نقطة! 🌟
                </p>
                {isTeamsMode && myTeam && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full inline-block">
                    أضفت النقاط مباشرة لرصيد {myTeam.name} 🚀
                  </p>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-300 text-center space-y-2">
                <div className="text-4xl">💡</div>
                <h3 className="text-xl font-black text-red-950 font-['Changa',sans-serif]">
                  إجابة غير صحيحة، تعلم منها!
                </h3>
                <p className="text-xs text-red-700 font-bold">
                  الإجابة الصحيحة هي: {currentQ.choices[currentQ.correctAnswerIndex]}
                </p>
              </div>
            )
          ) : (
            <div className="p-4 rounded-2xl bg-purple-50 text-center text-sm font-black text-purple-950">
              تم كشف الإجابة من قِبل المعلم
            </div>
          )}

          {/* Choices Review */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 block">خيارات السؤال:</span>
            {currentQ.choices.map((choice, idx) => {
              const isCorrect = idx === currentQ.correctAnswerIndex;
              const isUserChoice = selectedChoice === idx;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold border ${
                    isCorrect
                      ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-black'
                      : isUserChoice
                      ? 'bg-red-50 border-red-300 text-red-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-black">
                      {['أ', 'ب', 'ج', 'د'][idx] || idx + 1}
                    </span>
                    <span>{choice}</span>
                  </div>

                  <div>
                    {isCorrect && (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                        الإجابة الصحيحة ✅
                      </span>
                    )}
                    {!isCorrect && isUserChoice && (
                      <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black">
                        اختيارك ❌
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Science Explanation */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-900">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>الشرح العلمي والتفسير:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {currentQ.explanation || 'تم تأكيد الإجابة النموذجية من منهاج العلوم التفاعلي.'}
            </p>
          </div>

          {/* Student & Team Status Summary */}
          <div className="p-4 rounded-2xl bg-purple-950 text-white text-xs font-bold space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>ترتيبك في الفصل: المركز {myRank} من {participantsList.length}</span>
              </div>
              <div className="text-amber-300 font-mono font-black text-sm">
                مجموعك الفردي: {myData.score} pt
              </div>
            </div>

            {isTeamsMode && myTeam && (
              <div className="flex items-center justify-between pt-2 border-t border-purple-800/60 text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  رصيد فريقك ({myTeam.name}): المركز {myTeamRank}
                </span>
                <span className="font-mono font-black">{myTeam.totalScore} pt</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* FINISHED STAGE */}
      {session.status === 'finished' && (
        <div className="rounded-3xl bg-white text-slate-800 p-8 shadow-2xl border border-purple-100 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-purple-950 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-400/30">
            {isTeamsMode 
              ? (myTeamRank === 1 ? '🥇' : myTeamRank === 2 ? '🥈' : myTeamRank === 3 ? '🥉' : '🏆')
              : (myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🏆')}
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
              نهاية التحدي المباشر!
            </span>
            <h2 className="text-3xl font-black text-purple-950 font-['Changa',sans-serif]">
              أحسنت يا {currentUser.name}!
            </h2>

            {isTeamsMode && myTeam ? (
              <div className="space-y-1">
                <p className="text-base text-slate-700 font-bold">
                  فريقك <span className="font-black text-purple-900">{myTeam.name}</span> أحرز المركز <span className="font-black text-amber-600 font-mono">#{myTeamRank}</span> برصيد <span className="font-black text-amber-600 font-mono">{myTeam.totalScore} نقطة</span>!
                </p>
                <p className="text-xs text-slate-500">
                  ساهمت بمفردك بـ <span className="font-bold text-purple-950">{myData.score} نقطة</span> لصالح الفريق.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                لقد أحرزت المركز <span className="font-black text-purple-950 font-mono">#{myRank}</span> في الفصل بإجمالي نقاط <span className="font-black text-amber-600 font-mono">{myData.score}</span>!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-xs text-slate-500 font-bold block">نقاطك الفردية</span>
              <span className="text-2xl font-black text-purple-950 font-mono">{myData.score}</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-xs text-slate-500 font-bold block">أعلى سلسلة إجابات</span>
              <span className="text-2xl font-black text-amber-600 font-mono flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                {myData.streak}
              </span>
            </div>
          </div>

          {/* If Teams Mode: Show all teams finish scoreboard */}
          {isTeamsMode && sortedTeams.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2 text-right max-w-md mx-auto">
              <span className="text-xs font-black text-purple-950 block">الترتيب النهائي للفرق:</span>
              <div className="space-y-1.5">
                {sortedTeams.map((team, idx) => (
                  <div
                    key={team.id}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-bold border ${
                      team.id === myData.teamId
                        ? 'bg-blue-100/70 border-blue-300 text-blue-950 font-black'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}</span>
                      <span>{team.icon}</span>
                      <span>{team.name}</span>
                      {team.id === myData.teamId && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-md">
                          فريقك
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black">{team.totalScore} pt</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6">
            <button
              onClick={onExit}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-purple-700/30 transition-all hover:scale-105 active:scale-95"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
