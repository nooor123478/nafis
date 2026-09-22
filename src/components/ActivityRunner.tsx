import { useState, useEffect, useRef } from 'react';
import { Activity, Question, UserProfile, StudentAttempt } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Award, 
  Brain, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playErrorSound, playTimerWarningSound } from '../utils/audio';

interface ActivityRunnerProps {
  activity: Activity;
  student: UserProfile;
  onFinish: (attempt: StudentAttempt) => void;
  onExit: () => void;
}

export default function ActivityRunner({
  activity,
  student,
  onFinish,
  onExit,
}: ActivityRunnerProps) {
  const questions = activity.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [totalTimeSpentSeconds, setTotalTimeSpentSeconds] = useState(0);

  // Per-question countdown timer
  const currentQuestion: Question | undefined = questions[currentQuestionIndex];
  const questionInitialTime = currentQuestion?.timeLimitSeconds || 30;
  const [timeLeft, setTimeLeft] = useState<number>(questionInitialTime);
  const [timeExpired, setTimeExpired] = useState(false);

  // User answers history for detailed review
  const recordedAnswersRef = useRef<StudentAttempt['userAnswers']>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Total session timer
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, []);

  // Per-question timer
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimitSeconds || 30);
    setTimeExpired(false);
    setIsAnswerSubmitted(false);
    setSelectedChoiceIndex(null);
    setShowHint(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        if (prev === 6 && soundEnabled) {
          playTimerWarningSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex]);

  // Handle timeout
  const handleTimeExpired = () => {
    setTimeExpired(true);
    setIsAnswerSubmitted(true);
    setWrongAnswersCount((prev) => prev + 1);

    if (soundEnabled) playErrorSound();

    if (currentQuestion) {
      recordedAnswersRef.current.push({
        questionId: currentQuestion.id,
        selectedChoice: -1,
        isCorrect: false,
        timeSpent: currentQuestion.timeLimitSeconds,
      });
    }

    // Auto advance after 2.5 seconds
    setTimeout(() => {
      goToNextQuestion();
    }, 2800);
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#A855F7', '#EC4899', '#38BDF8', '#34D399']
      });
    } catch (e) {
      // Ignore
    }
  };

  // Submit Answer
  const handleSelectAnswer = (choiceIndex: number) => {
    if (isAnswerSubmitted || timeExpired || !currentQuestion) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoiceIndex(choiceIndex);
    setIsAnswerSubmitted(true);

    const isCorrect = choiceIndex === currentQuestion.correctAnswerIndex;
    const timeSpent = (currentQuestion.timeLimitSeconds || 30) - timeLeft;

    if (isCorrect) {
      const earned = currentQuestion.points || 10;
      setScore((prev) => prev + earned);
      setCorrectAnswersCount((prev) => prev + 1);
      if (soundEnabled) playSuccessSound();
      triggerConfetti();
    } else {
      setWrongAnswersCount((prev) => prev + 1);
      if (soundEnabled) playErrorSound();
    }

    recordedAnswersRef.current.push({
      questionId: currentQuestion.id,
      selectedChoice: choiceIndex,
      isCorrect,
      timeSpent,
    });

    // Auto proceed to next question after reviewing feedback
    setTimeout(() => {
      goToNextQuestion();
    }, isCorrect ? 2000 : 3500);
  };

  // Advance or Complete
  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finalize activity!
      const finalAttempt: StudentAttempt = {
        id: `att-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        studentAvatar: student.avatar,
        activityId: activity.id,
        activityTitle: activity.title,
        gradeId: activity.gradeId,
        score: score + (selectedChoiceIndex === currentQuestion?.correctAnswerIndex ? (currentQuestion?.points || 10) : 0),
        maxScore: activity.totalPoints || questions.reduce((acc, q) => acc + (q.points || 10), 0),
        correctAnswersCount: correctAnswersCount + (selectedChoiceIndex === currentQuestion?.correctAnswerIndex ? 1 : 0),
        wrongAnswersCount: wrongAnswersCount + (selectedChoiceIndex !== currentQuestion?.correctAnswerIndex ? 1 : 0),
        timeSpentSeconds: totalTimeSpentSeconds,
        percentage: Math.round(
          ((correctAnswersCount + (selectedChoiceIndex === currentQuestion?.correctAnswerIndex ? 1 : 0)) / questions.length) * 100
        ),
        date: new Date().toISOString().split('T')[0],
        userAnswers: recordedAnswersRef.current,
      };

      onFinish(finalAttempt);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-20 text-white">
        <p className="text-lg">عذراً، لم يتم العثور على أسئلة لهذا النشاط.</p>
        <button
          onClick={onExit}
          className="mt-4 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold"
        >
          رجوع
        </button>
      </div>
    );
  }

  const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
  const isCorrect = selectedChoiceIndex === currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-4">
      
      {/* 1. Header Bar with Back Button and Sound Toggle */}
      <div className="flex items-center justify-between">
        <button
          id="btn-runner-back"
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4" />
          <span>← رجوع</span>
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-xl font-black text-white font-['Changa',sans-serif] flex items-center gap-2">
            <span>🎮</span>
            <span>تحدي العلوم: {activity.title}</span>
          </h1>
        </div>

        <button
          id="btn-toggle-sound"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'كتم الصوت' : 'تشغيل المؤثرات'}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-300" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
        </button>
      </div>

      {/* 2. Reference Student Information Card */}
      <div 
        id="runner-info-card"
        className="rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 p-4 text-white shadow-2xl"
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          
          {/* Student Name */}
          <div className="flex items-center justify-center gap-2 bg-purple-950/40 p-2.5 rounded-2xl border border-purple-400/20 col-span-2 sm:col-span-1">
            <span className="text-xl">👤</span>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 block font-bold">اسم الطالب</span>
              <span className="text-xs font-black truncate max-w-[120px] block text-amber-300">
                {student.name.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center justify-center gap-2 bg-purple-950/40 p-2.5 rounded-2xl border border-purple-400/20">
            <span className="text-xl">⭐</span>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 block font-bold">نقاطك</span>
              <span className="text-sm sm:text-base font-black text-amber-300">{score}</span>
            </div>
          </div>

          {/* Correct Answers */}
          <div className="flex items-center justify-center gap-2 bg-purple-950/40 p-2.5 rounded-2xl border border-purple-400/20">
            <span className="text-xl">🧠</span>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 block font-bold">إجابات صحيحة</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">{correctAnswersCount}</span>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center justify-center gap-2 p-2.5 rounded-2xl border transition-all ${
            timeLeft <= 5 
              ? 'bg-rose-900/60 border-rose-400/60 animate-pulse text-rose-200' 
              : 'bg-purple-950/40 border-purple-400/20 text-white'
          }`}>
            <span className="text-xl">⏱️</span>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 block font-bold">الوقت</span>
              <span className={`text-sm sm:text-base font-black ${timeLeft <= 5 ? 'text-rose-300' : 'text-amber-300'}`}>
                {timeLeft} ثانية
              </span>
            </div>
          </div>

          {/* Question Number */}
          <div className="flex items-center justify-center gap-2 bg-purple-950/40 p-2.5 rounded-2xl border border-purple-400/20">
            <span className="text-xl">📌</span>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 block font-bold">رقم السؤال</span>
              <span className="text-sm sm:text-base font-black text-purple-200">
                {currentQuestionIndex + 1} من {questions.length}
              </span>
            </div>
          </div>

        </div>

        {/* Animated Progress Bar */}
        <div className="mt-3.5 pt-2">
          <div className="w-full bg-purple-950/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-400/20">
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Question Screen (White Large Card) */}
      <div 
        id="runner-question-card"
        className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-2xl border-4 border-purple-200/60 transition-all duration-300 relative overflow-hidden"
      >
        
        {/* Top Question Badge & Actions */}
        <div className="flex items-center justify-between mb-4 border-b border-purple-50 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 font-black flex items-center justify-center text-sm shadow-inner">
              🔎
            </span>
            <span className="text-sm sm:text-base font-black text-purple-900">
              السؤال رقم {currentQuestionIndex + 1}:
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              +{currentQuestion.points || 10} نقاط
            </span>
          </div>

          {currentQuestion.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{showHint ? 'إخفاء التلميح' : '💡 إظهار تلميح'}</span>
            </button>
          )}
        </div>

        {/* Hint Box if toggled */}
        {showHint && currentQuestion.hint && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>تلميح المعلم: {currentQuestion.hint}</span>
          </div>
        )}

        {/* Optional Question Image */}
        {currentQuestion.imageUrl && (
          <div className="mb-5 rounded-2xl overflow-hidden max-h-56 w-full bg-purple-50 border border-purple-100 flex items-center justify-center">
            <img 
              src={currentQuestion.imageUrl} 
              alt="توضيح السؤال" 
              className="object-contain max-h-56 w-full"
            />
          </div>
        )}

        {/* Question Text Prompt */}
        <div className="my-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-purple-950 leading-relaxed text-right font-['Tajawal',sans-serif]">
            "{currentQuestion.questionText}"
          </h2>
        </div>

        {/* Timeout Banner if time expired */}
        {timeExpired && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-900 flex items-center gap-3 animate-bounce">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="text-base font-black">⏰ انتهى الوقت المخصص لهذا السؤال!</p>
              <p className="text-xs text-rose-700">الإجابة الصحيحة موضحة أدناه باللون الأخضر.</p>
            </div>
          </div>
        )}

        {/* 4. Large Rounded Option Buttons (🟣 الخيارات) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.choices.map((choiceText, index) => {
            const isSelected = selectedChoiceIndex === index;
            const isAnswerKey = index === currentQuestion.correctAnswerIndex;

            // Compute button state colors after submission
            let buttonStyle = 'bg-purple-50/70 text-purple-950 border-2 border-purple-200/80 hover:bg-purple-100 hover:border-purple-400 hover:scale-[1.01]';
            let optionBadge = 'bg-purple-200 text-purple-900';

            if (isAnswerSubmitted) {
              if (isAnswerKey) {
                // Correct answer is highlighted in green
                buttonStyle = 'bg-emerald-100 text-emerald-950 border-3 border-emerald-500 shadow-lg shadow-emerald-500/20';
                optionBadge = 'bg-emerald-500 text-white';
              } else if (isSelected && !isAnswerKey) {
                // User picked wrong choice
                buttonStyle = 'bg-rose-100 text-rose-950 border-3 border-rose-500 shadow-lg shadow-rose-500/20';
                optionBadge = 'bg-rose-500 text-white';
              } else {
                buttonStyle = 'bg-slate-50 text-slate-400 border border-slate-200 opacity-60';
                optionBadge = 'bg-slate-200 text-slate-500';
              }
            }

            return (
              <button
                key={index}
                id={`runner-choice-${index}`}
                disabled={isAnswerSubmitted || timeExpired}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full min-h-[72px] sm:min-h-[84px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-right font-black text-base sm:text-lg flex items-center justify-between gap-3 transition-all duration-200 select-none cursor-pointer disabled:cursor-default ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Option circular pill marker */}
                  <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shrink-0 ${optionBadge}`}>
                    {['أ', 'ب', 'ج', 'د'][index] || index + 1}
                  </span>
                  <span className="leading-snug">
                    {choiceText}
                  </span>
                </div>

                {/* State Icons */}
                {isAnswerSubmitted && isAnswerKey && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 animate-in zoom-in-50" />
                )}
                {isAnswerSubmitted && isSelected && !isAnswerKey && (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 animate-in zoom-in-50" />
                )}
              </button>
            );
          })}
        </div>

        {/* 5. Educational Feedback Area after answer */}
        {isAnswerSubmitted && (
          <div className="mt-6 pt-5 border-t border-purple-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {isCorrect ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-black">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-base font-black text-emerald-900">
                      أحسنت! إجابة صحيحة وذكية!
                    </h4>
                    <p className="text-xs text-emerald-700 font-bold">
                      +{currentQuestion.points || 10} نقاط أضيفت إلى رصيدك ⭐
                    </p>
                  </div>
                </div>
                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-transform active:scale-95"
                >
                  التالي ←
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-300 text-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-xl font-black">
                      ❌
                    </div>
                    <div>
                      <h4 className="text-base font-black text-rose-900">
                        إجابة غير صحيحة!
                      </h4>
                      <p className="text-xs text-purple-800 font-bold">
                        الإجابة الصحيحة هي: {currentQuestion.choices[currentQuestion.correctAnswerIndex]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={goToNextQuestion}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-transform active:scale-95"
                  >
                    السؤال التالي ←
                  </button>
                </div>

                {currentQuestion.explanation && (
                  <div className="mt-2 pt-2 border-t border-rose-200/60 text-xs text-slate-700 leading-relaxed font-medium">
                    <span className="font-black text-purple-900">💡 الشرح العلمي: </span>
                    {currentQuestion.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
