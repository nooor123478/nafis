import { useState } from 'react';
import { Activity } from '../types';
import { KeyRound, Play, X, Sparkles, Radio } from 'lucide-react';

interface QuickPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  onLaunchActivity: (activity: Activity) => void;
  onJoinLiveChallenge: (pin: string) => void;
}

export default function QuickPinModal({
  isOpen,
  onClose,
  activities,
  onLaunchActivity,
  onJoinLiveChallenge,
}: QuickPinModalProps) {
  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPin = pinCode.trim();
    if (!cleanPin) {
      setErrorMsg('يرجى إدخال رمز النشاط أو رمز التحدي المباشر');
      return;
    }

    // 1. If it's numeric 6-digit PIN, immediately treat as live challenge
    if (/^\d{5,6}$/.test(cleanPin)) {
      onClose();
      onJoinLiveChallenge(cleanPin);
      return;
    }

    // 2. Check if it matches an activity share code
    const matchedActivity = activities.find(
      (a) => a.shareCode.toUpperCase() === cleanPin.toUpperCase() || a.id.toUpperCase() === cleanPin.toUpperCase()
    );

    if (matchedActivity) {
      onClose();
      onLaunchActivity(matchedActivity);
      return;
    }

    // 3. Fallback: check live session endpoint
    setIsChecking(true);
    try {
      const res = await fetch(`/api/live/session/${encodeURIComponent(cleanPin)}`);
      if (res.ok) {
        setIsChecking(false);
        onClose();
        onJoinLiveChallenge(cleanPin);
        return;
      }
    } catch {
      // ignore
    }
    setIsChecking(false);

    setErrorMsg(`لم يتم العثور على نشاط أو غرفة تحدي مباشر برمز "${cleanPin}". تفقد الرمز من معلمك.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-100 text-center relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-purple-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-400/20">
          🔐
        </div>

        <div>
          <h2 className="text-xl font-black text-purple-950 font-['Changa',sans-serif]">
            دخول برمز النشاط أو التحدي المباشر
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أدخل رمز النشاط المدرسي (مثل <span className="font-mono font-bold text-purple-700">SCI-401</span>) أو رمز التحدي المباشر المكون من 6 أرقام (مثل <span className="font-mono font-bold text-amber-600">849201</span>)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              value={pinCode}
              onChange={(e) => {
                setPinCode(e.target.value);
                setErrorMsg('');
              }}
              placeholder="SCI-401 أو 849201"
              className="w-full text-center tracking-widest text-2xl font-black font-mono py-3.5 px-4 rounded-2xl bg-purple-50 border-2 border-purple-300 text-purple-950 focus:outline-none focus:ring-4 focus:ring-purple-400 uppercase placeholder:text-slate-400 placeholder:text-lg"
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold mt-2 animate-in fade-in">
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>انطلق للتحدي الآن</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestions */}
        <div className="pt-3 border-t border-slate-100 text-right space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block">
            أنشطة مقترحة متاحة الآن برمزها:
          </span>
          <div className="space-y-1.5">
            {activities.slice(0, 3).map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  onClose();
                  onLaunchActivity(act);
                }}
                className="p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-100 flex items-center justify-between cursor-pointer transition-colors text-xs"
              >
                <div>
                  <span className="font-black text-purple-950 block">{act.title}</span>
                  <span className="text-[10px] text-slate-500">الصف {act.gradeId} • {act.questionsCount} أسئلة</span>
                </div>
                <span className="font-mono font-black text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                  {act.shareCode}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
