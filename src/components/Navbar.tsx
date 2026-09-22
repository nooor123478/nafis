import { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  User, 
  KeyRound, 
  PlusCircle, 
  BookOpen, 
  Compass, 
  GraduationCap, 
  Check, 
  Menu, 
  X,
  Share2,
  Database,
  Lock,
  ShieldCheck,
  Edit3,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface NavbarProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPinModal: () => void;
  onCreateActivityClick: () => void;
  isTeacherUnlocked: boolean;
  onRequestTeacherAccess: (targetTab?: string) => void;
  onOpenStudentProfileEditor?: () => void;
}

export default function Navbar({
  currentUser,
  onSelectUser,
  activeTab,
  setActiveTab,
  onOpenPinModal,
  onCreateActivityClick,
  isTeacherUnlocked,
  onRequestTeacherAccess,
  onOpenStudentProfileEditor,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Compass },
    { id: 'grades', label: 'الصفوف والحلقات', icon: BookOpen },
    { id: 'resources', label: 'الروابط التعليمية', icon: Share2 },
    { id: 'activities', label: 'الأنشطة والتحديات', icon: Sparkles },
    { id: 'leaderboard', label: 'لوحة المتصدرين', icon: Trophy },
    // Only show teacher tab openly once unlocked, otherwise subtle discreet access
    ...(isTeacherUnlocked
      ? [
          {
            id: 'teacher',
            label: 'لوحة تحكم المعلم',
            icon: Database,
          },
        ]
      : []),
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'teacher' && !isTeacherUnlocked) {
      onRequestTeacherAccess('teacher');
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#250e42]/90 border-b border-purple-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Slogan with subtle teacher entry point */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
              id="nav-logo"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-purple-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform">
                🚀
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-white font-['Changa',sans-serif]">
                    نافس وتعلم
                  </span>
                  <span className="text-[10px] uppercase font-black bg-purple-600/60 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                    علوم وأحياء 1-10
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-amber-300/90 tracking-wide">
                    تعلّم • تفاعل • نافس • أنجز
                  </span>
                  {/* Subtle, discreet teacher entry dot */}
                  <button
                    id="teacher-subtle-trigger-dot"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTeacherUnlocked) {
                        setActiveTab('teacher');
                      } else {
                        onRequestTeacherAccess('teacher');
                      }
                    }}
                    title="•"
                    aria-label="دخول المعلم"
                    className="w-2.5 h-2.5 rounded-full bg-amber-400/30 hover:bg-amber-400 hover:scale-125 transition-all cursor-pointer opacity-40 hover:opacity-100 ml-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-purple-950/40 p-1.5 rounded-2xl border border-purple-500/20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50'
                      : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Challenge quick entry button */}
            <button
              id="btn-live-challenge-nav"
              onClick={onOpenPinModal}
              title="دخول تحدي مباشر في الفصل برمز PIN"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-red-600/30 to-amber-500/30 hover:from-red-600/40 hover:to-amber-500/40 text-amber-300 border border-red-400/50 shadow-md shadow-red-500/10 transition-all hover:scale-105 active:scale-95"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>تحدي مباشر 🔴</span>
            </button>

            {/* Quick PIN Entry button */}
            <button
              id="btn-pin-entry"
              onClick={onOpenPinModal}
              title="دخول سريع برمز النشاط"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 transition-all hover:scale-105 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>رمز PIN</span>
            </button>

            {/* Quick Create Activity if Teacher */}
            {currentUser.role === 'teacher' && (
              <button
                id="btn-quick-create"
                onClick={onCreateActivityClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 hover:brightness-105 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ أنشئ نشاطك</span>
              </button>
            )}

            {/* User Profile / Role Selector */}
            <div className="relative">
              <button
                id="btn-user-menu"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-400/30 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-amber-400/60"
                />
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-black text-white leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    {currentUser.role === 'teacher' ? '👨🏫 معلّم' : currentUser.role === 'admin' ? '👑 مدير' : `⭐ ${currentUser.points || 380} نقطة`}
                  </span>
                </div>
              </button>

              {/* User Switcher Dropdown */}
              {showUserMenu && (
                <div 
                  id="user-menu-dropdown"
                  className="absolute left-0 mt-3 w-72 rounded-2xl bg-white text-slate-800 shadow-2xl border border-purple-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-3 border-b border-slate-100 bg-purple-50/50 rounded-xl mb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-400">الحساب الحالي</p>
                      <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        {currentUser.role === 'student' ? 'طالب' : 'معلم'}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-purple-950 mt-1">{currentUser.name}</p>
                    <p className="text-xs text-purple-700 font-medium">{currentUser.school || 'منصة نافس وتعلم'}</p>

                    {/* Quick Student Actions if student */}
                    {currentUser.role === 'student' && onOpenStudentProfileEditor && (
                      <div className="mt-2.5 pt-2 border-t border-purple-200/60 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenStudentProfileEditor();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل الاسم</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenStudentProfileEditor();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-black transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>إضافة طالب</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="py-2">
                    <p className="text-[11px] font-bold text-slate-400 px-2.5 mb-1.5">تبديل الدور للتجربة:</p>
                    
                    {/* Switch to Student */}
                    <button
                      id="switch-user-student"
                      onClick={() => {
                        onSelectUser(DEMO_USERS.student);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
                        currentUser.role === 'student' ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👨🎓</span>
                        <div className="text-right">
                          <p className="font-black text-slate-900">طالب (أحمد خالد)</p>
                          <p className="text-[10px] text-slate-500">حل الأسئلة، جمع النقاط والمنافسة</p>
                        </div>
                      </div>
                      {currentUser.role === 'student' && <Check className="w-4 h-4 text-purple-600" />}
                    </button>

                    {/* Switch to Teacher (Discreet / Protected) */}
                    <button
                      id="switch-user-teacher"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (!isTeacherUnlocked) {
                          onRequestTeacherAccess('teacher');
                        } else {
                          onSelectUser(DEMO_USERS.teacher);
                          setActiveTab('teacher');
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all mt-1 ${
                        currentUser.role === 'teacher' ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👩‍🏫</span>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <p className="font-black text-slate-900">معلم (أ. فاطمة)</p>
                            {!isTeacherUnlocked && (
                              <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-purple-100 text-purple-700 font-black border border-purple-200 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>محمي</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">خاص بالمعلم ومسؤول المادة</p>
                        </div>
                      </div>
                      {currentUser.role === 'teacher' ? (
                        <Check className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-purple-900/60 text-purple-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-purple-500/20 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-right transition-all ${
                    isActive ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-purple-800/40'
                  }`}
                >
                  <Icon className="w-5 h-5 text-amber-300" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onOpenPinModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 mt-1"
            >
              <KeyRound className="w-5 h-5" />
              <span>دخول برمز النشاط (PIN)</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
