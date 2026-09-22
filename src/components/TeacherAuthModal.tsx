import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, Check, X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { verifyTeacherPin, DEFAULT_TEACHER_PIN } from '../services/storage';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promptTitle?: string;
}

export default function TeacherAuthModal({
  isOpen,
  onClose,
  onSuccess,
  promptTitle = 'قاعدة بيانات وسجل المعلم',
}: TeacherAuthModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsSuccess(false);
      setShowHint(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4 && verifyTeacherPin(nextPin)) {
        triggerSuccess();
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 450);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyTeacherPin(pin)) {
      triggerSuccess();
    } else {
      setErrorMsg('الرمز السري غير صحيح! تأكد من الرمز الخاص بك كمعلم.');
      setPin('');
    }
  };

  const handleFillDefault = () => {
    setPin(DEFAULT_TEACHER_PIN);
    setErrorMsg('');
    setTimeout(() => {
      triggerSuccess();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-100 text-center relative space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="إلغاء والعودة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-amber-300 flex items-center justify-center text-3xl shadow-xl shadow-purple-600/30">
          {isSuccess ? (
            <Check className="w-9 h-9 text-emerald-400 stroke-[3] animate-in zoom-in" />
          ) : (
            <Lock className="w-8 h-8 text-amber-300 animate-pulse" />
          )}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
          </span>
        </div>

        {/* Header Titles */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-black mb-1.5">
            <KeyRound className="w-3.5 h-3.5 text-purple-700" />
            <span>تأمين الدخول • برمز سري</span>
          </div>
          <h2 className="text-xl font-black text-purple-950 font-['Changa',sans-serif]">
            {promptTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أدخل الرمز السري للمعلم للوصول إلى قاعدة بيانات الأنشطة، سجلات الطلاب، ومصنع الأسئلة
          </p>
        </div>

        {/* PIN Code Visual Display */}
        <div className="py-2">
          <div className="flex items-center justify-center gap-3 dir-ltr">
            {[0, 1, 2, 3].map((index) => {
              const char = pin[index];
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all ${
                    isSuccess
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : char
                      ? 'border-purple-600 bg-purple-50 text-purple-950 scale-105 shadow-md shadow-purple-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                  }`}
                >
                  {char ? '•' : ''}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم التحقق بنجاح! جاري فتح قاعدة البيانات...</span>
            </div>
          )}
        </div>

        {/* Numeric Onscreen Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-12 rounded-2xl bg-slate-100/80 hover:bg-purple-100 hover:text-purple-900 active:scale-95 text-slate-800 font-black text-lg transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            title="مسح"
            className="h-12 rounded-2xl bg-slate-100/80 hover:bg-rose-100 hover:text-rose-700 active:scale-95 text-slate-500 font-bold text-sm transition-all flex items-center justify-center"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-12 rounded-2xl bg-slate-100/80 hover:bg-purple-100 hover:text-purple-900 active:scale-95 text-slate-800 font-black text-lg transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleManualSubmit()}
            className="h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm active:scale-95 transition-all flex items-center justify-center shadow-md shadow-purple-600/30"
          >
            تأكيد
          </button>
        </div>

        {/* Teacher recovery button */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-slate-400 hover:text-purple-700 flex items-center gap-1 font-medium text-[11px] transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              <span>مساعدة المعلم</span>
            </button>

            <button
              type="button"
              onClick={handleFillDefault}
              className="text-[11px] text-slate-400 hover:text-purple-700 font-medium transition-colors"
              title="دخول المعلم الافتراضي"
            >
              <span>استرجاع الرمز الافتراضي</span>
            </button>
          </div>

          {showHint && (
            <div className="mt-2 p-2.5 rounded-xl bg-purple-50 text-purple-950 text-xs text-right border border-purple-200 animate-in fade-in">
              <span className="font-bold block text-purple-900">تلميح للمعلم:</span>
              الرمز السري الافتراضي للمنصة هو <strong className="font-mono font-black text-purple-700">1988</strong> (يمكنك تغييره لاحقاً من لوحة تحكم المعلم).
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
