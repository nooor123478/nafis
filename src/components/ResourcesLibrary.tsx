import React, { useState } from 'react';
import { Resource, CycleId, GradeId, ResourceType, UserProfile } from '../types';
import { GRADES_DATA, SCIENCE_UNITS } from '../data/mockData';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  Plus, 
  Video, 
  FileText, 
  Globe, 
  Gamepad2, 
  Layers,
  X,
  Edit3,
  Trash2,
  Copy,
  Check,
  Link as LinkIcon,
  HelpCircle,
  Eye
} from 'lucide-react';

interface ResourcesLibraryProps {
  resources: Resource[];
  currentUser: UserProfile;
  onOpenResource: (resource: Resource) => void;
  onAddResource: (resource: Resource) => void;
  onUpdateResource?: (resource: Resource) => void;
  onDeleteResource?: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const COVER_PRESETS = [
  { label: '🔬 كيمياء ومعامل', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
  { label: '🧬 أحياء وخلايا', url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=80' },
  { label: '🪐 فضاء وفلك', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80' },
  { label: '🌿 بيئة ونبات', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80' },
  { label: '⚡ فيزياء وطاقة', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80' },
  { label: '🌊 جيولوجيا ومياه', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80' },
];

export default function ResourcesLibrary({
  resources,
  currentUser,
  onOpenResource,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  isAddModalOpen,
  setIsAddModalOpen,
}: ResourcesLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Editing state
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form states for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCycle, setFormCycle] = useState<CycleId>('cycle-1');
  const [formGrade, setFormGrade] = useState<GradeId>(4);
  const [formType, setFormType] = useState<ResourceType>('link');
  const [formUnitTitle, setFormUnitTitle] = useState('');
  const [formCover, setFormCover] = useState(COVER_PRESETS[0].url);
  const [formAuthor, setFormAuthor] = useState('');

  // Toast / feedback notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Open modal for adding a new resource
  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormTitle('');
    setFormDesc('');
    setFormUrl('');
    setFormCycle('cycle-1');
    setFormGrade(4);
    setFormType('link');
    setFormUnitTitle('');
    setFormCover(COVER_PRESETS[0].url);
    setFormAuthor(currentUser.name || 'معلم مادة العلوم');
    setIsAddModalOpen(true);
  };

  // Open modal for editing an existing resource
  const handleOpenEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormTitle(resource.title);
    setFormDesc(resource.description || '');
    setFormUrl(resource.url);
    setFormCycle(resource.cycleId || 'cycle-1');
    setFormGrade(resource.gradeId);
    setFormType(resource.type || 'link');
    setFormUnitTitle(resource.unitTitle || '');
    setFormCover(resource.coverImage || COVER_PRESETS[0].url);
    setFormAuthor(resource.authorName || currentUser.name || 'معلم العلوم');
    setIsAddModalOpen(true);
  };

  // Auto-detect type based on URL when typed
  const handleUrlChange = (val: string) => {
    setFormUrl(val);
    const low = val.toLowerCase();
    if (!editingResource) {
      if (low.includes('youtube.com') || low.includes('youtu.be') || low.includes('vimeo.com')) {
        setFormType('video');
      } else if (low.includes('phet.colorado.edu') || low.includes('lab') || low.includes('sim')) {
        setFormType('simulation');
      } else if (low.includes('kahoot') || low.includes('quizizz') || low.includes('wordwall') || low.includes('game')) {
        setFormType('game');
      } else if (low.includes('.pdf') || low.includes('drive.google.com') || low.includes('docs.google.com')) {
        setFormType('document');
      }
    }
  };

  // Copy link to clipboard
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      showToast('📋 تم نسخ الرابط إلى الحافظة بنجاح!');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      showToast('تعذر نسخ الرابط تلقائياً.');
    });
  };

  // Delete handler
  const handleDelete = (resource: Resource) => {
    if (confirm(`هل أنت متأكد من حذف الرابط: "${resource.title}"؟`)) {
      if (onDeleteResource) {
        onDeleteResource(resource.id);
        showToast(`🗑️ تم حذف الرابط بنجاح: ${resource.title}`);
      }
    }
  };

  // Save (Add or Update)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formTitle.trim();
    const cleanUrl = formUrl.trim();

    if (!cleanTitle || !cleanUrl) {
      alert('يرجى كتابة عنوان الرابط والرابط الإلكتروني بشكل صحيح');
      return;
    }

    const availableUnits = SCIENCE_UNITS.filter((u) => u.gradeId === formGrade);
    const defaultUnit = availableUnits[0]?.title || 'الوحدة العامة لمادة العلوم';
    const finalUnitTitle = formUnitTitle.trim() || defaultUnit;

    if (editingResource) {
      // Update existing resource
      const updated: Resource = {
        ...editingResource,
        title: cleanTitle,
        description: formDesc.trim() || 'مورد ورابط تعليمي تفاعلي لمادة العلوم.',
        url: cleanUrl,
        cycleId: formCycle,
        gradeId: formGrade,
        subject: 'العلوم',
        unitTitle: finalUnitTitle,
        type: formType,
        coverImage: formCover,
        authorName: formAuthor.trim() || currentUser.name || 'معلم العلوم',
      };

      if (onUpdateResource) {
        onUpdateResource(updated);
      } else {
        onAddResource(updated);
      }
      showToast(`✨ تم تحديث الرابط بنجاح: ${cleanTitle}`);
    } else {
      // Add new resource
      const createdResource: Resource = {
        id: `res-${Date.now()}`,
        title: cleanTitle,
        description: formDesc.trim() || 'مورد ورابط تعليمي تفاعلي لمادة العلوم.',
        url: cleanUrl,
        cycleId: formCycle,
        gradeId: formGrade,
        subject: 'العلوم',
        unitId: `u-${formGrade}-custom`,
        unitTitle: finalUnitTitle,
        type: formType,
        coverImage: formCover,
        authorName: formAuthor.trim() || currentUser.name || 'معلم العلوم',
        dateAdded: new Date().toISOString().split('T')[0],
        clicksCount: 0,
      };

      onAddResource(createdResource);
      showToast(`🎉 تم إضافة الرابط الجديد بنجاح: ${cleanTitle}`);
    }

    setIsAddModalOpen(false);
    setEditingResource(null);
  };

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    if (selectedCycle !== 'all' && res.cycleId !== selectedCycle) return false;
    if (selectedGrade !== 'all' && res.gradeId !== Number(selectedGrade)) return false;
    if (selectedType !== 'all' && res.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        (res.description && res.description.toLowerCase().includes(q)) ||
        (res.unitTitle && res.unitTitle.toLowerCase().includes(q)) ||
        res.url.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getResourceTypeBadge = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return { label: '🎥 فيديو تعليمي', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'simulation':
        return { label: '🔬 محاكاة معملية', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'game':
        return { label: '🎮 لعبة تعليمية', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'document':
        return { label: '📄 ملف وملخص', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'website':
        return { label: '🌐 موقع تفاعلي', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: '🔗 رابط تعليمي', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="py-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Add Button */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/90 via-[#3a186b]/95 to-indigo-950/90 border border-purple-400/30 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
            <span>🔗 قسم الروابط والمصادر التعليمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Changa',sans-serif]">
            مكتبة الروابط والمصادر العلمية المعتمدة
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
            استكشف وأضف وعدّل الروابط التفاعلية، المحاكاة المعملية، الفيديوهات والشروحات لجميع الصفوف (1-10) في مادة العلوم والأحياء.
          </p>
        </div>

        <button
          id="btn-open-add-resource"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>➕ إضافة رابط تعليمي جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 text-white space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-purple-300 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ابحث عن رابط، درس، محاكاة، أو وحدة تعليمية..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-white placeholder-purple-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Cycle Filter */}
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">جميع الحلقات</option>
            <option value="cycle-1">🟢 الحلقة الأولى (1–4)</option>
            <option value="cycle-2">🔵 الحلقة الثانية (5–10)</option>
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">جميع الصفوف (1-10)</option>
            {GRADES_DATA.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">جميع أنواع الموارد</option>
            <option value="simulation">🔬 محاكاة معملية</option>
            <option value="video">🎥 فيديو تعليمي</option>
            <option value="game">🎮 لعبة تفاعلية</option>
            <option value="website">🌐 موقع علمي</option>
            <option value="document">📄 ملف وملخص</option>
            <option value="link">🔗 رابط تعليمي</option>
          </select>

          {/* Reset / Count */}
          <div className="text-xs text-purple-200 font-bold px-2 py-1 bg-purple-900/40 rounded-xl border border-purple-400/20">
            <span>العدد: {filteredResources.length}</span>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const badge = getResourceTypeBadge(res.type);
          return (
            <div
              key={res.id}
              className="group rounded-3xl bg-white text-slate-800 overflow-hidden shadow-xl border border-purple-100 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-44 w-full overflow-hidden bg-purple-900">
                  <img
                    src={res.coverImage || COVER_PRESETS[0].url}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black shadow-md border ${badge.color}`}>
                      {badge.label}
                    </span>

                    {/* Quick Edit & Delete Icons on Cover */}
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/20">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(res)}
                        title="تعديل هذا الرابط"
                        className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 transition-all hover:scale-110 active:scale-95 shadow"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteResource && (
                        <button
                          type="button"
                          onClick={() => handleDelete(res)}
                          title="حذف هذا الرابط"
                          className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-all hover:scale-110 active:scale-95 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Cover Info */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs font-bold text-white">
                    <span>الصف {res.gradeId} • مادة العلوم</span>
                    <span className="text-[11px] text-amber-300">
                      {res.dateAdded ? res.dateAdded : 'معتمد'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-700">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{res.unitTitle ? res.unitTitle.split(':')[0] : 'الوحدة التعليمية'}</span>
                    </span>
                    <span className="text-slate-400">👀 {res.clicksCount || 0} زيارة</span>
                  </div>

                  <h3 className="text-base font-black text-purple-950 leading-snug line-clamp-2">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {res.description || 'رابط ومورد علمي مخصص لتعزيز مهارات التعلم التفاعلي.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[140px]">
                      ✍️ {res.authorName || 'معلم العلوم'}
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold max-w-[120px] truncate" dir="ltr">
                      {res.url.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 🚀 فتح المورد + ✏️ تعديل الرابط + 📋 نسخ الرابط */}
              <div className="p-5 pt-0 space-y-2">
                <button
                  id={`btn-open-res-${res.id}`}
                  onClick={() => onOpenResource(res)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <span>🚀 فتح المورد والتشغيل</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(res)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>تعديل الرابط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(res.url, res.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {copiedId === res.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-purple-600" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 text-white space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-base font-bold">لم يتم العثور على روابط مطابقة لبحثك</p>
          <p className="text-xs text-purple-200">جرّب تغيير خيارات البحث أو اضغط على «إضافة رابط جديد» لإضافة روابطك الخاصة</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-black text-xs shadow-md inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رابط جديد الآن</span>
          </button>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 max-h-[92vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center text-lg font-black shadow-md">
                  {editingResource ? '✏️' : '➕'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-purple-950 font-['Changa',sans-serif]">
                    {editingResource ? 'تعديل الرابط والمورد التعليمي' : 'إضافة رابط تعليمي جديد'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingResource 
                      ? 'قم بتعديل بيانات الرابط، الوصف، أو الصف والوحدة الدراسية' 
                      : 'أدخل تفاصيل الرابط العلمي لحفظه وإتاحته للطلاب'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingResource(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">
                  عنوان الرابط أو المورد <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: محاكاة معملية لتجارب الكهرباء الساكنة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* URL with Test / Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black text-purple-950">
                    الرابط الإلكتروني (URL) <span className="text-rose-500">*</span>
                  </label>
                  {formUrl.trim().startsWith('http') && (
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      <span>فحص ومعاينة الرابط</span>
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://phet.colorado.edu/... أو https://youtube.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 يدعم روابط يوتيوب، محاكاة PhET، ألعاب Kahoot/Wordwall، مواقع علمية، وملفات Google Drive أو PDF.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">
                  الوصف الموجز
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="شرح بسيط لما سيتعلمه الطالب من هذا المورد..."
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Hierarchy Cascade: Cycle & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cycle */}
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">
                    الحلقة التعليمية
                  </label>
                  <select
                    value={formCycle}
                    onChange={(e) => {
                      const c = e.target.value as CycleId;
                      setFormCycle(c);
                      setFormGrade(c === 'cycle-1' ? 4 : 6);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="cycle-1">🟢 الحلقة الأولى (1–4)</option>
                    <option value="cycle-2">🔵 الحلقة الثانية (5–10)</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as GradeId)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {GRADES_DATA.filter(g => g.cycleId === formCycle).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resource Type & Unit Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Resource Type */}
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">
                    نوع المورد
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="link">🔗 رابط تعليمي</option>
                    <option value="simulation">🔬 محاكاة معملية</option>
                    <option value="video">🎥 فيديو تعليمي</option>
                    <option value="game">🎮 لعبة تعليمية</option>
                    <option value="document">📄 ملف أو ملخص</option>
                    <option value="website">🌐 موقع تفاعلي</option>
                  </select>
                </div>

                {/* Unit / Topic Title */}
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">
                    الوحدة أو موضوع الدرس
                  </label>
                  <input
                    type="text"
                    value={formUnitTitle}
                    onChange={(e) => setFormUnitTitle(e.target.value)}
                    placeholder="مثال: الوحدة الأولى: الخلية الحية"
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Preset Selector */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1.5">
                  صورة الغلاف (اختر قالباً علمياً أو ضع رابط صورتك)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormCover(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                        formCover === preset.url 
                          ? 'border-purple-600 scale-105 shadow-md ring-2 ring-purple-600/30' 
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-0.5">
                        <span className="text-[9px] text-white font-black text-center leading-tight">
                          {preset.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-[11px] text-slate-700 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">
                  اسم المعلم / المضاف بواسطة
                </label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="اسم المعلم"
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingResource(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{editingResource ? '💾 حفظ التعديلات' : '➕ إضافة الرابط الآن'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
