import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { LiveSession, LiveParticipant, LiveQuestionStats, Activity, Question, LiveTeam, LiveGameMode } from './src/types';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// In-memory active live sessions
const sessions = new Map<string, LiveSession>();
// Map WebSocket connections to { pin, role, participantId }
const clientMetadata = new WeakMap<WebSocket, { pin: string; role: 'teacher' | 'student'; participantId: string }>();

// WebSocket Server
const wss = new WebSocketServer({ server });

function broadcastToRoom(pin: string, payload: any) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const meta = clientMetadata.get(client);
      if (meta && meta.pin === pin) {
        client.send(message);
      }
    }
  });
}

function generatePin(): string {
  // 6 digit numerical pin or prefix format
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${num}`;
}

// Demo student avatars and names
const DEMO_STUDENTS = [
  { name: 'سارة المنصوري', avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80' },
  { name: 'عمر القحطاني', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { name: 'ليلى الهاشمي', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { name: 'فهد الشمري', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'نورة الدوسري', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'خالد السعيد', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];

const INITIAL_TEAMS: LiveTeam[] = [
  {
    id: 'team-blue',
    name: 'علماء المستقبل 🔬',
    color: 'blue',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-400',
    badgeText: 'text-cyan-300',
    icon: '🔬',
    totalScore: 0,
    membersCount: 0,
  },
  {
    id: 'team-purple',
    name: 'رواد الفضاء 🚀',
    color: 'purple',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-400',
    badgeText: 'text-purple-300',
    icon: '🚀',
    totalScore: 0,
    membersCount: 0,
  },
  {
    id: 'team-amber',
    name: 'فرسان الطاقة ⚡',
    color: 'amber',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-400',
    badgeText: 'text-amber-300',
    icon: '⚡',
    totalScore: 0,
    membersCount: 0,
  },
  {
    id: 'team-emerald',
    name: 'حماة البيئة 🌿',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-400',
    badgeText: 'text-emerald-300',
    icon: '🌿',
    totalScore: 0,
    membersCount: 0,
  },
];

function recalcTeamMembers(session: LiveSession) {
  if (session.gameMode !== 'teams' || !session.teams) return;
  Object.values(session.teams).forEach((t) => {
    t.membersCount = 0;
    t.totalScore = 0;
  });
  Object.values(session.participants).forEach((p) => {
    if (p.teamId && session.teams![p.teamId]) {
      session.teams![p.teamId].membersCount += 1;
      session.teams![p.teamId].totalScore += p.score;
    }
  });
}

function autoAssignTeam(session: LiveSession, participantId: string) {
  if (session.gameMode !== 'teams' || !session.teams) return;
  const teamsList = Object.values(session.teams);
  if (teamsList.length === 0) return;

  const counts: Record<string, number> = {};
  teamsList.forEach((t) => { counts[t.id] = 0; });
  Object.values(session.participants).forEach((p) => {
    if (p.id !== participantId && p.teamId && counts[p.teamId] !== undefined) {
      counts[p.teamId]++;
    }
  });

  let minTeam = teamsList[0];
  let minCount = counts[minTeam.id] || 0;
  for (const t of teamsList) {
    const c = counts[t.id] || 0;
    if (c < minCount) {
      minCount = c;
      minTeam = t;
    }
  }

  const p = session.participants[participantId];
  if (p) {
    p.teamId = minTeam.id;
    p.teamName = minTeam.name;
  }
  recalcTeamMembers(session);
}

function processTeamScoreAndLead(session: LiveSession, participant: LiveParticipant, earnedPoints: number) {
  if (session.gameMode !== 'teams' || !session.teams || !participant.teamId || !session.teams[participant.teamId]) {
    return;
  }

  // Identify previous leader before adding points
  const teamsList = Object.values(session.teams);
  const prevSorted = [...teamsList].sort((a, b) => b.totalScore - a.totalScore);
  const prevLeader = (prevSorted.length > 0 && prevSorted[0].totalScore > 0) ? prevSorted[0] : null;

  // Add points to the team
  const team = session.teams[participant.teamId];
  team.totalScore += earnedPoints;

  // Broadcast team scored event to room for instant sound & score animation
  broadcastToRoom(session.pin, {
    type: 'session:team_scored',
    payload: {
      teamId: team.id,
      teamName: team.name,
      teamIcon: team.icon,
      pointsAdded: earnedPoints,
      newTotalScore: team.totalScore,
      studentName: participant.name,
    },
  });

  // Check if leader changed
  const newSorted = [...Object.values(session.teams)].sort((a, b) => b.totalScore - a.totalScore);
  const newLeader = newSorted[0];

  // Lead change happens if newLeader has > 0 points and is different from previous leader
  if (newLeader && newLeader.totalScore > 0 && (!prevLeader || prevLeader.id !== newLeader.id)) {
    broadcastToRoom(session.pin, {
      type: 'session:team_lead_changed',
      payload: {
        previousLeaderId: prevLeader ? prevLeader.id : null,
        previousLeaderName: prevLeader ? prevLeader.name : undefined,
        newLeaderId: newLeader.id,
        newLeaderName: newLeader.name,
        newLeaderIcon: newLeader.icon,
        newLeaderScore: newLeader.totalScore,
      },
    });
  }
}

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type, payload } = data;

      switch (type) {
        case 'teacher:create_session': {
          const { activity, teacherId, teacherName, gameMode = 'individual', teamCount = 2 } = payload;
          const pin = generatePin();
          
          let initialTeams: Record<string, LiveTeam> | undefined = undefined;
          if (gameMode === 'teams') {
            const count = Math.min(4, Math.max(2, teamCount));
            initialTeams = {};
            INITIAL_TEAMS.slice(0, count).forEach((t) => {
              initialTeams![t.id] = { ...t, totalScore: 0, membersCount: 0 };
            });
          }

          const session: LiveSession = {
            pin,
            activityId: activity.id,
            activityTitle: activity.title,
            activity,
            teacherId,
            teacherName,
            status: 'lobby',
            gameMode,
            teams: initialTeams,
            currentQuestionIndex: 0,
            questionStartTime: Date.now(),
            participants: {},
            questionStats: {},
            createdAt: Date.now(),
          };

          sessions.set(pin, session);
          clientMetadata.set(ws, { pin, role: 'teacher', participantId: teacherId });

          ws.send(JSON.stringify({
            type: 'session:created',
            payload: { session },
          }));
          break;
        }

        case 'teacher:set_game_mode': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session || session.status !== 'lobby') return;

          const { gameMode, teamCount = 2 } = payload;
          session.gameMode = gameMode;
          if (gameMode === 'teams') {
            const count = Math.min(4, Math.max(2, teamCount));
            const activeTeams: Record<string, LiveTeam> = {};
            INITIAL_TEAMS.slice(0, count).forEach((t) => {
              activeTeams[t.id] = { ...t, totalScore: 0, membersCount: 0 };
            });
            session.teams = activeTeams;

            // Auto-distribute existing participants into the teams
            const teamKeys = Object.keys(activeTeams);
            Object.values(session.participants).forEach((p, idx) => {
              const assignedTeamId = teamKeys[idx % teamKeys.length];
              p.teamId = assignedTeamId;
              p.teamName = activeTeams[assignedTeamId].name;
            });
            recalcTeamMembers(session);
          } else {
            session.teams = undefined;
            Object.values(session.participants).forEach((p) => {
              p.teamId = undefined;
              p.teamName = undefined;
            });
          }

          broadcastToRoom(meta.pin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        case 'teacher:assign_student_team': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session || session.gameMode !== 'teams' || !session.teams) return;

          const { studentId, teamId } = payload;
          if (session.participants[studentId] && session.teams[teamId]) {
            session.participants[studentId].teamId = teamId;
            session.participants[studentId].teamName = session.teams[teamId].name;
            recalcTeamMembers(session);

            broadcastToRoom(meta.pin, {
              type: 'session:updated',
              payload: { session },
            });
          }
          break;
        }

        case 'teacher:auto_balance_teams': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session || session.gameMode !== 'teams' || !session.teams) return;

          const teamKeys = Object.keys(session.teams);
          if (teamKeys.length > 0) {
            Object.values(session.participants).forEach((p, idx) => {
              const assignedTeamId = teamKeys[idx % teamKeys.length];
              p.teamId = assignedTeamId;
              p.teamName = session.teams![assignedTeamId].name;
            });
            recalcTeamMembers(session);

            broadcastToRoom(meta.pin, {
              type: 'session:updated',
              payload: { session },
            });
          }
          break;
        }

        case 'student:select_team': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          const session = sessions.get(meta.pin);
          if (!session || session.status !== 'lobby' || session.gameMode !== 'teams' || !session.teams) return;

          const { teamId } = payload;
          const p = session.participants[meta.participantId];
          if (p && session.teams[teamId]) {
            p.teamId = teamId;
            p.teamName = session.teams[teamId].name;
            recalcTeamMembers(session);

            broadcastToRoom(meta.pin, {
              type: 'session:updated',
              payload: { session },
            });
          }
          break;
        }

        case 'student:join_session': {
          const { pin, studentId, studentName, studentAvatar } = payload;
          const cleanPin = String(pin).trim();
          const session = sessions.get(cleanPin);

          if (!session) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: `رمز التحدي (${cleanPin}) غير موجود أو انتهت جلسته.` },
            }));
            return;
          }

          if (session.status === 'finished') {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'هذا التحدي المباشر انتهى بالفعل.' },
            }));
            return;
          }

          // Register participant
          const existing = session.participants[studentId];
          session.participants[studentId] = {
            id: studentId,
            name: studentName,
            avatar: studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            score: existing ? existing.score : 0,
            streak: existing ? existing.streak : 0,
            teamId: existing ? existing.teamId : undefined,
            teamName: existing ? existing.teamName : undefined,
            hasAnsweredCurrent: existing ? existing.hasAnsweredCurrent : false,
            lastAnswerChoice: existing ? existing.lastAnswerChoice : undefined,
            lastAnswerCorrect: existing ? existing.lastAnswerCorrect : undefined,
            isOnline: true,
          };

          if (session.gameMode === 'teams' && session.teams && !session.participants[studentId].teamId) {
            autoAssignTeam(session, studentId);
          }

          clientMetadata.set(ws, { pin: cleanPin, role: 'student', participantId: studentId });

          // Send welcome & full state
          ws.send(JSON.stringify({
            type: 'student:joined_success',
            payload: { session, studentId },
          }));

          // Notify room of participant list update
          broadcastToRoom(cleanPin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        case 'teacher:add_demo_students': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session) return;

          // Add demo students who haven't joined yet
          DEMO_STUDENTS.forEach((demo, idx) => {
            const id = `demo-${idx + 1}`;
            if (!session.participants[id]) {
              session.participants[id] = {
                id,
                name: demo.name,
                avatar: demo.avatar,
                score: 0,
                streak: 0,
                hasAnsweredCurrent: false,
                isOnline: true,
              };
              if (session.gameMode === 'teams' && session.teams) {
                autoAssignTeam(session, id);
              }
            }
          });
          recalcTeamMembers(session);

          broadcastToRoom(meta.pin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        case 'teacher:start_challenge': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session) return;

          session.status = 'in_progress';
          session.currentQuestionIndex = 0;
          session.questionStartTime = Date.now();

          // Reset question state
          Object.values(session.participants).forEach((p) => {
            p.hasAnsweredCurrent = false;
            p.lastAnswerChoice = undefined;
            p.lastAnswerCorrect = undefined;
          });

          session.questionStats[0] = {
            questionIndex: 0,
            totalAnswered: 0,
            choiceDistribution: [0, 0, 0, 0],
            correctCount: 0,
            wrongCount: 0,
          };

          broadcastToRoom(meta.pin, {
            type: 'session:started',
            payload: { session },
          });

          // If there are demo students, trigger simulated realistic answers after 2-5 seconds
          simulateDemoAnswers(session, 0);
          break;
        }

        case 'student:submit_answer': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          const session = sessions.get(meta.pin);
          if (!session || session.status !== 'in_progress') return;

          const { choiceIndex, timeSpentSeconds } = payload;
          const participant = session.participants[meta.participantId];
          if (!participant || participant.hasAnsweredCurrent) return;

          const currentQ = session.activity.questions[session.currentQuestionIndex];
          if (!currentQ) return;

          const isCorrect = choiceIndex === currentQ.correctAnswerIndex;
          participant.hasAnsweredCurrent = true;
          participant.lastAnswerChoice = choiceIndex;
          participant.lastAnswerCorrect = isCorrect;
          participant.lastAnswerTime = timeSpentSeconds;

          // Points calculation with speed bonus
          let earnedPoints = 0;
          if (isCorrect) {
            const basePoints = currentQ.points || 10;
            const timeRatio = Math.max(0, 1 - (timeSpentSeconds / (currentQ.timeLimitSeconds || 20)));
            const speedBonus = Math.round(timeRatio * 5);
            earnedPoints = basePoints + speedBonus;
            participant.streak += 1;
            participant.score += earnedPoints;

            // Pool points into team score if team challenge mode
            if (session.gameMode === 'teams' && session.teams && participant.teamId && session.teams[participant.teamId]) {
              processTeamScoreAndLead(session, participant, earnedPoints);
            }
          } else {
            participant.streak = 0;
          }

          // Update question statistics
          let stats = session.questionStats[session.currentQuestionIndex];
          if (!stats) {
            stats = {
              questionIndex: session.currentQuestionIndex,
              totalAnswered: 0,
              choiceDistribution: [0, 0, 0, 0],
              correctCount: 0,
              wrongCount: 0,
            };
            session.questionStats[session.currentQuestionIndex] = stats;
          }

          stats.totalAnswered += 1;
          if (choiceIndex >= 0 && choiceIndex < 4) {
            stats.choiceDistribution[choiceIndex] = (stats.choiceDistribution[choiceIndex] || 0) + 1;
          }
          if (isCorrect) {
            stats.correctCount += 1;
          } else {
            stats.wrongCount += 1;
          }

          const teamInfo = (session.gameMode === 'teams' && session.teams && participant.teamId)
            ? session.teams[participant.teamId]
            : undefined;

          // Individual feedback for student
          ws.send(JSON.stringify({
            type: 'student:answer_recorded',
            payload: {
              isCorrect,
              earnedPoints,
              choiceIndex,
              newTotalScore: participant.score,
              streak: participant.streak,
              teamId: participant.teamId,
              teamName: teamInfo?.name,
              teamTotalScore: teamInfo?.totalScore,
            },
          }));

          // Room broadcast with live answer counters
          broadcastToRoom(meta.pin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        case 'teacher:reveal_answer': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session) return;

          session.status = 'question_review';

          broadcastToRoom(meta.pin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        case 'teacher:next_question': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session) return;

          const nextIndex = session.currentQuestionIndex + 1;
          if (nextIndex >= session.activity.questions.length) {
            session.status = 'finished';
          } else {
            session.status = 'in_progress';
            session.currentQuestionIndex = nextIndex;
            session.questionStartTime = Date.now();

            // Reset participant per-question flags
            Object.values(session.participants).forEach((p) => {
              p.hasAnsweredCurrent = false;
              p.lastAnswerChoice = undefined;
              p.lastAnswerCorrect = undefined;
            });

            session.questionStats[nextIndex] = {
              questionIndex: nextIndex,
              totalAnswered: 0,
              choiceDistribution: [0, 0, 0, 0],
              correctCount: 0,
              wrongCount: 0,
            };

            // Trigger demo student answers for next question
            simulateDemoAnswers(session, nextIndex);
          }

          broadcastToRoom(meta.pin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        case 'teacher:finish_challenge': {
          const meta = clientMetadata.get(ws);
          if (!meta || meta.role !== 'teacher') return;
          const session = sessions.get(meta.pin);
          if (!session) return;

          session.status = 'finished';

          broadcastToRoom(meta.pin, {
            type: 'session:updated',
            payload: { session },
          });
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientMetadata.get(ws);
    if (meta) {
      const session = sessions.get(meta.pin);
      if (session && session.participants[meta.participantId]) {
        session.participants[meta.participantId].isOnline = false;
        broadcastToRoom(meta.pin, {
          type: 'session:updated',
          payload: { session },
        });
      }
    }
  });
});

// Helper to simulate realistic demo student responses
function simulateDemoAnswers(session: LiveSession, qIndex: number) {
  const currentQ = session.activity.questions[qIndex];
  if (!currentQ) return;

  const demoParticipants = Object.values(session.participants).filter(p => p.id.startsWith('demo-'));
  if (demoParticipants.length === 0) return;

  demoParticipants.forEach((demo, i) => {
    // Stagger responses between 1.5s and 6s
    const delay = 1500 + i * 900 + Math.random() * 800;
    setTimeout(() => {
      // Check session is still on same question
      if (session.status !== 'in_progress' || session.currentQuestionIndex !== qIndex) return;
      if (demo.hasAnsweredCurrent) return;

      // 80% chance of correct answer, 20% random alternative
      let choice = currentQ.correctAnswerIndex;
      if (Math.random() > 0.8) {
        choice = (choice + 1) % currentQ.choices.length;
      }

      const isCorrect = choice === currentQ.correctAnswerIndex;
      demo.hasAnsweredCurrent = true;
      demo.lastAnswerChoice = choice;
      demo.lastAnswerCorrect = isCorrect;
      demo.lastAnswerTime = Math.round(delay / 1000);

      if (isCorrect) {
        demo.streak += 1;
        const earned = (currentQ.points || 10) + Math.max(1, Math.round(5 - (delay / 2000)));
        demo.score += earned;
        if (session.gameMode === 'teams' && session.teams && demo.teamId && session.teams[demo.teamId]) {
          processTeamScoreAndLead(session, demo, earned);
        }
      } else {
        demo.streak = 0;
      }

      let stats = session.questionStats[qIndex];
      if (!stats) {
        stats = {
          questionIndex: qIndex,
          totalAnswered: 0,
          choiceDistribution: [0, 0, 0, 0],
          correctCount: 0,
          wrongCount: 0,
        };
        session.questionStats[qIndex] = stats;
      }

      stats.totalAnswered += 1;
      stats.choiceDistribution[choice] = (stats.choiceDistribution[choice] || 0) + 1;
      if (isCorrect) stats.correctCount += 1;
      else stats.wrongCount += 1;

      broadcastToRoom(session.pin, {
        type: 'session:updated',
        payload: { session },
      });
    }, delay);
  });
}

// REST API Endpoints
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Science fallback generator in case API key is not present or quota reached
function generateCuratedScienceQuestions(topic: string, gradeId: number, count: number, type: string): { title: string; description: string; questions: Question[] } {
  const cleanTopic = topic.trim() || 'العلوم العامة والأحياء';
  const sampleBank: Array<{ q: string; c: string[]; a: number; h: string; exp: string }> = [
    {
      q: `ما هي الوحدة الأساسية للتركيب والوظيفة في الكائنات الحية المتعلقة بـ (${cleanTopic})؟`,
      c: ['الخلية', 'النسيج', 'العضو', 'الجهاز'],
      a: 0,
      h: 'أصغر وحدة حية مجهرية تقوم بالعمليات الحيوية.',
      exp: 'الخلية هي الوحدة البنائية والوظيفية الأساسية لجميع الكائنات الحية.',
    },
    {
      q: `أي من الأعضاء التالية يلعب الدور الرئيسي في امتصاص الغذاء المهضوم ونقله إلى الدم؟`,
      c: ['الأمعاء الدقيقة', 'المعدة', 'المريء', 'الفم'],
      a: 0,
      h: 'أنبوب طويل يحتوي على خملات معوية غنية بالشعيرات الدموية.',
      exp: 'تتميز الأمعاء الدقيقة بوجود الخملات التي تزيد من مساحة امتصاص المواد الغذائية.',
    },
    {
      q: `ما هو الغاز الذي تنتجه النباتات أثناء عملية البناء الضوئي وتستفيد منه الكائنات الحية للتنفس؟`,
      c: ['الأكسجين', 'ثاني أكسيد الكربون', 'النيتروجين', 'الميثان'],
      a: 0,
      h: 'غاز حيوي يرمز له بـ O2 ضروري لحياة الكائنات الحية.',
      exp: 'في عملية البناء الضوئي تمتص النباتات ثاني أكسيد الكربون وتطلق الأكسجين في وجود الضوء والكلوروفيل.',
    },
    {
      q: `أي التكيفات التالية يعتبر تكيفاً سلوكياً للحيوانات في مواجهة تغيرات الطقس؟`,
      c: ['هجرة الطيور شتاءً', 'الفراء السميك للدب القطبي', 'طول رقبة الزرافة', 'المخالب الحادة للصقر'],
      a: 0,
      h: 'فعل أو سلوك يقوم به الكائن الحي وليس صفة تشريحية في جسده.',
      exp: 'الهجرة استجابة سلوكية موسمية للبحث عن الدفء والغذاء.',
    },
    {
      q: `ما هي العضية الخلوية المسؤولة عن إنتاج الطاقة (ATP) في الخلية؟`,
      c: ['الميتوكوندريا', 'الريبوسوم', 'الشبكة الإندوبلازمية', 'الفجوة العصارية'],
      a: 0,
      h: 'تسمى بمصنع الطاقة أو محطة توليد الطاقة في الخلية.',
      exp: 'الميتوكوندريا هي المسؤولة عن التنفس الخلوي وإنتاج الطاقة الحيوية.',
    },
    {
      q: `ما الذي يسبب تعاقب الليل والنهار على كوكب الأرض؟`,
      c: ['دوران الأرض حول محورها', 'دوران الأرض حول الشمس', 'ميل محور دوران القمر', 'حركة الشمس الظاهرية'],
      a: 0,
      h: 'حركة تستغرق 24 ساعة تقريباً.',
      exp: 'دوران الأرض حول نفسها (محورها) مرة كل 24 ساعة يسبب تعاقب الليل والنهار.',
    },
    {
      q: `في السلسلة الغذائية، أي الكائنات الحية التالية يصنف ككائن منتج؟`,
      c: ['النبات الأخضر العشبي', 'الأرنب البري', 'الثعلب', 'الصقر'],
      a: 0,
      h: 'يصنع غذاءه بنفسه عن طريق ضوء الشمس.',
      exp: 'النباتات الخضراء هي كائنات ذاتية التغذية ومنتجة تبدأ بها السلاسل الغذائية.',
    },
    {
      q: `ما القوة المسؤولة عن جذب الأجسام نحو مركز الأرض؟`,
      c: ['الجاذبية الأرضية', 'الاحتكاك', 'القوة المغناطيسية', 'قوة الدفع'],
      a: 0,
      h: 'اكتشف قوانينها العالم إسحاق نيوتن.',
      exp: 'قوة الجاذبية هي قوة الجذب المتبادلة بين الكتل وتسحب الأجسام لأسفل.',
    },
  ];

  const chosenQuestions: Question[] = [];
  const selected = sampleBank.slice(0, Math.min(count, sampleBank.length));

  selected.forEach((item, index) => {
    // If true/false requested
    if (type === 'true_false') {
      chosenQuestions.push({
        id: `ai-q-${Date.now()}-${index + 1}`,
        questionText: `صح أو خطأ: ${item.q.replace('ما هو ', '').replace('أي من ', '')}`,
        choices: ['صح ✅', 'خطأ ❌', 'غير محدد', 'كلاهما'],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 20,
        hint: item.h,
        explanation: item.exp,
      });
    } else {
      chosenQuestions.push({
        id: `ai-q-${Date.now()}-${index + 1}`,
        questionText: item.q,
        choices: item.c,
        correctAnswerIndex: item.a,
        points: 10,
        timeLimitSeconds: 20,
        hint: item.h,
        explanation: item.exp,
      });
    }
  });

  return {
    title: `تحدي الذكاء العلمي: ${cleanTopic}`,
    description: `نشاط علمي تفاعلي مولد بالذكاء الاصطناعي موجه لطلاب الصف ${gradeId} في مادة العلوم والأحياء.`,
    questions: chosenQuestions,
  };
}

app.post('/api/ai/generate-activity', async (req, res) => {
  try {
    const {
      topic,
      gradeId = 4,
      questionsCount = 5,
      difficulty = 'medium',
      activityType = 'challenge',
      unitTitle = '',
      lessonTitle = '',
    } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'يرجى تحديد موضوع أو عنوان الدرس العلمي' });
      return;
    }

    const cleanTopic = topic.trim();
    const count = Math.min(Math.max(Number(questionsCount) || 5, 2), 10);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log('No GEMINI_API_KEY found, using curated AI fallback generation');
      const fallback = generateCuratedScienceQuestions(cleanTopic, gradeId, count, activityType);
      res.json({
        success: true,
        source: 'curated_ai',
        activity: fallback,
        message: 'تم توليد النشاط بنجاح عبر بنك العلوم التفاعلي الذكي.',
      });
      return;
    }

    const prompt = `أنت معلم وخبير تربوي متخصص في تدريس مادة العلوم والأحياء للصف ${gradeId} في المناهج العربية (الحلقة الأولى والثانية).
المطلوب إنشاء نشاط وأسئلة تفاعلية وممتعة للطلاب حول الموضوع التالي:
- الموضوع العلمي: "${cleanTopic}"
- الصف الدراسي: الصف ${gradeId}
- الوحدة أو الدرس: "${unitTitle} - ${lessonTitle}"
- مستوى الصعوبة: ${difficulty === 'easy' ? 'سهل ومبسط ومناسب للأعمار الصغيرة' : difficulty === 'hard' ? 'تحدي للمتفوقين وتفكير علمي عليا' : 'متوسط ومتوازن'}
- عدد الأسئلة المطلوب: بالضبط ${count} أسئلة
- نوع النشاط: ${activityType}

يجب أن ترجع استجابتك بصيغة JSON حصراً، بالشكل التالي:
{
  "title": "عنوان مشوق للنشاط ومناسب للطلاب في العلوم",
  "description": "وصف موجز ومحفز للنشاط (سطر واحد)",
  "questions": [
    {
      "questionText": "نص السؤال العلمي الواضح",
      "choices": ["الخيار الأول (الإجابة الصحيحة دائما في هذا الموضع الأول)", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctAnswerIndex": 0,
      "points": 10,
      "timeLimitSeconds": 20,
      "hint": "تلميح علمي ذكي يساعد الطالب في التفكير",
      "explanation": "شرح علمي دقيق وموجز يوضح سبب صحة الإجابة"
    }
  ]
}

ملاحظات هامة جداً:
1. الأسئلة يجب أن تكون باللغة العربية الفصحى السليمة، دقيقة علمياً 100%، ومناسبة للمرحلة العمرية للصف ${gradeId}.
2. الخيارات يجب أن تكون 4 خيارات منطقية ومتنوعة.
3. التلميح والشرح العلمي مفيدان جداً للتعلم أثناء اللعب.
4. الرد JSON فقط بدون أي نصوص تمهيدية.`;

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        // Strip markdown codeblocks if present
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        // Format questions with unique IDs and validate structure
        const formattedQuestions: Question[] = parsed.questions.map((q: any, idx: number) => {
          // Shuffle choices so correct answer isn't always at index 0
          const originalChoices = Array.isArray(q.choices) ? q.choices.slice(0, 4) : ['أ', 'ب', 'ج', 'د'];
          const correctText = originalChoices[q.correctAnswerIndex ?? 0] || originalChoices[0];
          
          // Randomize choices
          const shuffled = [...originalChoices].sort(() => Math.random() - 0.5);
          const newCorrectIndex = shuffled.indexOf(correctText);

          return {
            id: `ai-q-${Date.now()}-${idx + 1}`,
            questionText: String(q.questionText || `سؤال رقم ${idx + 1}`),
            choices: shuffled.length === 4 ? shuffled : [correctText, 'خيار ب', 'خيار ج', 'خيار د'],
            correctAnswerIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
            points: Number(q.points) || 10,
            timeLimitSeconds: Number(q.timeLimitSeconds) || 20,
            hint: q.hint ? String(q.hint) : 'فكر في المفهوم العلمي وتذكر ما تعلمته.',
            explanation: q.explanation ? String(q.explanation) : 'إجابة صحيحة وتفسير علمي سليم.',
          };
        });

        res.json({
          success: true,
          source: 'gemini',
          activity: {
            title: String(parsed.title || `نشاط ${cleanTopic}`),
            description: String(parsed.description || `تحدي تفاعلي في العلوم للصف ${gradeId}`),
            questions: formattedQuestions,
          },
          message: 'تم توليد النشاط بنجاح باستخدام نموذج Gemini الذكي!',
        });
        return;
      }
    } catch (geminiError: any) {
      console.warn('Gemini API call failed, falling back to curated generator:', geminiError?.message);
    }

    // Fallback if Gemini returned invalid format or failed
    const fallback = generateCuratedScienceQuestions(cleanTopic, gradeId, count, activityType);
    res.json({
      success: true,
      source: 'curated_ai',
      activity: fallback,
      message: 'تم توليد النشاط الذكي بنجاح!',
    });
  } catch (error: any) {
    console.error('AI generation endpoint error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء توليد النشاط بالذكاء الاصطناعي' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeSessions: sessions.size });
});

app.get('/api/live/session/:pin', (req, res) => {
  const pin = req.params.pin.trim();
  const session = sessions.get(pin);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ session });
});

// Vite Middleware for Development / Static in Production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server and WebSocket listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(console.error);
