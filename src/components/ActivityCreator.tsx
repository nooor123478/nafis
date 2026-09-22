import React, { useState } from 'react';
import { Activity, Question, GradeId, CycleId, ActivityType, UserProfile } from '../types';
import { GRADES_DATA, SCIENCE_UNITS } from '../data/mockData';
import { 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Award, 
  Lightbulb, 
  Save, 
  BookOpen,
  HelpCircle,
  Wand2,
  RefreshCw,
  Layers,
  Edit3,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ActivityCreatorProps {
  currentUser: UserProfile;
  initialGradeId?: GradeId;
  initialMode?: 'manual' | 'ai';
  onSaveActivity: (activity: Activity) => void;
  onCancel: () => void;
}

const QUICK_SCIENCE_TOPICS = [
  { label: '🫀 أجهزة جسم الإنسان والقلب', topic: 'أجهزة جسم الإنسان والدورة الدموية' },
  { label: '🔬 تركيب الخلية والأحياء', topic: 'تركيب الخلية النباتية والحيوانية ووظائف العضيات' },
  { label: '🪐 المجموعة الشمسية والكواكب', topic: 'النظام الشمسي ودوران الأرض والفصول الأربعة' },
  { label: '💧 دورة الماء والطقس والمناخ', topic: 'دورة الماء في الطبيعة وتغيرات الطقس والغيوم' },
  { label: '⚡ الكهرباء والمغناطيسية', topic: 'الدوائر الكهربائية وتوليد الطاقة والمغناطيس' },
  { label: '🌿 النباتات والبناء الضوئي', topic: 'أجزاء النبات وعملية البناء الضوئي والتنفس' },
  { label: '🦊 التكيف والسلاسل الغذائية', topic: 'تكيف الكائنات الحية والمنتجات والمستهلكات في البيئة' },
  { label: '⚖️ القوى والحركة والروافع', topic: 'الاحتكاك والجاذبية والآلات البسيطة والروافع' },
];

export default function ActivityCreator({
  currentUser,
  initialGradeId = 4,
  initialMode = 'ai',
  onSaveActivity,
  onCancel,
}: ActivityCreatorProps) {

  // Mode Selection: 'ai' or 'manual'
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>(initialMode);

  // AI Form States
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionsCount, setAiQuestionsCount] = useState<number>(5);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessNote, setAiSuccessNote] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Activity Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cycleId, setCycleId] = useState<CycleId>(initialGradeId <= 4 ? 'cycle-1' : 'cycle-2');
  const [gradeId, setGradeId] = useState<GradeId>(initialGradeId);
  const [activityType, setActivityType] = useState<ActivityType>('challenge');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
  );

  // Available units for current grade
  const availableUnits = SCIENCE_UNITS.filter((u) => u.gradeId === gradeId);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(availableUnits[0]?.id || 'u-default');
  const activeUnit = availableUnits.find((u) => u.id === selectedUnitId) || availableUnits[0];

  const availableLessons = activeUnit?.lessons || [];
  const [selectedLessonId, setSelectedLessonId] = useState<string>(availableLessons[0]?.id || '');

  // Questions list (initial placeholder question)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-${Date.now()}-1`,
      questionText: 'ما هو العضو المسؤول عن ضخ الدم إلى جميع أنحاء الجسم في الجهاز الدوري؟',
      choices: ['القلب', 'الرئتان', 'المعدة', 'الكبد'],
      correctAnswerIndex: 0,
      points: 10,
      timeLimitSeconds: 20,
      hint: 'عضلة حيوية تنبض دون توقف في التجويف الصدري.',
      explanation: 'القلب هو المضخة العضلية المركزية في الجهاز الدوري لنقل الأكسجين والغذاء.',
    }
  ]);

  // Current question index in manual editor
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0);

  // Helper to handle grade change
  const handleGradeChange = (newGradeId: GradeId) => {
    setGradeId(newGradeId);
    setCycleId(newGradeId <= 4 ? 'cycle-1' : 'cycle-2');
    const newUnits = SCIENCE_UNITS.filter((u) => u.gradeId === newGradeId);
    if (newUnits.length > 0) {
      setSelectedUnitId(newUnits[0].id);
      setSelectedLessonId(newUnits[0].lessons[0]?.id || '');
    }
  };

  // Add new empty question manually
  const handleAddNewQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      questionText: '',
      choices: ['', '', '', ''],
      correctAnswerIndex: 0,
      points: 10,
      timeLimitSeconds: 20,
      hint: '',
      explanation: '',
    };
    setQuestions([...questions, newQ]);
    setCurrentEditingIndex(questions.length);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    if (currentEditingIndex >= updated.length) {
      setCurrentEditingIndex(updated.length - 1);
    }
  };

  // Update field of current question
  const updateCurrentQuestion = (field: keyof Question, value: unknown) => {
    const updated = [...questions];
    updated[currentEditingIndex] = {
      ...updated[currentEditingIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  // Update choice text
  const updateChoice = (choiceIndex: number, text: string) => {
    const updated = [...questions];
    const choices = [...updated[currentEditingIndex].choices];
    choices[choiceIndex] = text;
    updated[currentEditingIndex].choices = choices;
    setQuestions(updated);
  };

  // Generate Activity with AI endpoint
  const handleGenerateWithAI = async (customTopic?: string) => {
    const targetTopic = (customTopic || aiTopic).trim();
    if (!targetTopic) {
      setAiError('يرجى كتابة موضوع أو اختيار أحد المواضيع المقترحة لتوليد الأسئلة.');
      return;
    }

    setAiError(null);
    setIsGeneratingAI(true);
    setAiSuccessNote(null);

    try {
      const unitObj = availableUnits.find((u) => u.id === selectedUnitId);
      const lessonObj = availableLessons.find((l) => l.id === selectedLessonId);

      const res = await fetch('/api/ai/generate-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          gradeId,
          questionsCount: aiQuestionsCount,
          difficulty: aiDifficulty,
          activityType,
          unitTitle: unitObj?.title || '',
          lessonTitle: lessonObj?.title || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`تعذر التوليد (رمز الاستجابة ${res.status})`);
      }

      const data = await res.json();
      if (data && data.activity && Array.isArray(data.activity.questions) && data.activity.questions.length > 0) {
        setTitle(data.activity.title || `نشاط ${targetTopic}`);
        setDescription(data.activity.description || `تحدي علمي ممتع في مادة العلوم للصف ${gradeId}`);
        setQuestions(data.activity.questions);
        setCurrentEditingIndex(0);
        setAiSuccessNote(`تم توليد ${data.activity.questions.length} أسئلة علمية ذكية بنجاح! يمكنك مراجعتها وحفظها الآن. ✨`);
      } else {
        throw new Error('لم يتم استلام أسئلة صالحة من خدمة الذكاء الاصطناعي');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Validate and Save Activity
  const handleSave = () => {
    if (!title.trim()) {
      alert('يرجى كتابة عنوان النشاط قبل الحفظ');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        alert(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        setCreationMode('manual');
        setCurrentEditingIndex(i);
        return;
      }
      if (q.choices.some((c) => !c.trim())) {
        alert(`يرجى كتابة جميع خيارات السؤال رقم ${i + 1}`);
        setCreationMode('manual');
        setCurrentEditingIndex(i);
        return;
      }
    }

    const totalTime = questions.reduce((sum, q) => sum + (q.timeLimitSeconds || 20), 0);
    const totalPts = questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const unitObj = availableUnits.find((u) => u.id === selectedUnitId);
    const lessonObj = availableLessons.find((l) => l.id === selectedLessonId);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'نشاط تفاعلي جديد في مادة العلوم والأحياء.',
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      cycleId,
      gradeId,
      subject: 'العلوم والأحياء',
      unitId: selectedUnitId,
      unitTitle: unitObj?.title || 'الوحدة التعليمية',
      lessonId: selectedLessonId,
      lessonTitle: lessonObj?.title || 'الدرس المخصص',
      type: activityType,
      questionsCount: questions.length,
      totalTimeSeconds: totalTime,
      totalPoints: totalPts,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'published',
      coverImage: coverImage,
      shareCode: `SCI-${Math.floor(100 + Math.random() * 900)}`,
      playsCount: 0,
      questions,
    };

    onSaveActivity(newActivity);
  };

  const currentQ = questions[currentEditingIndex] || questions[0];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 text-white gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إلغاء والعودة</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-['Changa',sans-serif]">
              🎮 مصنع الأنشطة والتحديات
            </h1>
            <p className="text-xs text-purple-200 mt-0.5">
              أنشئ نشاطاً علمياً تفاعلياً يدوياً أو بنقرة واحدة باستخدام الذكاء الاصطناعي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-save-entire-activity"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 transition-transform hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>💾 حفظ النشاط ونشره للطلاب</span>
          </button>
        </div>
      </div>

      {/* Choice of Creation Method: Manual vs AI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 bg-purple-900/40 backdrop-blur-md rounded-3xl border border-purple-400/30">
        
        <button
          type="button"
          id="btn-mode-ai"
          onClick={() => setCreationMode('ai')}
          className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-right ${
            creationMode === 'ai'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 font-black shadow-lg scale-[1.01]'
              : 'bg-white/10 hover:bg-white/15 text-white font-bold'
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            creationMode === 'ai' ? 'bg-purple-950/20 text-purple-950' : 'bg-white/20 text-amber-300'
          }`}>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">✨ إنشاء بالذكاء الاصطناعي</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                creationMode === 'ai' ? 'bg-purple-950 text-amber-300' : 'bg-amber-400 text-purple-950'
              }`}>
                موصى به وسريع
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${creationMode === 'ai' ? 'text-purple-900' : 'text-purple-200'}`}>
              اكتب الموضوع فقط، وسيقوم الذكاء الاصطناعي بتأليف وتنسيق الأسئلة والشروحات والتلميحات فوراً!
            </p>
          </div>
        </button>

        <button
          type="button"
          id="btn-mode-manual"
          onClick={() => setCreationMode('manual')}
          className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-right ${
            creationMode === 'manual'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg scale-[1.01]'
              : 'bg-white/10 hover:bg-white/15 text-white font-bold'
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            creationMode === 'manual' ? 'bg-white/20 text-white' : 'bg-white/20 text-purple-200'
          }`}>
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">✍️ إنشاء نشاط يدوي</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-black">
                تحكم كامل
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${creationMode === 'manual' ? 'text-purple-100' : 'text-purple-200'}`}>
              صياغة الأسئلة، كتابة خيارات الإجابة، ضبط المؤقت والدرجات بدقة سؤالاً بسؤال.
            </p>
          </div>
        </button>

      </div>

      {/* AI GENERATOR PANEL */}
      {creationMode === 'ai' && (
        <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-xl border border-purple-100 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪄</span>
              <div>
                <h2 className="text-lg font-black text-purple-950">
                  مولد الأنشطة والأسئلة بالذكاء الاصطناعي
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  اكتب موضوع الدرس المطلوب وسيقوم المولد بصياغة أسئلة دقيقة علمياً ومتطابقة مع المنهج
                </p>
              </div>
            </div>
            <span className="text-xs text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full font-black">
              العلوم والأحياء (1–10)
            </span>
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-2">
              مواضيع مقترحة شائعة (انقر للاختيار والتوليد المباشر):
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_SCIENCE_TOPICS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiTopic(item.topic);
                    handleGenerateWithAI(item.topic);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>موضوع الدرس أو النشاط المطلوب توليده: <span className="text-rose-500">*</span></span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="input-ai-topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="مثال: الانقسام المتساوي والمنصف، حركة الصفائح التكتونية، خصائص الأحماض والقواعد..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>

            {/* AI Settings: Grade, Count, Difficulty, Type */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              
              {/* Grade */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">الصف المستهدف:</label>
                <select
                  value={gradeId}
                  onChange={(e) => handleGradeChange(Number(e.target.value) as GradeId)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
                >
                  {GRADES_DATA.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Questions Count */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">عدد الأسئلة:</label>
                <select
                  value={aiQuestionsCount}
                  onChange={(e) => setAiQuestionsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
                >
                  <option value={3}>3 أسئلة (تحدي خاطف)</option>
                  <option value={5}>5 أسئلة (نشاط معياري)</option>
                  <option value={8}>8 أسئلة (اختبار شامل)</option>
                  <option value={10}>10 أسئلة (ماراثون العلوم)</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">مستوى التحدي:</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
                >
                  <option value="easy">سهل ومباشر</option>
                  <option value="medium">متوسط ومتوازن</option>
                  <option value="hard">تحدي للمتفوقين</option>
                </select>
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">نوع التحدي:</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
                >
                  <option value="challenge">🏆 تحدي تنافسي</option>
                  <option value="multiple_choice">🎯 اختيار من متعدد</option>
                  <option value="timed_quiz">⏱️ تحدي مؤقت وسريع</option>
                  <option value="true_false">✅ صح أو خطأ</option>
                </select>
              </div>

            </div>

            {/* AI Feedback alerts */}
            {aiSuccessNote && (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-black flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{aiSuccessNote}</span>
                </div>
                <button
                  onClick={() => setCreationMode('manual')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors"
                >
                  مراجعة وتعديل الأسئلة ✍️
                </button>
              </div>
            )}

            {aiError && (
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black animate-in fade-in">
                ⚠️ {aiError}
              </div>
            )}

            {/* Generate Action Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-generate-ai-activity"
                onClick={() => handleGenerateWithAI()}
                disabled={isGeneratingAI}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-105 text-purple-950 font-black text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جارٍ توليد النشاط وصياغة الأسئلة بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>✨ توليد النشاط والأسئلة بالذكاء الاصطناعي الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Activity Basic Metadata (Visible in both modes for review) */}
      <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-xl border border-purple-100 space-y-6">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <h2 className="text-lg font-black text-purple-950 flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span>معلومات النشاط الأساسية</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            يمكنك تعديل أي بيان تريده
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              عنوان النشاط التفاعلي <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="input-activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحدي أبطال الجهاز الهضمي والقلب"
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              نوع النشاط
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="challenge">🏆 تحدي تنافسي</option>
              <option value="timed_quiz">⏱️ تحدي مؤقت وسريع</option>
              <option value="multiple_choice">🎯 اختيار من متعدد</option>
              <option value="true_false">✅ صح أو خطأ</option>
              <option value="quick_blitz">🧠 سؤال خاطف</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              وصف النشاط للطلاب
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: نشاط يقيس فهمك لدرس دوران الأرض وانعكاس الضوء..."
              className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Grade Selector */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              الصف الدراسي والمرحلة
            </label>
            <select
              value={gradeId}
              onChange={(e) => handleGradeChange(Number(e.target.value) as GradeId)}
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {GRADES_DATA.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.cycleId === 'cycle-1' ? '🟢 الحلقة الأولى: ' : '🔵 الحلقة الثانية: '} {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject (Science & Biology) */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              المادة التعليمية
            </label>
            <div className="w-full px-4 py-3 rounded-2xl bg-purple-100/70 border border-purple-200 text-purple-950 text-sm font-black flex items-center justify-between">
              <span>🔬 مادة العلوم والأحياء</span>
              <span className="text-xs text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full">تخصص المنصة</span>
            </div>
          </div>

          {/* Unit Selector */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              الوحدة التعليمية
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(e.target.value);
                const u = availableUnits.find((unit) => unit.id === e.target.value);
                if (u && u.lessons.length > 0) {
                  setSelectedLessonId(u.lessons[0].id);
                }
              }}
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
              {availableUnits.length === 0 && <option value="general">الوحدة العامة للعلوم</option>}
            </select>
          </div>

          {/* Lesson Selector */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              الدرس
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
              {availableLessons.length === 0 && <option value="general">جميع دروس الوحدة</option>}
            </select>
          </div>

        </div>
      </div>

      {/* SECTION 2: Questions Builder & Editor (Works in both modes) */}
      <div className="rounded-3xl bg-white text-slate-800 p-6 sm:p-8 shadow-xl border border-purple-100 space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-black text-purple-950">
              محرر الأسئلة ({questions.length} أسئلة)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {creationMode === 'ai' && (
              <button
                type="button"
                onClick={() => handleGenerateWithAI()}
                disabled={isGeneratingAI}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-purple-950 text-xs font-bold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>إعادة التوليد بالذكاء الاصطناعي</span>
              </button>
            )}

            <button
              id="btn-add-another-question"
              type="button"
              onClick={handleAddNewQuestion}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>➕ إضافة سؤال يدوياً</span>
            </button>
          </div>
        </div>

        {/* Questions Tabs Navigator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentEditingIndex(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentEditingIndex === idx
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
              }`}
            >
              <span>السؤال {idx + 1}</span>
              {questions.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQuestion(idx);
                  }}
                  title="حذف السؤال"
                  className="hover:text-rose-300 transition-colors p-0.5"
                >
                  ✕
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Question Editor Form */}
        <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-5">
          
          {/* Question Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-purple-950">
                السؤال رقم {currentEditingIndex + 1}:
              </label>
              <span className="text-[11px] text-slate-400 font-bold">
                اكتب نص السؤال بوضوح
              </span>
            </div>
            <textarea
              rows={3}
              value={currentQ.questionText}
              onChange={(e) => updateCurrentQuestion('questionText', e.target.value)}
              placeholder="اكتب السؤال هنا... (مثال: ما هي وظيفة البلاستيدات الخضراء في الخلية النباتية؟)"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Question 4 Choices */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-purple-950">
                الخيارات (انقر على الحرف أو علامة الصح لتحديد الإجابة الصحيحة):
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ الإجابة الصحيحة محددة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.choices.map((choiceText, cIdx) => {
                const isCorrect = currentQ.correctAnswerIndex === cIdx;
                return (
                  <div
                    key={cIdx}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      isCorrect 
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                        : 'bg-white border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    {/* Select Correct Radio Button */}
                    <button
                      type="button"
                      onClick={() => updateCurrentQuestion('correctAnswerIndex', cIdx)}
                      title="تحديد كإجابة صحيحة"
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-transform ${
                        isCorrect
                          ? 'bg-emerald-500 text-white scale-110 shadow-md'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {isCorrect ? '✓' : ['أ', 'ب', 'ج', 'د'][cIdx]}
                    </button>

                    <input
                      type="text"
                      value={choiceText}
                      onChange={(e) => updateChoice(cIdx, e.target.value)}
                      placeholder={`الإجابة ${cIdx + 1}`}
                      className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parameters: Time, Points, Hint */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-purple-100">
            
            {/* Time Limit */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>⏱️ زمن السؤال</span>
              </label>
              <select
                value={currentQ.timeLimitSeconds}
                onChange={(e) => updateCurrentQuestion('timeLimitSeconds', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
              >
                <option value={10}>10 ثوانٍ (سريع جداً)</option>
                <option value={15}>15 ثانية</option>
                <option value={20}>20 ثانية (موصى به)</option>
                <option value={30}>30 ثانية</option>
                <option value={60}>60 ثانية</option>
              </select>
            </div>

            {/* Points */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>⭐ نقاط السؤال</span>
              </label>
              <select
                value={currentQ.points}
                onChange={(e) => updateCurrentQuestion('points', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
              >
                <option value={5}>5 نقاط</option>
                <option value={10}>10 نقاط (قياسي)</option>
                <option value={20}>20 نقطة</option>
                <option value={50}>50 نقطة (تحدي ذهبي)</option>
              </select>
            </div>

            {/* Hint */}
            <div>
              <label className="block text-xs font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>💡 إضافة تلميح اختياري</span>
              </label>
              <input
                type="text"
                value={currentQ.hint || ''}
                onChange={(e) => updateCurrentQuestion('hint', e.target.value)}
                placeholder="تلميح يظهر للطالب عند الحاجة..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-slate-800"
              />
            </div>

          </div>

          {/* Educational Explanation */}
          <div>
            <label className="block text-xs font-black text-purple-950 mb-1.5">
              الشرح العلمي عند الإجابة (يظهر للطالب للتعلم)
            </label>
            <input
              type="text"
              value={currentQ.explanation || ''}
              onChange={(e) => updateCurrentQuestion('explanation', e.target.value)}
              placeholder="مثال: البلاستيدات الخضراء تحتوي على الكلوروفيل وتمتص ضوء الشمس للبناء الضوئي..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-slate-800"
            />
          </div>

        </div>

      </div>

    </div>
  );
}
