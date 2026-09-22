import { useState } from 'react';
import { Activity } from '../types';
import { Share2, Copy, Check, X, QrCode, Sparkles } from 'lucide-react';

interface ShareModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (activity: Activity) => void;
}

export default function ShareModal({
  activity,
  isOpen,
  onClose,
  onLaunch,
}: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nafez.edu';
  const shareUrl = `${currentOrigin}/?pin=${activity.shareCode}`;

  const copyToClipboard = (text: string, type: 'link' | 'pin') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      }
    } catch (e) {
      alert(`تم النسخ: ${text}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-100 space-y-5 text-center relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl font-black shadow-inner">
          🔗
        </div>

        <div>
          <h2 className="text-xl font-black text-purple-950 font-['Changa',sans-serif]">
            مشاركة النشاط مع الطلاب
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            "{activity.title}"
          </p>
        </div>

        {/* PIN Code Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 space-y-2">
          <span className="text-xs font-bold text-purple-900 block">
            رمز النشاط السريع (PIN):
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black tracking-widest text-purple-950 font-mono bg-white px-4 py-1.5 rounded-xl border border-purple-200 shadow-sm">
              {activity.shareCode}
            </span>
            <button
              onClick={() => copyToClipboard(activity.shareCode, 'pin')}
              className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
            >
              {copiedPin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPin ? 'تم النسخ' : 'نسخ الرمز'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            يستطيع الطالب إدخال هذا الرمز مباشرة في خانة (PIN) للبدء في ثوانٍ.
          </p>
        </div>

        {/* Direct Link Box */}
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-black text-purple-950 block">
            رابط المشاركة المباشر:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono select-all focus:outline-none"
            />
            <button
              id="btn-copy-share-link"
              onClick={() => copyToClipboard(shareUrl, 'link')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Start Immediately */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onLaunch(activity);
            }}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md active:scale-95 transition-all"
          >
            ▶️ بدء وتشغيل النشاط الآن كمعلم
          </button>
        </div>

      </div>
    </div>
  );
}
