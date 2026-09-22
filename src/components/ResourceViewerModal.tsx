import { Resource } from '../types';
import { ExternalLink, X, Globe, Video, Gamepad2, FileText, CheckCircle2 } from 'lucide-react';

interface ResourceViewerModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export default function ResourceViewerModal({
  resource,
  onClose,
}: ResourceViewerModalProps) {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-3xl font-black shrink-0">
            {resource.type === 'simulation' ? '🔬' : resource.type === 'video' ? '🎥' : resource.type === 'game' ? '🎮' : '🌐'}
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900">
              الصف {resource.gradeId} • {resource.unitTitle.split(':')[0]}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-purple-950 mt-2 font-['Changa',sans-serif]">
              {resource.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مورد تعليمي معتمد أضافه: {resource.authorName}
            </p>
          </div>
        </div>

        {resource.coverImage && (
          <div className="rounded-2xl overflow-hidden max-h-64 w-full bg-slate-100 border border-slate-200">
            <img
              src={resource.coverImage}
              alt={resource.title}
              className="w-full h-full object-cover max-h-64"
            />
          </div>
        )}

        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <span className="font-black text-purple-950 block">تفاصيل المورد وإرشادات الاستخدام:</span>
          <p>{resource.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 font-medium">
            المادة: مادة العلوم التفاعلية
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إغلاق
            </button>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all active:scale-95"
            >
              <span>فتح الرابط الأصلي في نافذة جديدة</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
