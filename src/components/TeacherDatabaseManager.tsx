import React, { useState } from 'react';
import { 
  Download, 
  Upload,
  RefreshCw,
  Trash2, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { Activity, StudentAttempt, Resource } from '../types';
import { 
  getDatabaseStats, 
  exportCompleteDatabase, 
  importCompleteDatabase, 
  clearStudentAttempts, 
  resetDatabaseToDefault,
  setTeacherPin,
  getTeacherPin,
  DEFAULT_TEACHER_PIN
} from '../services/storage';

interface TeacherDatabaseManagerProps {
  activities: Activity[];
  studentAttempts: StudentAttempt[];
  resources: Resource[];
  onDataModified: () => void;
  onLockDatabase: () => void;
}

export default function TeacherDatabaseManager({
  activities,
  studentAttempts,
  resources,
  onDataModified,
  onLockDatabase,
}: TeacherDatabaseManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'questions' | 'operations'>('students');
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');

  const stats = getDatabaseStats();

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ type, message });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Filtered Student Records
  const filteredAttempts = studentAttempts.filter((att) => {
    if (selectedGrade !== 'all' && att.gradeId !== Number(selectedGrade)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        att.studentName.toLowerCase().includes(q) ||
        att.activityTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Questions Bank
  const allQuestions = activities.flatMap((act) =>
    (act.questions || []).map((q) => ({
      ...q,
      activityTitle: act.title,
      gradeId: act.gradeId,
      unitTitle: act.unitTitle,
      shareCode: act.shareCode,
    }))
  );

  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedGrade !== 'all' && q.gradeId !== Number(selectedGrade)) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(s) ||
        q.activityTitle.toLowerCase().includes(s) ||
        q.unitTitle.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // 1. Export Database Backup JSON
  const handleExportBackup = () => {
    try {
      const backupData = exportCompleteDatabase();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nafes_science_teacher_database_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotice('تم تصدير وحفظ نسخة كاملة من قاعدة بيانات المعلم بنجاح!');
    } catch {
      showNotice('فشل في تصدير قاعدة البيانات', 'error');
    }
  };

  // 2. Import Database Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const res = importCompleteDatabase(parsed);
        if (res.success) {
          showNotice(res.message);
          onDataModified();
        } else {
          showNotice(res.message, 'error');
        }
      } catch {
        showNotice('الملف غير صالح أو ليس بصيغة JSON صحيحة', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Export CSV / Excel of Student Ledger
  const handleExportCSV = () => {
    if (studentAttempts.length === 0) {
      showNotice('لا توجد سجلات طلاب متاحة حالياً للتصدير', 'error');
      return;
    }

    try {
      // BOM for proper Arabic rendering in Excel
      let csvContent = '\uFEFF';
      csvContent += 'م,اسم الطالب,النشاط,الصف,الدرجة,الدرجة العظمى,النسبة المئوية,الإجابات الصحيحة,الإجابات الخاطئة,الوقت المستغرق (ثانية),التاريخ\n';

      studentAttempts.forEach((att, idx) => {
        csvContent += `${idx + 1},"${att.studentName}","${att.activityTitle}",الصف ${att.gradeId},${att.score},${att.maxScore},${att.percentage}%,${att.correctAnswersCount},${att.wrongAnswersCount},${att.timeSpentSeconds},"${att.date}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `سجل_درجات_الطلاب_نافس_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotice('تم تصدير كشف الدرجات كملف Excel / CSV بنجاح!');
    } catch {
      showNotice('فشل في تصدير السجل', 'error');
    }
  };

  // 4. Print Student Ledger Report
  const handlePrint = () => {
    window.print();
  };

  // 5. Clear Attempts
  const handleClearAttempts = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع محاولات وسجلات درجات الطلاب؟ لن يتم حذف الأنشطة أو بنك الأسئلة.')) {
      clearStudentAttempts();
      onDataModified();
      showNotice('تم تفريغ سجل محاولات الطلاب بنجاح وبدء دورة تقييم جديدة!');
    }
  };

  // 6. Reset Database to Default
  const handleResetDatabase = () => {
    if (window.confirm('تحذير: هل أنت متأكد من إعادة ضبط قاعدة البيانات للمصنع؟ سيتم استرجاع الأنشطة والروابط الافتراضية.')) {
      resetDatabaseToDefault();
      onDataModified();
      showNotice('تمت إعادة ضبط قاعدة البيانات على الإعدادات الافتراضية!');
    }
  };

  // 7. Update Teacher PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPinValue.trim();
    if (clean.length < 4) {
      showNotice('الرمز السري يجب أن يتكون من 4 أرقام على الأقل', 'error');
      return;
    }
    setTeacherPin(clean);
    setIsChangingPin(false);
    setNewPinValue('');
    showNotice(`تم تحديث الرمز السري بنجاح! الرمز ${DEFAULT_TEACHER_PIN} يظل صالحاً دائماً كرمز استرجاع رئيسي.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Notice Banner */}
      {statusNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-black animate-in fade-in ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusNotice.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* Security & Access Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-[#2A0E4B] border-2 border-amber-400/40 p-5 sm:p-6 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-400/20 shrink-0">
            🔐
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-['Changa',sans-serif]">
                قاعدة بيانات وسجل المعلم
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>محمية بالرمز 1988</span>
              </span>
            </div>
            <p className="text-xs text-purple-200">
              إدارة السجلات التراكمية، بنك الأسئلة، تصدير الدرجات، وعمليات النسخ الاحتياطي
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsChangingPin(!isChangingPin)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>تغيير الرمز</span>
          </button>

          <button
            onClick={onLockDatabase}
            title="قفل قاعدة البيانات الآن لمنع التعديل"
            className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>قفل قاعدة البيانات 🔒</span>
          </button>
        </div>
      </div>

      {/* Change PIN Form Dialog */}
      {isChangingPin && (
        <form
          onSubmit={handleSaveNewPin}
          className="p-4 sm:p-5 rounded-2xl bg-white text-slate-800 border-2 border-purple-200 shadow-xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-purple-950 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-700" />
              <span>تعديل الرمز السري لقاعدة بيانات المعلم</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              الرمز الحالي: <strong className="font-mono text-purple-700">{getTeacherPin()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newPinValue}
              onChange={(e) => setNewPinValue(e.target.value)}
              placeholder="أدخل الرمز السري الجديد (مثال: 1988)"
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all"
            >
              حفظ الرمز
            </button>
            <button
              type="button"
              onClick={() => setIsChangingPin(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            * ملاحظة: رمز الاسترجاع الرئيسي الافتراضي <strong className="font-mono text-purple-700">1988</strong> يظل صالحاً دائماً في أي وقت لضمان عدم فقدان الوصول.
          </p>
        </form>
      )}

      {/* 4 Statistics Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">سجلات الأنشطة المخزنة</span>
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700 text-sm">📁</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            {stats.activitiesCount} نشاط
          </p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">
            تحتوي على {stats.totalQuestionsCount} سؤال تفاعلي
          </span>
        </div>

        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">سجل نتائج الطلاب</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm">📊</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            {stats.attemptsCount} محاولة
          </p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            إجمالي النقاط المحرزة: {stats.totalPointsScored} نقطة
          </span>
        </div>

        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الطلاب في قاعدة البيانات</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-sm">👥</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            {stats.leaderboardStudentsCount} طالب
          </p>
          <span className="text-[10px] text-amber-700 font-bold mt-1 block">
            في لوحة الأبطال والمتصدرين
          </span>
        </div>

        <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">حجم التخزين وحالة القاعدة</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700 text-sm">💾</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
            ~{stats.estimatedSizeKb} KB
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
            قاعدة البيانات نشطة ومتزامنة
          </span>
        </div>
      </div>

      {/* Sub-Navigation & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeSubTab === 'students'
                ? 'bg-amber-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            👥 سجل درجات الطلاب ({studentAttempts.length})
          </button>

          <button
            onClick={() => setActiveSubTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeSubTab === 'questions'
                ? 'bg-amber-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            📚 بنك الأسئلة والأنشطة ({allQuestions.length})
          </button>

          <button
            onClick={() => setActiveSubTab('operations')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeSubTab === 'operations'
                ? 'bg-amber-400 text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            ⚙️ أدوات ونسخ قاعدة البيانات
          </button>
        </div>

        {/* Grade & Search controls */}
        {activeSubTab !== 'operations' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث في السجلات..."
                className="w-36 sm:w-48 bg-purple-950/70 border border-purple-500/30 text-white rounded-xl px-3 py-1.5 text-xs placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-purple-300 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-purple-950/70 border border-purple-500/30 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option value="all">جميع الصفوف (1-10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>الصف {n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: Student Ledger / Database Table */}
      {activeSubTab === 'students' && (
        <div className="rounded-3xl bg-white text-slate-800 p-5 sm:p-6 shadow-xl border border-purple-100 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-purple-950">
                سجل بيانات ودرجات الطلاب (Student Ledger)
              </h3>
              <p className="text-xs text-slate-500">
                يحتوي على كافة المحاولات والنتائج المسجلة في قاعدة بيانات المنصة
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                title="تحميل السجل كملف Excel / CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير Excel / CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                title="طباعة التقرير"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>
            </div>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <div className="text-4xl mb-2">📋</div>
              {studentAttempts.length === 0
                ? 'قاعدة بيانات النتائج فارغة حالياً. عند قيام الطلاب بحل الأنشطة والتحديات، ستسجل محاولاتهم هنا فوراً.'
                : 'لم يتم العثور على نتائج تطابق معايير البحث.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-purple-100 text-purple-950 font-black">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-2">الطالب</th>
                    <th className="py-3 px-2">النشاط</th>
                    <th className="py-3 px-2">الصف</th>
                    <th className="py-3 px-2">النقاط المحرزة</th>
                    <th className="py-3 px-2">الإجابات الصحيحة</th>
                    <th className="py-3 px-2">النسبة المئوية</th>
                    <th className="py-3 px-2">الزمن المستغرق</th>
                    <th className="py-3 px-2">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((att, idx) => (
                    <tr key={att.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                        <img src={att.studentAvatar} alt={att.studentName} className="w-6 h-6 rounded-full object-cover" />
                        <span>{att.studentName}</span>
                      </td>
                      <td className="py-3 px-2 font-extrabold text-purple-950">{att.activityTitle}</td>
                      <td className="py-3 px-2 text-slate-600 font-bold">الصف {att.gradeId}</td>
                      <td className="py-3 px-2 font-black text-amber-700">⭐ {att.score} / {att.maxScore}</td>
                      <td className="py-3 px-2 text-emerald-600 font-bold">✅ {att.correctAnswersCount} من {att.correctAnswersCount + att.wrongAnswersCount}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                          att.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-mono">{att.timeSpentSeconds} ثانية</td>
                      <td className="py-3 px-2 text-slate-400 font-mono">{att.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Questions Bank Database */}
      {activeSubTab === 'questions' && (
        <div className="rounded-3xl bg-white text-slate-800 p-5 sm:p-6 shadow-xl border border-purple-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-purple-950">
                بنك الأسئلة التفاعلية المخزنة ({filteredQuestions.length} سؤال)
              </h3>
              <p className="text-xs text-slate-500">
                استعراض الأسئلة المعتمدة في قاعدة البيانات ومفتاح الإجابات والتفسيرات العلمية
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 transition-colors space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                      سؤال #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                      الصف {q.gradeId}
                    </span>
                    <span className="text-slate-500 font-bold">{q.unitTitle}</span>
                  </div>
                  <span className="text-amber-700 font-black">⭐ {q.points || 10} نقاط</span>
                </div>

                <p className="text-sm font-black text-purple-950">
                  {q.questionText}
                </p>

                {/* Options / Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {q.choices.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctAnswerIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <span className="text-[10px] text-emerald-700 font-black">الإجابة الصحيحة ✅</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong className="font-black block">💡 التفسير العلمي:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Database Operations & Backups */}
      {activeSubTab === 'operations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Backup & Export */}
          <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-xl border border-purple-100 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black">
                💾
              </div>
              <h3 className="text-lg font-black text-purple-950 font-['Changa',sans-serif]">
                تصدير نسخة احتياطية (Backup JSON)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                قم بتحميل نسخة احتياطية كاملة من قاعدة البيانات تشمل جميع الأنشطة التفاعلية، بنك الأسئلة، الروابط، وسجلات الطلاب في ملف واحد يمكنك حفظه واستعادته في أي وقت.
              </p>
            </div>

            <button
              onClick={handleExportBackup}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل نسخة احتياطية كاملة الآن</span>
            </button>
          </div>

          {/* Card 2: Restore & Import */}
          <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-xl border border-purple-100 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl font-black">
                📥
              </div>
              <h3 className="text-lg font-black text-purple-950 font-['Changa',sans-serif]">
                استيراد واستعادة قاعدة البيانات (Restore JSON)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                استرجع نسخة سابقة تم تصديرها من قبل لدمج الأنشطة وسجلات الطلاب على هذا الجهاز بسهولة وسرعة.
              </p>
            </div>

            <label className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-black text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center">
              <Upload className="w-4 h-4" />
              <span>اختيار ملف النسخة الاحتياطية (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {/* Card 3: Clear Student Attempts */}
          <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-xl border border-purple-100 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-black">
                🧹
              </div>
              <h3 className="text-lg font-black text-purple-950 font-['Changa',sans-serif]">
                تفريغ سجل محاولات الطلاب
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                مسح درجات وسجلات الطلاب لبدء فصل دراسي أو تقويم أسبوعي جديد، مع المحافظة على جميع الأنشطة وبنك الأسئلة كما هي دون أي حذف.
              </p>
            </div>

            <button
              onClick={handleClearAttempts}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ درجات الطلاب لدورة جديدة</span>
            </button>
          </div>

          {/* Card 4: Factory Reset */}
          <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-xl border border-rose-100 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-2xl font-black">
                🔄
              </div>
              <h3 className="text-lg font-black text-rose-950 font-['Changa',sans-serif]">
                إعادة ضبط قاعدة البيانات للمصنع
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                استرجاع الأنشطة والروابط وبنك الأسئلة الأصلي المعتمد لمادة العلوم من الصف 1 إلى 10، مع حذف أي أنشطة أو محاولات مخصصة.
              </p>
            </div>

            <button
              onClick={handleResetDatabase}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>استعادة ضبط المصنع الافتراضي</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
