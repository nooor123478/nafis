import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  CycleId, 
  GradeId, 
  Activity, 
  Resource, 
  StudentAttempt, 
  LeaderboardUser 
} from './types';
import { DEMO_USERS, GRADES_DATA } from './data/mockData';
import { 
  initializeStorage, 
  getCurrentUser, 
  setCurrentUser, 
  getActivities, 
  saveActivity, 
  deleteActivity, 
  duplicateActivity, 
  incrementActivityPlayCount,
  getResources, 
  saveResource, 
  deleteResource,
  incrementResourceClicks,
  getStudentAttempts, 
  saveStudentAttempt, 
  getLeaderboard,
  getActivityByShareCode,
  isTeacherSessionUnlocked,
  setTeacherSessionUnlocked,
  hasStudentRegisteredName,
} from './services/storage';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CycleGradeSelector from './components/CycleGradeSelector';
import GradeScienceExplorer from './components/GradeScienceExplorer';
import ActivityRunner from './components/ActivityRunner';
import ActivityResults from './components/ActivityResults';
import ActivityCreator from './components/ActivityCreator';
import TeacherDashboard from './components/TeacherDashboard';
import ResourcesLibrary from './components/ResourcesLibrary';
import LeaderboardView from './components/LeaderboardView';
import ShareModal from './components/ShareModal';
import QuickPinModal from './components/QuickPinModal';
import ResourceViewerModal from './components/ResourceViewerModal';
import TeacherLiveMonitor from './components/TeacherLiveMonitor';
import StudentLiveRunner from './components/StudentLiveRunner';
import TeacherAuthModal from './components/TeacherAuthModal';
import StudentProfileEditor from './components/StudentProfileEditor';
import { LiveSession } from './types';

export default function App() {
  // Initialize Storage once
  useEffect(() => {
    initializeStorage();
  }, []);

  // Application State
  const [currentUser, setUserState] = useState<UserProfile>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCycle, setSelectedCycle] = useState<CycleId>('cycle-1');
  const [selectedGradeId, setSelectedGradeId] = useState<GradeId | null>(null);

  // Database Data States
  const [activities, setActivities] = useState<Activity[]>(() => getActivities());
  const [resources, setResources] = useState<Resource[]>(() => getResources());
  const [studentAttempts, setStudentAttempts] = useState<StudentAttempt[]>(() => getStudentAttempts());
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => getLeaderboard());

  // Interactive Runners & Modals
  const [runningActivity, setRunningActivity] = useState<Activity | null>(null);
  const [completedAttempt, setCompletedAttempt] = useState<StudentAttempt | null>(null);
  const [isCreatingActivity, setIsCreatingActivity] = useState<boolean>(false);
  const [activityCreationMode, setActivityCreationMode] = useState<'manual' | 'ai'>('ai');
  const [isInitialRegistration, setIsInitialRegistration] = useState<boolean>(() => !hasStudentRegisteredName());
  const [isStudentProfileEditorOpen, setIsStudentProfileEditorOpen] = useState<boolean>(() => !hasStudentRegisteredName());
  const [shareTargetActivity, setShareTargetActivity] = useState<Activity | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState<boolean>(false);
  const [liveTeacherActivity, setLiveTeacherActivity] = useState<Activity | null>(null);
  const [liveStudentPin, setLiveStudentPin] = useState<string | null>(null);

  // Teacher passcode authorization state (PIN: 1988)
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState<boolean>(() => isTeacherSessionUnlocked());
  const [isTeacherAuthModalOpen, setIsTeacherAuthModalOpen] = useState<boolean>(false);
  const [pendingTeacherCallback, setPendingTeacherCallback] = useState<(() => void) | null>(null);

  const requestTeacherAccess = (callback?: () => void) => {
    if (isTeacherUnlocked) {
      callback?.();
    } else {
      setPendingTeacherCallback(() => callback);
      setIsTeacherAuthModalOpen(true);
    }
  };

  const handleTeacherAuthSuccess = () => {
    setTeacherSessionUnlocked(true);
    setIsTeacherUnlocked(true);
    setIsTeacherAuthModalOpen(false);
    handleSelectUser(DEMO_USERS.teacher);
    if (pendingTeacherCallback) {
      pendingTeacherCallback();
      setPendingTeacherCallback(null);
    } else {
      setActiveTab('teacher');
    }
  };

  const handleLockTeacherDatabase = () => {
    setTeacherSessionUnlocked(false);
    setIsTeacherUnlocked(false);
    handleSelectUser(DEMO_USERS.student);
    setActiveTab('home');
  };

  const refreshDatabaseState = () => {
    setActivities(getActivities());
    setResources(getResources());
    setStudentAttempts(getStudentAttempts());
    setLeaderboard(getLeaderboard());
  };

  // Check URL parameters for direct activity PIN share link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pin = params.get('pin');
      if (pin) {
        if (/^\d{5,6}$/.test(pin)) {
          setLiveStudentPin(pin);
        } else {
          const found = getActivityByShareCode(pin);
          if (found) {
            setRunningActivity(found);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Update current user
  const handleSelectUser = (user: UserProfile) => {
    setUserState(user);
    setCurrentUser(user);
  };

  // Launch Activity
  const handleLaunchActivity = (act: Activity) => {
    incrementActivityPlayCount(act.id);
    setActivities(getActivities());
    setRunningActivity(act);
    setCompletedAttempt(null);
    setLiveTeacherActivity(null);
    setLiveStudentPin(null);
  };

  // Activity Completion Handler
  const handleFinishAttempt = (attempt: StudentAttempt) => {
    saveStudentAttempt(attempt);
    setStudentAttempts(getStudentAttempts());
    setLeaderboard(getLeaderboard());
    setRunningActivity(null);
    setCompletedAttempt(attempt);
  };

  // Save results from Live Challenge
  const handleSaveLiveResults = (session: LiveSession) => {
    const participants = Object.values(session.participants);
    participants.forEach((p) => {
      const attempt: StudentAttempt = {
        id: `att-live-${Date.now()}-${p.id}`,
        studentId: p.id,
        studentName: p.name,
        studentAvatar: p.avatar,
        activityId: session.activityId,
        activityTitle: session.activityTitle,
        gradeId: session.activity.gradeId,
        score: p.score,
        maxScore: session.activity.totalPoints,
        correctAnswersCount: Math.round(p.score / (session.activity.questions[0]?.points || 10)),
        wrongAnswersCount: Math.max(0, session.activity.questions.length - Math.round(p.score / (session.activity.questions[0]?.points || 10))),
        timeSpentSeconds: session.activity.totalTimeSeconds,
        percentage: Math.min(100, Math.round((p.score / (session.activity.totalPoints || 1)) * 100)),
        date: new Date().toISOString().split('T')[0],
        userAnswers: [],
      };
      saveStudentAttempt(attempt);
    });
    setStudentAttempts(getStudentAttempts());
    setLeaderboard(getLeaderboard());
  };

  // Save new activity from Teacher's Activity Creator
  const handleSaveActivity = (newActivity: Activity) => {
    saveActivity(newActivity);
    setActivities(getActivities());
    setIsCreatingActivity(false);
    setActiveTab('teacher');
    setShareTargetActivity(newActivity);
  };

  // Duplicate activity
  const handleDuplicateActivity = (id: string) => {
    const dup = duplicateActivity(id);
    if (dup) {
      setActivities(getActivities());
    }
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    deleteActivity(id);
    setActivities(getActivities());
  };

  // Open resource viewer
  const handleOpenResource = (res: Resource) => {
    incrementResourceClicks(res.id);
    setResources(getResources());
    setViewingResource(res);
  };

  // Add new educational resource
  const handleAddResource = (newRes: Resource) => {
    saveResource(newRes);
    setResources(getResources());
  };

  // Update educational resource
  const handleUpdateResource = (updatedRes: Resource) => {
    saveResource(updatedRes);
    setResources(getResources());
  };

  // Delete educational resource
  const handleDeleteResource = (id: string) => {
    deleteResource(id);
    setResources(getResources());
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#2D124D] via-[#4A1E82] to-[#1E0B36] text-white selection:bg-amber-400 selection:text-purple-950 font-['Tajawal',sans-serif]">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setRunningActivity(null);
          setCompletedAttempt(null);
          setIsCreatingActivity(false);
          setLiveTeacherActivity(null);
          setLiveStudentPin(null);
        }}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onCreateActivityClick={() => {
          requestTeacherAccess(() => {
            setActivityCreationMode('ai');
            setIsCreatingActivity(true);
            setRunningActivity(null);
            setCompletedAttempt(null);
            setLiveTeacherActivity(null);
            setLiveStudentPin(null);
          });
        }}
        isTeacherUnlocked={isTeacherUnlocked}
        onRequestTeacherAccess={(targetTab) => {
          requestTeacherAccess(() => {
            if (targetTab) setActiveTab(targetTab);
          });
        }}
        onOpenStudentProfileEditor={() => setIsStudentProfileEditorOpen(true)}
      />

      {/* 2. Main Content View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* VIEW: Live Teacher Monitor */}
        {liveTeacherActivity ? (
          <TeacherLiveMonitor
            activity={liveTeacherActivity}
            currentUser={currentUser}
            onExit={() => setLiveTeacherActivity(null)}
            onSaveLiveResults={handleSaveLiveResults}
          />
        ) : liveStudentPin ? (
          /* VIEW: Live Student Runner */
          <StudentLiveRunner
            pin={liveStudentPin}
            currentUser={currentUser}
            onExit={() => setLiveStudentPin(null)}
          />
        ) : runningActivity ? (
          /* VIEW: Running Active Challenge / Quiz */
          <ActivityRunner
            activity={runningActivity}
            student={currentUser}
            onFinish={handleFinishAttempt}
            onExit={() => setRunningActivity(null)}
          />
        ) : completedAttempt ? (
          /* VIEW: Activity Results & Celebration */
          <ActivityResults
            attempt={completedAttempt}
            onRetry={() => {
              const act = activities.find((a) => a.id === completedAttempt.activityId);
              if (act) handleLaunchActivity(act);
              else setCompletedAttempt(null);
            }}
            onGoHome={() => {
              setCompletedAttempt(null);
              setActiveTab('home');
            }}
            onGoLeaderboard={() => {
              setCompletedAttempt(null);
              setActiveTab('leaderboard');
            }}
          />
        ) : isCreatingActivity ? (
          /* VIEW: Teacher's "Activity Factory" (إنشاء نشاط تفاعلي يدوي أو بالذكاء الاصطناعي) */
          <ActivityCreator
            currentUser={currentUser}
            initialGradeId={selectedGradeId || 4}
            initialMode={activityCreationMode}
            onSaveActivity={handleSaveActivity}
            onCancel={() => setIsCreatingActivity(false)}
          />
        ) : selectedGradeId ? (
          /* VIEW: Grade Science Explorer (مادة العلوم للصف المختار) */
          <GradeScienceExplorer
            gradeId={selectedGradeId}
            activities={activities}
            resources={resources}
            onBack={() => setSelectedGradeId(null)}
            onLaunchActivity={handleLaunchActivity}
            onOpenResource={handleOpenResource}
            onCreateActivityForGrade={(gId) => {
              setSelectedGradeId(gId);
              setActivityCreationMode('ai');
              setIsCreatingActivity(true);
            }}
          />
        ) : activeTab === 'home' ? (
          /* VIEW: Homepage */
          <div className="space-y-10">
            <HeroSection
              onSelectCycle={(cycle) => {
                setSelectedCycle(cycle);
                setActiveTab('grades');
              }}
              onStudentStart={() => {
                // Launch first featured challenge
                if (activities.length > 0) {
                  handleLaunchActivity(activities[0]);
                }
              }}
              onTeacherDashboard={() => {
                requestTeacherAccess(() => {
                  handleSelectUser(DEMO_USERS.teacher);
                  setActiveTab('teacher');
                });
              }}
              onOpenPinModal={() => setIsPinModalOpen(true)}
              onExploreResources={() => setActiveTab('resources')}
              isTeacherUnlocked={isTeacherUnlocked}
              currentUser={currentUser}
              onEditStudentName={() => setIsStudentProfileEditorOpen(true)}
              onProfileUpdated={(updated) => {
                handleSelectUser(updated);
                setIsInitialRegistration(false);
                refreshDatabaseState();
              }}
            />

            {/* Quick Grades Selector on Homepage */}
            <CycleGradeSelector
              selectedCycle={selectedCycle}
              onSelectCycle={setSelectedCycle}
              onSelectGrade={(gradeId) => setSelectedGradeId(gradeId)}
            />
          </div>
        ) : activeTab === 'grades' ? (
          /* VIEW: All Cycles and Grades (الحلقة الأولى & الثانية) */
          <CycleGradeSelector
            selectedCycle={selectedCycle}
            onSelectCycle={setSelectedCycle}
            onSelectGrade={(gradeId) => setSelectedGradeId(gradeId)}
          />
        ) : activeTab === 'activities' ? (
          /* VIEW: All Interactive Activities */
          <div className="py-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-['Changa',sans-serif] flex items-center gap-2">
                  <span>🎮</span>
                  <span>الأنشطة والتحديات التنافسية</span>
                </h1>
                <p className="text-xs sm:text-sm text-purple-200 mt-1">
                  اختر أي نشاط علمي وابدأ التحدي والمنافسة لكسب النقاط واعتلاء لوحة الشرف!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold hover:bg-amber-400/30"
                >
                  🔐 دخول برمز النشاط (PIN)
                </button>
                {currentUser.role === 'teacher' && (
                  <button
                    onClick={() => setIsCreatingActivity(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:scale-105 shadow-md"
                  >
                    + أنشئ نشاطاً جديداً
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-3xl bg-white text-slate-800 overflow-hidden shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-purple-100 flex flex-col justify-between"
                >
                  <div>
                    {activity.coverImage && (
                      <div className="relative h-44 w-full overflow-hidden bg-purple-900">
                        <img
                          src={activity.coverImage}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-black bg-purple-600 text-white">
                          الصف {activity.gradeId}
                        </span>
                        <span className="absolute bottom-3 right-3 text-xs font-bold text-amber-300">
                          ⭐ {activity.totalPoints} نقطة
                        </span>
                        <span className="absolute bottom-3 left-3 text-xs font-bold text-white/90">
                          ⏱️ {activity.totalTimeSeconds} ثانية
                        </span>
                      </div>
                    )}

                    <div className="p-5">
                      <span className="text-[11px] font-bold text-purple-700">
                        {activity.unitTitle.split(':')[0]}
                      </span>
                      <h3 className="text-base font-black text-purple-950 mt-1">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs bg-purple-50 p-2.5 rounded-xl text-purple-900 font-bold">
                        <span>📝 {activity.questionsCount} أسئلة</span>
                        <span>رمز النشاط: {activity.shareCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => handleLaunchActivity(activity)}
                      className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>▶️ بدء النشاط</span>
                    </button>
                    <button
                      onClick={() => {
                        setRunningActivity(null);
                        setCompletedAttempt(null);
                        setLiveStudentPin(null);
                        setLiveTeacherActivity(activity);
                      }}
                      title="بدء تحدي مباشر في الفصل لحظياً لجميع الطلاب"
                      className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-red-600/20 transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span>🔴 تحدي مباشر</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'resources' ? (
          /* VIEW: Resources Library (قسم الروابط التعليمية) */
          <ResourcesLibrary
            resources={resources}
            currentUser={currentUser}
            onOpenResource={handleOpenResource}
            onAddResource={handleAddResource}
            onUpdateResource={handleUpdateResource}
            onDeleteResource={handleDeleteResource}
            isAddModalOpen={isAddResourceModalOpen}
            setIsAddModalOpen={setIsAddResourceModalOpen}
          />
        ) : activeTab === 'leaderboard' ? (
          /* VIEW: Leaderboard (لوحة المتصدرين) */
          <LeaderboardView leaderboard={leaderboard} />
        ) : activeTab === 'teacher' ? (
          /* VIEW: Teacher Dashboard (لوحة تحكم المعلم وقاعدة البيانات) */
          !isTeacherUnlocked ? (
            <div className="py-16 px-4 text-center max-w-md mx-auto space-y-6 animate-in fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-950/90 border-2 border-amber-400/50 text-amber-300 flex items-center justify-center text-4xl shadow-2xl shadow-purple-900/50">
                🔐
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
                  منطقة مؤمنة للمعلم
                </span>
                <h2 className="text-2xl font-black text-white font-['Changa',sans-serif]">
                  بوابة المعلم محمية برمز سري
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                  هذه المساحة مخصصة للمعلم لإدارة بنك الأسئلة، إعداد الأنشطة، والاطلاع على قاعدة بيانات درجات ومحاولات الطلاب وتعديل صفحته الخاصة.
                </p>
              </div>

              <button
                onClick={() => setIsTeacherAuthModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 text-purple-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🔓 إدخال الرمز السري وفتح بوابة المعلم</span>
              </button>
            </div>
          ) : (
            <TeacherDashboard
              currentUser={currentUser}
              activities={activities}
              resources={resources}
              studentAttempts={studentAttempts}
              onCreateActivity={(mode) => {
                setActivityCreationMode(mode || 'ai');
                setIsCreatingActivity(true);
              }}
              onLaunchActivity={handleLaunchActivity}
              onStartLiveChallenge={(activity) => {
                setRunningActivity(null);
                setCompletedAttempt(null);
                setLiveStudentPin(null);
                setLiveTeacherActivity(activity);
              }}
              onDuplicateActivity={handleDuplicateActivity}
              onDeleteActivity={handleDeleteActivity}
              onOpenShareModal={(act) => setShareTargetActivity(act)}
              onAddResourceClick={() => setIsAddResourceModalOpen(true)}
              onLockDatabase={handleLockTeacherDatabase}
              onDataModified={refreshDatabaseState}
              onUpdateProfile={(updated) => {
                handleSelectUser(updated);
                refreshDatabaseState();
              }}
            />
          )
        ) : null}

      </main>

      {/* 3. Footer */}
      <footer className="mt-auto border-t border-purple-500/20 bg-[#1e0b36]/90 backdrop-blur-md py-8 text-center text-xs text-purple-300 space-y-2">
        <div className="flex items-center justify-center gap-2 font-black text-sm text-white font-['Changa',sans-serif]">
          <span>🚀 نافس وتعلم</span>
          <span>•</span>
          <span className="text-amber-300">تعلّم • تفاعل • نافس • أنجز</span>
        </div>
        <p className="text-purple-400">
          منصة تعليمية عربية متخصصة في مادة العلوم والأحياء للصفوف (1–10) • الحلقة الأولى والثانية
        </p>
        <div className="flex items-center justify-center gap-3 text-[11px] text-purple-500">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} منصة نافس وتعلم</span>
          <span>•</span>
          {/* Subtle teacher access point */}
          <button
            id="footer-teacher-subtle-btn"
            onClick={() => {
              if (isTeacherUnlocked) {
                setActiveTab('teacher');
              } else {
                requestTeacherAccess(() => {
                  handleSelectUser(DEMO_USERS.teacher);
                  setActiveTab('teacher');
                });
              }
            }}
            className="text-purple-500/60 hover:text-purple-300 transition-colors text-[10px] cursor-pointer hover:underline"
          >
            بوابة المعلم
          </button>
        </div>
      </footer>

      {/* 4. Global Modals */}
      {/* Student Profile / Name Editor Modal */}
      <StudentProfileEditor
        currentUser={currentUser}
        isOpen={isStudentProfileEditorOpen}
        isFirstTime={isInitialRegistration}
        onClose={() => {
          setIsStudentProfileEditorOpen(false);
          setIsInitialRegistration(false);
        }}
        onProfileUpdated={(updated) => {
          handleSelectUser(updated);
          setIsInitialRegistration(false);
          refreshDatabaseState();
        }}
      />

      {/* Teacher Passcode Auth Modal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthModalOpen}
        onClose={() => {
          setIsTeacherAuthModalOpen(false);
          setPendingTeacherCallback(null);
        }}
        onSuccess={handleTeacherAuthSuccess}
      />

      {/* Share Modal */}
      {shareTargetActivity && (
        <ShareModal
          activity={shareTargetActivity}
          isOpen={!!shareTargetActivity}
          onClose={() => setShareTargetActivity(null)}
          onLaunch={(act) => {
            setShareTargetActivity(null);
            handleLaunchActivity(act);
          }}
        />
      )}

      {/* Quick PIN Modal */}
      <QuickPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        activities={activities}
        onLaunchActivity={handleLaunchActivity}
        onJoinLiveChallenge={(pin) => {
          setRunningActivity(null);
          setCompletedAttempt(null);
          setLiveTeacherActivity(null);
          setLiveStudentPin(pin);
        }}
      />

      {/* Resource Viewer Modal */}
      <ResourceViewerModal
        resource={viewingResource}
        onClose={() => setViewingResource(null)}
      />

    </div>
  );
}
