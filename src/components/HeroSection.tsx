import { Sparkles, Trophy, Play, PlusCircle, ArrowLeft, Users, Brain, Gamepad2, Edit3 } from 'lucide-react';
import { CycleId, UserProfile } from '../types';
import StudentNameCard from './StudentNameCard';

interface HeroSectionProps {
  onSelectCycle: (cycle: CycleId) => void;
  onStudentStart: () => void;
  onTeacherDashboard: () => void;
  onOpenPinModal: () => void;
  onExploreResources: () => void;
  isTeacherUnlocked?: boolean;
  currentUser?: UserProfile;
  onEditStudentName?: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export default function HeroSection({
  onSelectCycle,
  onStudentStart,
  onTeacherDashboard,
  onOpenPinModal,
  onExploreResources,
  isTeacherUnlocked = false,
  currentUser,
  onEditStudentName,
  onProfileUpdated,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-14 sm:pt-10 sm:pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Floating Science Icons */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          {['🔬', '🧬', '🧪', '🧠', '🎮', '🏆'].map((emoji, idx) => (
            <div
              key={idx}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-xl hover:scale-125 transition-transform duration-300 cursor-pointer select-none"
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Main Headings */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-black shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>بيئة تعليمية تفاعلية لمادة العلوم والأحياء الصفوف (1-10)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight font-['Changa',sans-serif] leading-tight">
            🚀 نافس وتعلم
          </h1>

          <h2 className="text-xl sm:text-3xl font-extrabold text-amber-400 tracking-wide">
            تعلّم • تفاعل • نافس • أنجز
          </h2>

          <p className="text-base sm:text-xl text-purple-100 font-bold max-w-2xl mx-auto leading-relaxed">
            منصة تعليمية تفاعلية وتنافسية، تجمع بين المحتوى التعليمي ومصنع الأنشطة الذكي، وتقدّم تجربة تعلّم ممتعة عبر الألعاب والتحديات.
          </p>

          {/* Versatility Badges (حصة احتياطي، مراجعة، داخل الفصل أو عن بعد) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <span>🎒</span>
              <span>مثالية لحصص الاحتياط</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <span>📝</span>
              <span>حصص المراجعة والتثبيت</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <span>🏫</span>
              <span>داخل الفصل المدرسي</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <span>💻</span>
              <span>التعلم التفاعلي عن بُعد</span>
            </span>
          </div>

          {/* Key Requested Hero Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              id="hero-btn-student"
              onClick={onStudentStart}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-purple-950 font-black text-base shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-purple-950" />
              <span>👨🎓 ابدأ التحديات والتعلم</span>
            </button>

            <button
              id="hero-btn-pin"
              onClick={onOpenPinModal}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>🔐 دخول برمز PIN</span>
            </button>

            <button
              id="hero-btn-resources"
              onClick={onExploreResources}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>🔗 مكتبة الروابط</span>
            </button>

            {isTeacherUnlocked && (
              <button
                id="hero-btn-teacher"
                onClick={onTeacherDashboard}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-900/50 border border-purple-400/30 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>لوحة تحكم المعلم</span>
              </button>
            )}
          </div>

          {/* Active Student Prominent "خانة تعديل اسم الطالب" */}
          {currentUser && currentUser.role === 'student' && (
            <div className="pt-6 flex justify-center w-full">
              <StudentNameCard
                currentUser={currentUser}
                onProfileUpdated={(updated) => {
                  onProfileUpdated?.(updated);
                }}
                onOpenFullEditor={() => {
                  onEditStudentName?.();
                }}
              />
            </div>
          )}
        </div>

        {/* Quick Cycle Chooser Cards - As requested in Section 3 */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
              <span>📚</span>
              <span>اختر الحلقة التعليمية</span>
            </h3>
            <p className="text-purple-300 text-sm mt-1">
              اختر حلقتك الدراسية للوصول المباشر إلى صفوفك والوحدات والأنشطة التفاعلية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Cycle 1: Grades 1 - 4 */}
            <div
              id="card-cycle-1"
              onClick={() => onSelectCycle('cycle-1')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white text-slate-800 p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-emerald-500/20 border-4 border-transparent hover:border-emerald-400"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-black shadow-inner">
                  🟢
                </div>
                <span className="text-xs font-black px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  4 صفوف دراسية
                </span>
              </div>
              <h4 className="text-2xl font-black text-purple-950 mt-4 group-hover:text-emerald-700 transition-colors">
                الحلقة الأولى
              </h4>
              <p className="text-base font-bold text-emerald-600 mt-1">
                الصفوف 1 – 4
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                استكشاف الحواس، الكائنات الحية، التكيف، والظواهر الطبيعية بأسلوب قصصي ممتع وأنشطة كرتونية مبهرة.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-purple-800">
                <span>تصفح الصفوف (1، 2، 3، 4)</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Cycle 2: Grades 5 - 10 */}
            <div
              id="card-cycle-2"
              onClick={() => onSelectCycle('cycle-2')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white text-slate-800 p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-blue-500/20 border-4 border-transparent hover:border-blue-400"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-3xl font-black shadow-inner">
                  🔵
                </div>
                <span className="text-xs font-black px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  6 صفوف دراسية
                </span>
              </div>
              <h4 className="text-2xl font-black text-purple-950 mt-4 group-hover:text-blue-700 transition-colors">
                الحلقة الثانية
              </h4>
              <p className="text-base font-bold text-blue-600 mt-1">
                الصفوف 5 – 10
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                الخلية، الذرة، قوانين الحركة، التفاعلات الكيميائية، والموجات مع محاكاة معملية ثلاثية الأبعاد وتحديات حماسية.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-purple-800">
                <span>تصفح الصفوف (5، 6، 7، 8، 9، 10)</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-1">🎮</div>
            <p className="text-white font-black text-sm">مصنع الأنشطة الذكي</p>
            <p className="text-purple-300 text-xs mt-0.5">أنشئ نشاطك التفاعلي في دقائق</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-1">⏱️</div>
            <p className="text-white font-black text-sm">تحديات ومسابقات مؤقتة</p>
            <p className="text-purple-300 text-xs mt-0.5">مؤقت تفاعلي ونقاط حية</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-1">🏆</div>
            <p className="text-white font-black text-sm">لوحة متصدرين وطنية</p>
            <p className="text-purple-300 text-xs mt-0.5">تنافس واعتل منصة التتويج</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-1">🔗</div>
            <p className="text-white font-black text-sm">مكتبة موارد متكاملة</p>
            <p className="text-purple-300 text-xs mt-0.5">محاكاة، ألعاب، وفيديوهات</p>
          </div>
        </div>

      </div>
    </section>
  );
}
