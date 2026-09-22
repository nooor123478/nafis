import { Activity, LiveSession } from '../types';

type LiveEventCallback = (event: { type: string; payload: any }) => void;

class LiveSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<LiveEventCallback> = new Set();
  private reconnectTimer: any = null;
  private isConnecting = false;

  private getWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }

  public connect(): Promise<WebSocket> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(this.ws);
    }

    this.isConnecting = true;
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWsUrl();
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.listeners.forEach((listener) => listener(data));
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
        };

        this.ws.onerror = (err) => {
          this.isConnecting = false;
          reject(err);
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  public subscribe(callback: LiveEventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private send(type: string, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect().then(() => {
        this.ws?.send(JSON.stringify({ type, payload }));
      }).catch(err => {
        console.error('Failed to send WS message:', err);
      });
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  // Teacher actions
  public createSession(activity: Activity, teacherId: string, teacherName: string, gameMode: 'individual' | 'teams' = 'individual') {
    this.send('teacher:create_session', { activity, teacherId, teacherName, gameMode });
  }

  public setGameMode(gameMode: 'individual' | 'teams', teamCount: number = 2) {
    this.send('teacher:set_game_mode', { gameMode, teamCount });
  }

  public assignStudentTeam(studentId: string, teamId: string) {
    this.send('teacher:assign_student_team', { studentId, teamId });
  }

  public autoBalanceTeams() {
    this.send('teacher:auto_balance_teams', {});
  }

  public addDemoStudents() {
    this.send('teacher:add_demo_students', {});
  }

  public startChallenge() {
    this.send('teacher:start_challenge', {});
  }

  public revealAnswer() {
    this.send('teacher:reveal_answer', {});
  }

  public nextQuestion() {
    this.send('teacher:next_question', {});
  }

  public finishChallenge() {
    this.send('teacher:finish_challenge', {});
  }

  // Student actions
  public joinSession(pin: string, studentId: string, studentName: string, studentAvatar: string) {
    this.send('student:join_session', { pin, studentId, studentName, studentAvatar });
  }

  public selectTeam(teamId: string) {
    this.send('student:select_team', { teamId });
  }

  public submitAnswer(choiceIndex: number, timeSpentSeconds: number) {
    this.send('student:submit_answer', { choiceIndex, timeSpentSeconds });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const liveSocketService = new LiveSocketService();
