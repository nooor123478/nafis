import React, { useState, useEffect } from 'react';
import { UserProfile, GradeId } from '../types';
import { saveStudentProfile, hasStudentRegisteredName } from '../services/storage';
import { GRADES_DATA } from '../data/mockData';
import { 
  Edit3, 
  Check, 
  GraduationCap, 
  Save, 
  UserPlus, 
  Award,
  ChevronDown
} from 'lucide-react';

interface StudentNameCardProps {
  currentUser: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenFullEditor: () => void;
}

export default function StudentNameCard({
  currentUser,
  onProfileUpdated,
  onOpenFullEditor,
}: StudentNameCardProps) {
  const [studentName, setStudentName] = useState(currentUser.name || '');
  const [grade, setGrade] = useState<GradeId>((currentUser.grade as GradeId) || 4);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasRegistered, setHasRegistered] = useState<boolean>(() => hasStudentRegisteredName());

  // Sync when currentUser changes
  useEffect(() => {
    setStudentName(currentUser.name || '');
    setGrade((currentUser.grade as GradeId) || 4);
  }, [currentUser.name, currentUser.grade]);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = studentName.trim();
    if (!cleanName) return;

    const updated = saveStudentProfile({
      id: currentUser.id,
      name: cleanName,
      grade,
      role: 'student',
    });

    onProfileUpdated(updated);
    setIsSaved(true);
    setIsEditing(false);
    setHasRegistered(true); // تم تسجيل الطالب: لا تظهر الرسالة مرة أخرى بالأسفل
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div 
      id="student-name-edit-box" 
      className="w-full max-w-3xl mx-auto rounded-3xl bg-gradient-to-r from-purple-950/90 via-[#2d1250]/95 to-purple-950/90 border-2 border-amber-400/60 shadow-2xl p-4 sm:p-6 backdrop-blur-xl transition-all"
    >
      {/* Box Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-purple-400/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shadow-md">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white font-['Changa',sans-serif] flex items-center gap-2">
              <span>خانة تعديل اسم الطالب</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                تسجيل فوري
              </span>
            </h3>
            <p className="text-[11px] text-purple-200">
              اكتب اسمك وصفك لحفظ درجاتك والمنافسة في قائمة المتصدرين
            </p>
          </div>
        </div>

        {/* Quick Points & Avatar display */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-900/80 border border-purple-400/30 text-xs font-bold text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentUser.points || 380} نقطة</span>
          </div>

          <button
            type="button"
            onClick={onOpenFullEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white border border-white/20 text-xs font-bold transition-all"
            title="تغيير الصورة الرمزية أو إضافة طالب جديد"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline">إدارة الطلاب</span>
          </button>
        </div>
      </div>

      {/* Box Body Form */}
      <form onSubmit={handleSaveName} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Avatar with click to open full editor */}
          <div 
            onClick={onOpenFullEditor} 
            className="relative cursor-pointer group self-center sm:self-auto shrink-0"
            title="اضغط لتغيير الصورة الرمزية"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/80 group-hover:scale-105 transition-transform shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center text-[10px] font-black shadow">
              ✏️
            </div>
          </div>

          {/* Student Name Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              id="input-inline-student-name"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setIsEditing(true);
              }}
              placeholder="اكتب اسم الطالب هنا..."
              className="w-full px-4 py-3 rounded-2xl bg-white/15 focus:bg-white text-white focus:text-purple-950 font-bold text-sm border border-purple-400/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all placeholder:text-purple-300"
              required
            />
          </div>

          {/* Grade Selector */}
          <div className="relative shrink-0 sm:w-36">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-purple-300">
              <GraduationCap className="w-4 h-4" />
            </div>
            <select
              id="select-inline-student-grade"
              value={grade}
              onChange={(e) => {
                setGrade(Number(e.target.value) as GradeId);
                setIsEditing(true);
              }}
              className="w-full pr-9 pl-3 py-3 rounded-2xl bg-white/15 focus:bg-white text-white focus:text-purple-950 font-bold text-xs sm:text-sm border border-purple-400/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all appearance-none cursor-pointer"
            >
              {GRADES_DATA.map((g) => (
                <option key={g.id} value={g.id} className="text-slate-900 bg-white font-bold">
                  {g.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            id="btn-save-inline-student-name"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all cursor-pointer shrink-0 ${
              isSaved
                ? 'bg-emerald-400 text-emerald-950 shadow-emerald-400/30 scale-[1.02]'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 active:scale-95 text-purple-950 shadow-amber-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>تم الحفظ بنجاح ✓</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ الاسم</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Status / Feedback */}
        {/* بعد تسجيل الطالب اسمة في تسجيل فوري لا تظهر الرساله مرة اخرى بالاسفل */}
        <div className="flex items-center justify-between text-[11px] px-1">
          <div>
            {!hasRegistered && !isSaved && (
              isEditing ? (
                <span className="text-amber-300 font-bold animate-pulse">
                  ⚠️ اضغط «حفظ الاسم» لتثبيت الاسم والصف الدراسي.
                </span>
              ) : (
                <span className="text-purple-300 font-medium">
                  الاسم الحالي مسجل: <strong className="text-amber-300 font-bold">{currentUser.name}</strong> • {GRADES_DATA.find((g) => g.id === (currentUser.grade || 4))?.name}
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onOpenFullEditor}
            className="text-amber-300 hover:text-white font-bold hover:underline transition-colors mr-auto"
          >
            تعديل التفاصيل والصورة ⚙️
          </button>
        </div>
      </form>
    </div>
  );
}
