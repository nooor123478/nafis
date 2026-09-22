export type CycleId = 'cycle-1' | 'cycle-2';

export type GradeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ResourceType = 'link' | 'video' | 'game' | 'simulation' | 'document' | 'website';

export type ActivityType =
  | 'multiple_choice'
  | 'true_false'
  | 'ordering'
  | 'matching'
  | 'quick_blitz'
  | 'challenge'
  | 'timed_quiz';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  grade?: GradeId;
  school?: string;
  points?: number;
  bio?: string;
  subjectTitle?: string;
  phone?: string;
  welcomeMessage?: string;
}

export interface ScienceLesson {
  id: string;
  unitId: string;
  gradeId: GradeId;
  number: number;
  title: string;
  summary: string;
}

export interface ScienceUnit {
  id: string;
  gradeId: GradeId;
  number: number;
  title: string;
  description: string;
  iconName: string;
  lessons: ScienceLesson[];
}

export interface GradeInfo {
  id: GradeId;
  cycleId: CycleId;
  number: number;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  unitsCount: number;
  description: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  cycleId: CycleId;
  gradeId: GradeId;
  subject: string;
  unitId: string;
  unitTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  type: ResourceType;
  coverImage?: string;
  authorName: string;
  dateAdded: string;
  clicksCount: number;
}

export interface Question {
  id: string;
  activityId?: string;
  questionText: string;
  imageUrl?: string;
  choices: string[];
  correctAnswerIndex: number;
  points: number; // 5, 10, 20, 50
  timeLimitSeconds: number; // 10, 15, 20, 30, 60
  hint?: string;
  explanation?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  cycleId: CycleId;
  gradeId: GradeId;
  subject: string;
  unitId: string;
  unitTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  type: ActivityType;
  questionsCount: number;
  totalTimeSeconds: number;
  totalPoints: number;
  createdAt: string;
  status: 'published' | 'draft';
  coverImage?: string;
  shareCode: string;
  playsCount: number;
  questions: Question[];
}

export interface StudentAttempt {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  activityId: string;
  activityTitle: string;
  gradeId: GradeId;
  score: number;
  maxScore: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  timeSpentSeconds: number;
  percentage: number;
  date: string;
  userAnswers: {
    questionId: string;
    selectedChoice: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  gradeId: GradeId;
  totalPoints: number;
  correctAnswers: number;
  activitiesCompleted: number;
  fastestTimeSeconds: number;
  badge: string;
}

export type LiveSessionStatus = 'lobby' | 'in_progress' | 'question_review' | 'finished';
export type LiveGameMode = 'individual' | 'teams';

export interface LiveTeam {
  id: string;
  name: string;
  color: 'blue' | 'purple' | 'amber' | 'emerald';
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  totalScore: number;
  membersCount: number;
}

export interface LiveParticipant {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  teamId?: string;
  teamName?: string;
  lastAnswerChoice?: number;
  lastAnswerCorrect?: boolean;
  lastAnswerTime?: number;
  hasAnsweredCurrent: boolean;
  isOnline: boolean;
}

export interface LiveQuestionStats {
  questionIndex: number;
  totalAnswered: number;
  choiceDistribution: number[]; // [countChoice0, countChoice1, countChoice2, countChoice3]
  correctCount: number;
  wrongCount: number;
}

export interface LiveSession {
  pin: string;
  activityId: string;
  activityTitle: string;
  activity: Activity;
  teacherId: string;
  teacherName: string;
  status: LiveSessionStatus;
  gameMode: LiveGameMode;
  teams?: Record<string, LiveTeam>;
  currentQuestionIndex: number;
  questionStartTime: number;
  participants: Record<string, LiveParticipant>;
  questionStats: Record<number, LiveQuestionStats>;
  createdAt: number;
}

export interface LiveTeamLeadChangeEvent {
  previousLeaderId: string | null;
  previousLeaderName?: string;
  newLeaderId: string;
  newLeaderName: string;
  newLeaderIcon: string;
  newLeaderScore: number;
}

export interface LiveTeamScoredEvent {
  teamId: string;
  teamName: string;
  teamIcon?: string;
  pointsAdded: number;
  newTotalScore: number;
  studentName?: string;
}

