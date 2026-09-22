import React, { useState } from 'react';
import { UserProfile, GradeId } from '../types';
import { 
  getStudentProfile, 
  saveStudentProfile, 
  getSavedStudents, 
  addSavedStudent, 
  deleteSavedStudent, 
  setCurrentUser 
} from '../services/storage';
import { 
  User, 
  School, 
  GraduationCap, 
  Sparkles, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  UserCheck, 
  Edit3,
  Camera,
  Save,
  Users
} from 'lucide-react';
import { GRADES_DATA } from '../data/mockData';

interface StudentProfileEditorProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  isFirstTime?: boolean;
}

const STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export default function StudentProfileEditor({
  currentUser,
  isOpen,
  onClose,
  onProfileUpdated,
  isFirstTime = false,
}: StudentProfileEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'add_new' | 'list'>('edit');
  
  // Edit State
  const [name, setName] = useState(currentUser.name || 'أحمد خالد المطوع');
  const [grade, setGrade] = useState<GradeId>((currentUser.grade as GradeId) || 4);
  const [school, setSchool] = useState(currentUser.school || 'مدرسة النخبة الابتدائية');
  const [avatar, setAvatar] = useState(currentUser.avatar || STUDENT_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [bio, setBio] = useState(currentUser.bio || 'مستكشف علوم طموح وشغوف بالأحياء والفضاء');

  // New Student State
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<GradeId>(4);
  const [newSchool, setNewSchool] = useState('مدرسة النخبة الابتدائية');
  const [newAvatar, setNewAvatar] = useState(STUDENT_AVATARS[1]);

  const [savedList, setSavedList] = useState<UserProfile[]>(getSavedStudents());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle updating current student
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenAvatar = customAvatarUrl.trim() || avatar;
    const updated = saveStudentProfile({
      id: currentUser.id || `s-${Date.now()}`,
      name: name.trim(),
      grade,
      school: school.trim(),
      avatar: chosenAvatar,
      bio: bio.trim(),
      role: 'student',
    });

    setSavedList(getSavedStudents());
    onProfileUpdated(updated);
    setSuccessMessage('تم تعديل وحفظ بيانات الطالب بنجاح! ✨');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 900);
  };

  // Handle adding a brand new student
  const handleCreateNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addSavedStudent({
      name: newName.trim(),
      grade: newGrade,
      school: newSchool.trim(),
      avatar: newAvatar,
      points: 100,
      bio: 'طالب ومستكشف جديد في المنصة',
    });

    setCurrentUser(created);
    setSavedList(getSavedStudents());
    onProfileUpdated(created);
    setNewName('');
    setSuccessMessage(`تمت إضافة الطالب (${created.name}) بنجاح وتم تفعيله! 🎉`);
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTab('edit');
      setName(created.name);
      setGrade(created.grade as GradeId || 4);
      setSchool(created.school || '');
      setAvatar(created.avatar);
      onClose();
    }, 1000);
  };

  // Switch to student from list
  const handleSelectStudent = (student: UserProfile) => {
    setCurrentUser(student);
    saveStudentProfile(student);
    setName(student.name);
    setGrade((student.grade as GradeId) || 4);
    setSchool(student.school || '');
    setAvatar(student.avatar);
    setBio(student.bio || '');
    onProfileUpdated(student);
    setSuccessMessage(`تم التبديل إلى الطالب: ${student.name} 👏`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 700);
  };

  // Delete student from list
  const handleDeleteStudent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (savedList.length <= 1) {
      alert('يجب الإبقاء على طالب واحد على الأقل في القائمة.');
      return;
    }
    const updated = deleteSavedStudent(id);
    setSavedList(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="student-profile-modal-container"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              {isFirstTime ? '🚀' : '👨🎓'}
            </div>
            <div>
              <h2 className="text-lg font-black font-['Changa',sans-serif]">
                {isFirstTime ? '👋 أهلاً بك يا بطل! سجّل اسمك للبدء' : 'إدارة وبيانات الطالب'}
              </h2>
              <p className="text-xs text-purple-200">
                {isFirstTime 
                  ? 'سجّل اسمك وصفك الدراسي لحفظ إنجازاتك والمنافسة في الأنشطة والتحديات' 
                  : 'إضافة وتعديل اسم الطالب، الصف الدراسي والصورة الرمزية'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-purple-100 bg-purple-50/50 p-2 gap-1">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل اسم الطالب الحالي</span>
          </button>

          <button
            onClick={() => setActiveTab('add_new')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'add_new'
                ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة طالب جديد</span>
          </button>

          <button
            onClick={() => {
              setSavedList(getSavedStudents());
              setActiveTab('list');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'list'
                ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>قائمة الطلاب ({savedList.length})</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Edit Current Student Form */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSaveCurrent} className="p-6 space-y-5 overflow-y-auto">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>اسم الطالب الكامل <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                id="input-edit-student-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد خالد المطوع"
                className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                سيظهر هذا الاسم في لوحة الشرف والمتصدرين، وشهادات الأنشطة وتقارير المعلم.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Grade */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>الصف الدراسي</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value) as GradeId)}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {GRADES_DATA.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-purple-600" />
                  <span>اسم المدرسة</span>
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="مدرسة النخبة الابتدائية"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>اختر الصورة الرمزية للطالب</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {STUDENT_AVATARS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(img);
                      setCustomAvatarUrl('');
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                      avatar === img && !customAvatarUrl
                        ? 'border-purple-600 ring-4 ring-purple-200 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Avatar" className="w-full h-full object-cover" />
                    {avatar === img && !customAvatarUrl && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-2.5">
                <input
                  type="text"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="أو ضع رابط صورة مخصصة (اختياري)..."
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Bio / Goal */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5">
                طموح الطالب / نبذة قصيرة
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="مثال: أحب إجراء التجارب الكيميائية واستكشاف الفضاء"
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-purple-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                id="btn-save-student-profile"
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-purple-600/25 transition-transform hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isFirstTime ? '🚀 تأكيد الاسم والدخول للمنصة' : 'حفظ اسم وتفاصيل الطالب'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Add Brand New Student */}
        {activeTab === 'add_new' && (
          <form onSubmit={handleCreateNewStudent} className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900 leading-relaxed font-bold">
              💡 يمكنك إضافة طالب جديد (مثلاً لأخ أو زميل في الصف)، وسيتم حفظه في القائمة للتبديل السريع بين حسابات الطلاب في أي وقت!
            </div>

            {/* New Name */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>اسم الطالب الجديد <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                id="input-new-student-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: مريم العلي أو فيصل الحربي"
                className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Grade */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>الصف الدراسي</span>
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value) as GradeId)}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {GRADES_DATA.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-purple-600" />
                  <span>اسم المدرسة</span>
                </label>
                <input
                  type="text"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  placeholder="مدرسة النخبة الابتدائية"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>اختر الصورة الرمزية للطالب الجديد</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {STUDENT_AVATARS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewAvatar(img)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                      newAvatar === img
                        ? 'border-purple-600 ring-4 ring-purple-200 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Avatar" className="w-full h-full object-cover" />
                    {newAvatar === img && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-purple-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                id="btn-confirm-add-student"
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة الطالب والبدء به الآن</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Saved Students List */}
        {activeTab === 'list' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500">
                اختر طالباً للتبديل إليه فوراً أو عدل معلوماته:
              </p>
              <button
                onClick={() => setActiveTab('add_new')}
                className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة طالب</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {savedList.map((stu) => {
                const isCurrent = currentUser.name === stu.name;
                return (
                  <div
                    key={stu.id}
                    onClick={() => handleSelectStudent(stu)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-200'
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-purple-200"
                      />
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900">{stu.name}</p>
                          {isCurrent && (
                            <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full">
                              الحساب النشط
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                          الصف {stu.grade || 4} • {stu.school || 'مدرسة العلوم'} • {stu.points || 0} نقطة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStudent(stu);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                          isCurrent
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        }`}
                      >
                        {isCurrent ? 'النشط حالياً' : 'تفعيل'}
                      </button>

                      {savedList.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteStudent(e, stu.id)}
                          title="حذف من القائمة"
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
