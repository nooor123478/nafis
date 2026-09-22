import { useState } from 'react';
import { Activity, Resource, StudentAttempt, UserProfile, GradeId } from '../types';
import { 
  PlusCircle, 
  Play, 
  Copy, 
  Trash2, 
  BarChart3, 
  Users, 
  Sparkles, 
  Share2, 
  ExternalLink,
  BookOpen, 
  CheckCircle,
  Eye,
  Clock,
  Award,
  Database,
  Lock,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import TeacherDatabaseManager from './TeacherDatabaseManager';
import TeacherProfileEditor from './TeacherProfileEditor';

interface TeacherDashboardProps {
  currentUser: UserProfile;
  activities: Activity[];
  resources: Resource[];
  studentAttempts: StudentAttempt[];
  onCreateActivity: (mode?: 'manual' | 'ai') => void;
  onLaunchActivity: (activity: Activity) => void;
  onStartLiveChallenge: (activity: Activity) => void;
  onDuplicateActivity: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onOpenShareModal: (activity: Activity) => void;
  onAddResourceClick: () => void;
  onLockDatabase: () => void;
  onDataModified: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  initialTab?: 'activities' | 'results' | 'resources' | 'database';
}

export default function TeacherDashboard({
  currentUser,
  activities,
  resources,
  studentAttempts,
  onCreateActivity,
  onLaunchActivity,
  onStartLiveChallenge,
  onDuplicateActivity,
  onDeleteActivity,
  onOpenShareModal,
  onAddResourceClick,
  onLockDatabase,
  onDataModified,
  onUpdateProfile,
  initialTab = 'activities',
}: TeacherDashboardProps) {

  const [activeTab, setActiveTab] = useState<'activities' | 'results' | 'resources' | 'database'>(initialTab);
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  // Computed metrics
  const totalPlays = activities.reduce((sum, a) => sum + (a.playsCount || 0), 0) + studentAttempts.length;
  const filteredActivities = activities.filter((a) => {
    if (filterGrade !== 'all' && a.gradeId !== Number(filterGrade)) return false;
    return true;
  });

  return (
    <div className="py-6 space-y-6">
      
      {/* Dashboard Top Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#4A1E82] to-[#2D124D] border border-purple-400/30 p-6 sm:p-8 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400/60 shadow-xl"
            />
            <button
              onClick={() => setIsProfileEditorOpen(true)}
              className="absolute -bottom-1.5 -left-1.5 p-1.5 bg-amber-400 text-purple-950 rounded-xl hover:scale-110 shadow-md transition-all"
              title="تعديل الصورة والملف الشخصي"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                <span>👨🏫 مساحة المعلم التفاعلية</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>جلسة المعلم مفعلة</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Changa',sans-serif]">
              مرحباً بك، {currentUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-purple-200">
              {currentUser.subjectTitle && <span>📚 {currentUser.subjectTitle}</span>}
              {currentUser.school && <span>🏫 {currentUser.school}</span>}
            </div>
            {currentUser.welcomeMessage && (
              <p className="text-xs text-amber-200/90 italic line-clamp-1 max-w-xl pt-0.5">
                "{currentUser.welcomeMessage}"
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-edit-teacher-profile"
            onClick={() => setIsProfileEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm border border-white/20 transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-4 h-4 text-amber-300" />
            <span>تعديل صفحتي</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-teacher-create-act-ai"
              onClick={() => onCreateActivity('ai')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ إنشاء بالذكاء الاصطناعي</span>
            </button>

            <button
              id="btn-teacher-create-act-manual"
              onClick={() => onCreateActivity('manual')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm border border-white/20 transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>✍️ إنشاء نشاط يدوي</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('database')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 font-black text-xs sm:text-sm border border-purple-400/40 transition-all shadow-md"
          >
            <Database className="w-4 h-4" />
            <span>🗄️ إدارة قاعدة البيانات</span>
          </button>

          <button
            onClick={onLockDatabase}
            title="قفل قاعدة البيانات ومغادرة جلسة المعلم"
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-black text-xs sm:text-sm border border-rose-400/30 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>قفل 🔒</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الأنشطة المتاحة</span>
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700 text-sm">🎮</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            {activities.length}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">نشطة في مكتبة المنصة</span>
        </div>

        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مشاركات وتحديات الطلاب</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-sm">👥</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            {totalPlays}
          </p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">محاولة مكتملة</span>
        </div>

        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الروابط والمحاكاة</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700 text-sm">🔗</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            {resources.length}
          </p>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">موارد تعليمية مفهرسة</span>
        </div>

        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط درجات الطلاب</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm">📈</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            86%
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">مستوى استيعاب ممتاز</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'activities'
                ? 'bg-amber-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            🎮 أنشطتي ({activities.length})
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'results'
                ? 'bg-amber-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            📈 نتائج الطلاب ({studentAttempts.length})
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'resources'
                ? 'bg-amber-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            🔗 الروابط والمصادر ({resources.length})
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 shadow-md'
                : 'text-amber-300 hover:text-white hover:bg-purple-900/40 border border-amber-400/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>🗄️ قاعدة بيانات المعلم 🔐</span>
          </button>
        </div>

        {activeTab === 'activities' && (
          <div className="flex items-center gap-2 text-xs text-purple-200 font-bold">
            <span>تصفية بالصف:</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-purple-950/70 border border-purple-500/30 text-white rounded-xl px-2.5 py-1 text-xs font-bold"
            >
              <option value="all">جميع الصفوف (1-10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>الصف {n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: My Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          {/* Live Challenge Hero Announcement */}
          <div className="rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-purple-800 text-white p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>جديد: نمط التحدي المباشر في الفصل (Live Challenge)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-['Changa',sans-serif]">
                أطلق نشاطك التفاعلي في نفس اللحظة لجميع طلاب الفصل!
              </h3>
              <p className="text-xs text-white/80 max-w-xl">
                شاشة عرض تتابع إجابات الطلاب لحظة بلحظة، ورسم بياني لخياراتهم، وتتويج المتصدرين بمنصة تفاعلية.
              </p>
            </div>
            {filteredActivities[0] && (
              <button
                onClick={() => onStartLiveChallenge(filteredActivities[0])}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-white/90 text-purple-950 font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                🚀 بدء تحدي مباشر بالنشاط الأول
              </button>
            )}
          </div>

          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-3xl bg-white text-slate-800 p-5 sm:p-6 shadow-xl border border-purple-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-2xl transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-black bg-purple-100 text-purple-900">
                    الصف {activity.gradeId}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-slate-600">{activity.unitTitle.split(':')[0]}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-amber-700">رمز النشاط: {activity.shareCode}</span>
                </div>

                <h3 className="text-lg font-black text-purple-950">
                  {activity.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                  {activity.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                  <span>📝 {activity.questionsCount} أسئلة</span>
                  <span>⏱️ {activity.totalTimeSeconds} ثانية</span>
                  <span>⭐ {activity.totalPoints} نقطة</span>
                  <span className="text-emerald-700 font-bold">👥 {activity.playsCount || 0} مشارك</span>
                </div>
              </div>

              {/* Action Buttons: Play, Live, Duplicate, Share, Results, Delete */}
              <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {/* Live Challenge Button */}
                <button
                  onClick={() => onStartLiveChallenge(activity)}
                  title="بدء تحدي مباشر في الفصل ومتابعة الطلاب لحظياً"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span>🔴 تحدي مباشر</span>
                </button>

                {/* Play / Test */}
                <button
                  onClick={() => onLaunchActivity(activity)}
                  title="تشغيل النشاط وتجربته كطالب"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>▶️ تشغيل</span>
                </button>

                {/* Share Link & PIN */}
                <button
                  onClick={() => onOpenShareModal(activity)}
                  title="مشاركة النشاط مع الطلاب"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة</span>
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => onDuplicateActivity(activity.id)}
                  title="تكرار النشاط وعمل نسخة"
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
                      onDeleteActivity(activity.id);
                    }
                  }}
                  title="حذف النشاط"
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Student Results Analytics */}
      {activeTab === 'results' && (
        <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-xl border border-purple-100 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <h3 className="text-base font-black text-purple-950">
              📊 سجل نتائج ومحاولات الطلاب الحية
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              تُحفظ تلقائياً فور انتهاء الطالب من التحدي
            </span>
          </div>

          {studentAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <div className="text-4xl mb-2">📋</div>
              لم يقم أي طالب بإنهاء نشاط بعد في هذه الجلسة.
              <br />
              جرّب الضغط على زر <strong className="text-purple-900">«تشغيل»</strong> في أي نشاط وحل الأسئلة لتشاهد النتيجة هنا فوراً!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-purple-100 text-purple-950 font-black">
                    <th className="py-3 px-2">الطالب</th>
                    <th className="py-3 px-2">النشاط</th>
                    <th className="py-3 px-2">الصف</th>
                    <th className="py-3 px-2">النقاط المحرزة</th>
                    <th className="py-3 px-2">الإجابات الصحيحة</th>
                    <th className="py-3 px-2">النسبة</th>
                    <th className="py-3 px-2">الزمن</th>
                    <th className="py-3 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                        <img src={att.studentAvatar} alt={att.studentName} className="w-6 h-6 rounded-full object-cover" />
                        <span>{att.studentName}</span>
                      </td>
                      <td className="py-3 px-2 font-extrabold text-purple-900">{att.activityTitle}</td>
                      <td className="py-3 px-2 text-slate-600">الصف {att.gradeId}</td>
                      <td className="py-3 px-2 font-black text-amber-700">⭐ {att.score} / {att.maxScore}</td>
                      <td className="py-3 px-2 text-emerald-600 font-bold">✅ {att.correctAnswersCount} من {att.correctAnswersCount + att.wrongAnswersCount}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                          att.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500">{att.timeSpentSeconds} ث</td>
                      <td className="py-3 px-2 text-slate-400">{att.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Resources Management */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">
              مكتبة الروابط والموارد التي أضافها المعلمون
            </h3>
            <button
              onClick={onAddResourceClick}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black transition-all"
            >
              + إضافة رابط تعليمي
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-3xl bg-white text-slate-800 shadow-xl border border-purple-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                      الصف {res.gradeId}
                    </span>
                    <span>{res.type}</span>
                  </div>
                  <h4 className="text-sm font-black text-purple-950 mt-2 line-clamp-2">
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {res.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">👀 {res.clicksCount} مشاهدة</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>فتح</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Teacher Database Manager */}
      {activeTab === 'database' && (
        <TeacherDatabaseManager
          activities={activities}
          studentAttempts={studentAttempts}
          resources={resources}
          onDataModified={onDataModified}
          onLockDatabase={onLockDatabase}
        />
      )}

      {/* Teacher Profile Editor Modal */}
      <TeacherProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          if (onUpdateProfile) {
            onUpdateProfile(updated);
          }
          onDataModified();
        }}
      />

    </div>
  );
}
