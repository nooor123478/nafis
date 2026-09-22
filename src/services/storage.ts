import { Activity, Resource, StudentAttempt, LeaderboardUser, UserProfile } from '../types';
import { INITIAL_ACTIVITIES, INITIAL_RESOURCES, INITIAL_LEADERBOARD, DEMO_USERS } from '../data/mockData';

const STORAGE_KEYS = {
  ACTIVITIES: 'nafes_activities_v1',
  RESOURCES: 'nafes_resources_v1',
  ATTEMPTS: 'nafes_student_attempts_v1',
  LEADERBOARD: 'nafes_leaderboard_v1',
  CURRENT_USER: 'nafes_current_user_v1',
  TEACHER_PIN: 'nafes_teacher_pin_v1',
  TEACHER_SESSION: 'nafes_teacher_unlocked_session_v1',
  TEACHER_PROFILE: 'nafes_teacher_profile_custom_v1',
  STUDENT_PROFILE: 'nafes_student_profile_custom_v1',
  SAVED_STUDENTS: 'nafes_saved_students_list_v1',
  STUDENT_NAME_REGISTERED: 'nafes_student_name_registered_v1',
};

// Default starter students
export const DEFAULT_STUDENTS: UserProfile[] = [
  {
    id: 's-201',
    name: 'أحمد خالد المطوع',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    grade: 4,
    points: 380,
    school: 'مدرسة النخبة الابتدائية',
    bio: 'مستكشف علوم طموح وشغوف بالأحياء والفضاء',
  },
  {
    id: 's-202',
    name: 'سارة المنصوري',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    grade: 5,
    points: 420,
    school: 'مدرسة الأمل النموذجية',
    bio: 'عاشقة للتجارب العلمية والبيئة',
  },
  {
    id: 's-203',
    name: 'عمر القحطاني',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: 6,
    points: 310,
    school: 'مدرسة الرواد الحديثة',
    bio: 'مهتم بالمجموعات الشمسية وحركة الكواكب',
  }
];

// Student Profile Management
export function getStudentProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
    if (raw) {
      return { ...DEFAULT_STUDENTS[0], ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STUDENTS[0];
}

export function saveStudentProfile(profile: Partial<UserProfile>): UserProfile {
  try {
    const current = getStudentProfile();
    const updated: UserProfile = { 
      ...current, 
      ...profile, 
      role: 'student',
      id: profile.id || current.id || `s-${Date.now()}`
    };
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(updated));
    
    // Update in saved students list
    const students = getSavedStudents();
    const existingIndex = students.findIndex((s) => s.id === updated.id || s.name === current.name);
    if (existingIndex >= 0) {
      students[existingIndex] = updated;
    } else {
      students.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_STUDENTS, JSON.stringify(students));

    // If current active user is student, update current user too
    const active = getCurrentUser();
    if (active.role === 'student') {
      setCurrentUser(updated);
    }
    setStudentRegisteredName(true);
    return updated;
  } catch (e) {
    console.error(e);
    return DEFAULT_STUDENTS[0];
  }
}

export function hasStudentRegisteredName(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME_REGISTERED) === 'true';
  } catch {
    return false;
  }
}

export function setStudentRegisteredName(val: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_NAME_REGISTERED, val ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
}

export function getSavedStudents(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STUDENTS;
}

export function addSavedStudent(student: Partial<UserProfile>): UserProfile {
  const newStudent: UserProfile = {
    id: `s-${Date.now()}`,
    name: student.name?.trim() || 'طالب جديد',
    role: 'student',
    avatar: student.avatar || DEFAULT_STUDENTS[0].avatar,
    grade: student.grade || 4,
    school: student.school?.trim() || 'مدرسة العلوم الحديثة',
    points: student.points || 100,
    bio: student.bio?.trim() || 'مستكشف علوم طموح',
  };

  const list = getSavedStudents();
  list.push(newStudent);
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_STUDENTS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
  return newStudent;
}

export function updateSavedStudent(id: string, updates: Partial<UserProfile>): UserProfile[] {
  const list = getSavedStudents();
  const index = list.findIndex((s) => s.id === id);
  if (index >= 0) {
    list[index] = { ...list[index], ...updates };
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_STUDENTS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    // If updating current active user
    const active = getCurrentUser();
    if (active.id === id) {
      setCurrentUser(list[index]);
    }
  }
  return list;
}

export function deleteSavedStudent(id: string): UserProfile[] {
  const list = getSavedStudents().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_STUDENTS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
  return list;
}

// Teacher Secret PIN (Default: 1988)
export const DEFAULT_TEACHER_PIN = '1988';

export function getTeacherProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_PROFILE);
    if (raw) {
      return { ...DEMO_USERS.teacher, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    ...DEMO_USERS.teacher,
    bio: 'معلم مادة العلوم والفيزياء للمرحلتين الابتدائية والمتوسطة. شغوف بالتعليم الرقمي التفاعلي والمختبرات الافتراضية.',
    subjectTitle: 'معلم العلوم العامة',
    welcomeMessage: 'أهلاً بكم في صفي التفاعلي! شاركوا في التحديات والأنشطة لنتعلم العلوم معاً بمتعة وتميز.',
  };
}

export function saveTeacherProfile(profile: Partial<UserProfile>): UserProfile {
  try {
    const current = getTeacherProfile();
    const updated: UserProfile = { ...current, ...profile, role: 'teacher' };
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILE, JSON.stringify(updated));
    // If current active user is teacher, update current user too
    const active = getCurrentUser();
    if (active.role === 'teacher') {
      setCurrentUser(updated);
    }
    return updated;
  } catch (e) {
    console.error(e);
    return DEMO_USERS.teacher;
  }
}

export function getTeacherPin(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || DEFAULT_TEACHER_PIN;
  } catch {
    return DEFAULT_TEACHER_PIN;
  }
}

export function setTeacherPin(newPin: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, newPin.trim());
  } catch (e) {
    console.error(e);
  }
}

export function verifyTeacherPin(enteredPin: string): boolean {
  const currentPin = getTeacherPin();
  const clean = enteredPin.trim();
  // Accepts either configured PIN or fallback master PIN 1988
  return clean === currentPin || clean === DEFAULT_TEACHER_PIN;
}

export function isTeacherSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.TEACHER_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setTeacherSessionUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      sessionStorage.setItem(STORAGE_KEYS.TEACHER_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.TEACHER_SESSION);
    }
  } catch (e) {
    console.error(e);
  }
}

// Initialize Storage with seed data if not present
export function initializeStorage(): void {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.student));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([]));
    }
  } catch (e) {
    console.warn('LocalStorage error during init:', e);
  }
}

// Current active user management
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEMO_USERS.student;
}

export function setCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
}

// Activities CRUD
export function getActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_ACTIVITIES;
}

export function getActivityById(id: string): Activity | undefined {
  const all = getActivities();
  return all.find((a) => a.id === id);
}

export function getActivityByShareCode(code: string): Activity | undefined {
  const all = getActivities();
  return all.find((a) => a.shareCode.toUpperCase() === code.trim().toUpperCase());
}

export function saveActivity(activity: Activity): void {
  const all = getActivities();
  const index = all.findIndex((a) => a.id === activity.id);
  if (index >= 0) {
    all[index] = activity;
  } else {
    all.unshift(activity);
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(all));
}

export function deleteActivity(id: string): void {
  const all = getActivities().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(all));
}

export function duplicateActivity(id: string): Activity | null {
  const target = getActivityById(id);
  if (!target) return null;
  const newActivity: Activity = {
    ...target,
    id: `act-${Date.now()}`,
    title: `${target.title} (نسخة مكررة)`,
    createdAt: new Date().toISOString().split('T')[0],
    shareCode: `SCI-${Math.floor(100 + Math.random() * 900)}`,
    playsCount: 0,
    questions: target.questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`,
    })),
  };
  saveActivity(newActivity);
  return newActivity;
}

export function incrementActivityPlayCount(id: string): void {
  const all = getActivities();
  const act = all.find((a) => a.id === id);
  if (act) {
    act.playsCount = (act.playsCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(all));
  }
}

// Resources CRUD
export function getResources(): Resource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_RESOURCES;
}

export function saveResource(resource: Resource): void {
  const all = getResources();
  const index = all.findIndex((r) => r.id === resource.id);
  if (index >= 0) {
    all[index] = resource;
  } else {
    all.unshift(resource);
  }
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(all));
}

export function deleteResource(id: string): void {
  const all = getResources().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(all));
}

export function incrementResourceClicks(id: string): void {
  const all = getResources();
  const res = all.find((r) => r.id === id);
  if (res) {
    res.clicksCount = (res.clicksCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(all));
  }
}

// Student Attempts & Leaderboard
export function getStudentAttempts(): StudentAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveStudentAttempt(attempt: StudentAttempt): void {
  const all = getStudentAttempts();
  all.unshift(attempt);
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(all));

  // Update or add student to Leaderboard
  updateLeaderboardForAttempt(attempt);
}

export function getLeaderboard(): LeaderboardUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_LEADERBOARD;
}

function updateLeaderboardForAttempt(attempt: StudentAttempt): void {
  const board = getLeaderboard();
  const existing = board.find((u) => u.name === attempt.studentName || u.id === attempt.studentId);

  if (existing) {
    existing.totalPoints += attempt.score;
    existing.correctAnswers += attempt.correctAnswersCount;
    existing.activitiesCompleted += 1;
    if (attempt.timeSpentSeconds < existing.fastestTimeSeconds || existing.fastestTimeSeconds === 0) {
      existing.fastestTimeSeconds = attempt.timeSpentSeconds;
    }
    if (existing.totalPoints > 800) existing.badge = '🏆 عبقري العلوم';
    else if (existing.totalPoints > 500) existing.badge = '⭐ بطل متفوق';
  } else {
    board.push({
      id: attempt.studentId,
      name: attempt.studentName,
      avatar: attempt.studentAvatar,
      gradeId: attempt.gradeId,
      totalPoints: attempt.score,
      correctAnswers: attempt.correctAnswersCount,
      activitiesCompleted: 1,
      fastestTimeSeconds: attempt.timeSpentSeconds,
      badge: attempt.score > 30 ? '⭐ بطل جديد' : '🌱 مستكشف واعد'
    });
  }

  // Sort descending by totalPoints
  board.sort((a, b) => b.totalPoints - a.totalPoints);
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(board));
}

export function resetDatabaseToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.student));
}

export function clearStudentAttempts(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
  } catch (e) {
    console.error(e);
  }
}

export interface TeacherDatabaseBackup {
  metadata: {
    app: string;
    version: string;
    exportedAt: string;
    teacherPinProtected: boolean;
  };
  activities: Activity[];
  resources: Resource[];
  studentAttempts: StudentAttempt[];
  leaderboard: LeaderboardUser[];
}

export function exportCompleteDatabase(): TeacherDatabaseBackup {
  return {
    metadata: {
      app: 'نافس وتعلم - مادة العلوم',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      teacherPinProtected: true,
    },
    activities: getActivities(),
    resources: getResources(),
    studentAttempts: getStudentAttempts(),
    leaderboard: getLeaderboard(),
  };
}

export function importCompleteDatabase(backup: Partial<TeacherDatabaseBackup>): { success: boolean; message: string } {
  try {
    if (!backup || typeof backup !== 'object') {
      return { success: false, message: 'ملف البيانات غير صالح أو تالف' };
    }

    if (Array.isArray(backup.activities) && backup.activities.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(backup.activities));
    }
    if (Array.isArray(backup.resources)) {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(backup.resources));
    }
    if (Array.isArray(backup.studentAttempts)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(backup.studentAttempts));
    }
    if (Array.isArray(backup.leaderboard)) {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(backup.leaderboard));
    }

    return { success: true, message: 'تم استعادة قاعدة بيانات المعلم بنجاح!' };
  } catch (err) {
    console.error('Import error:', err);
    return { success: false, message: 'حدث خطأ أثناء استيراد قاعدة البيانات' };
  }
}

export interface DatabaseStats {
  activitiesCount: number;
  totalQuestionsCount: number;
  attemptsCount: number;
  resourcesCount: number;
  leaderboardStudentsCount: number;
  totalPointsScored: number;
  estimatedSizeKb: number;
  lastUpdated: string;
}

export function getDatabaseStats(): DatabaseStats {
  const acts = getActivities();
  const attempts = getStudentAttempts();
  const res = getResources();
  const board = getLeaderboard();

  const totalQuestions = acts.reduce((sum, a) => sum + (a.questions?.length || a.questionsCount || 0), 0);
  const totalPoints = attempts.reduce((sum, att) => sum + (att.score || 0), 0);

  // estimate storage size in KB
  let totalChars = 0;
  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      const val = localStorage.getItem(key);
      if (val) totalChars += val.length;
    }
  } catch {
    totalChars = 50000;
  }
  const estimatedKb = Math.round((totalChars * 2) / 1024);

  return {
    activitiesCount: acts.length,
    totalQuestionsCount: totalQuestions,
    attemptsCount: attempts.length,
    resourcesCount: res.length,
    leaderboardStudentsCount: board.length,
    totalPointsScored: totalPoints,
    estimatedSizeKb: estimatedKb,
    lastUpdated: new Date().toLocaleDateString('ar-SA'),
  };
}

