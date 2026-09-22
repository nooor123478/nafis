import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveTeacherProfile } from '../services/storage';
import { 
  User, 
  School, 
  BookOpen, 
  MessageSquare, 
  Phone, 
  Camera, 
  Check, 
  X, 
  Sparkles, 
  Save 
} from 'lucide-react';

interface TeacherProfileEditorProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export default function TeacherProfileEditor({
  currentUser,
  isOpen,
  onClose,
  onProfileUpdated,
}: TeacherProfileEditorProps) {
  const [name, setName] = useState(currentUser.name || 'أ. فاطمة الزهراء');
  const [school, setSchool] = useState(currentUser.school || 'مدرسة رواد العلوم الحديثة');
  const [subjectTitle, setSubjectTitle] = useState(currentUser.subjectTitle || 'معلم العلوم العامة');
  const [avatar, setAvatar] = useState(currentUser.avatar || AVATAR_OPTIONS[0]);
  const [bio, setBio] = useState(currentUser.bio || 'معلم مادة العلوم والفيزياء للمرحلتين الابتدائية والمتوسطة. شغوف بالتعليم التفاعلي والمختبرات الافتراضية.');
  const [welcomeMessage, setWelcomeMessage] = useState(currentUser.welcomeMessage || 'أهلاً بكم في صفي التفاعلي! نافسوا وتحدوا لتكتشفوا أسرار العلوم معاً.');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveTeacherProfile({
      name: name.trim() || 'معلم العلوم',
      school: school.trim(),
      subjectTitle: subjectTitle.trim(),
      avatar: customAvatarUrl.trim() || avatar,
      bio: bio.trim(),
      welcomeMessage: welcomeMessage.trim(),
      phone: phone.trim(),
    });
    onProfileUpdated(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-600/20">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-purple-950 font-['Changa',sans-serif]">
                تعديل وتخصيص صفحة المعلم
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                خاص بالمعلم
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              عدّل اسمك، مدرستك، المسمى الوظيفي، والرسالة الترحيبية المعروضة لطلابك
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-purple-600" />
              <span>الصورة الرمزية للمعلم:</span>
            </label>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAvatar(url);
                    setCustomAvatarUrl('');
                  }}
                  className={`relative rounded-2xl overflow-hidden p-1 transition-all ${
                    avatar === url && !customAvatarUrl
                      ? 'ring-4 ring-purple-600 scale-105 shadow-md shadow-purple-600/20'
                      : 'opacity-70 hover:opacity-100 hover:scale-100'
                  }`}
                >
                  <img src={url} alt={`avatar-${i}`} className="w-12 h-12 rounded-xl object-cover" />
                  {avatar === url && !customAvatarUrl && (
                    <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              placeholder="أو ضع رابط صورة مخصص (URL)..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-mono text-left"
              dir="ltr"
            />
          </div>

          {/* Teacher Name & School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>اسم المعلم / المعلمة:</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أ. فاطمة الزهراء"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-bold bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-purple-600" />
                <span>اسم المدرسة / الإدارة التعليمية:</span>
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="مثال: مدرسة رواد العلوم الحديثة"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-bold bg-slate-50/50"
              />
            </div>
          </div>

          {/* Job Title & Optional Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>المسمى التخصصي:</span>
              </label>
              <input
                type="text"
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                placeholder="مثال: معلم أول علوم وفيزياء"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-bold bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>وسيلة تواصل أو رقم هاتف (اختياري):</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 966500000000+ أو بريد إلكتروني"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-bold bg-slate-50/50"
              />
            </div>
          </div>

          {/* Welcome Message for Students */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>رسالة الترحيب والتوجيه للطلاب (تظهر في رأس الصفحة):</span>
            </label>
            <input
              type="text"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="اكتب رسالة تشجيعية لطلابك..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-bold bg-slate-50/50"
            />
          </div>

          {/* Bio / About Teacher */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>نبذة تعريفية عن المعلم وأهدافه التعليمية:</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة مختصرة عن خبرتك واهتمامك بالعلوم والتجارب العلمية..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-medium bg-slate-50/50 resize-none"
            />
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-600/25 active:scale-95 transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                  <span>تم حفظ التعديلات بنجاح!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات على الصفحة</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
