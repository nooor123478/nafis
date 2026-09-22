import { useState } from 'react';
import { GradeId, ScienceUnit, Activity, Resource } from '../types';
import { GRADES_DATA, SCIENCE_UNITS } from '../data/mockData';
import { 
  ArrowRight, 
  Sparkles, 
  Play, 
  Video, 
  Share2, 
  Gamepad2, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Award
} from 'lucide-react';

interface GradeScienceExplorerProps {
  gradeId: GradeId;
  activities: Activity[];
  resources: Resource[];
  onBack: () => void;
  onLaunchActivity: (activity: Activity) => void;
  onOpenResource: (resource: Resource) => void;
  onCreateActivityForGrade?: (gradeId: GradeId) => void;
}

export default function GradeScienceExplorer({
  gradeId,
  activities,
  resources,
  onBack,
  onLaunchActivity,
  onOpenResource,
  onCreateActivityForGrade,
}: GradeScienceExplorerProps) {
  const grade = GRADES_DATA.find((g) => g.id === gradeId) || GRADES_DATA[3];
  const units = SCIENCE_UNITS.filter((u) => u.gradeId === gradeId);
  const gradeActivities = activities.filter((a) => a.gradeId === gradeId);
  const gradeResources = resources.filter((r) => r.gradeId === gradeId);

  const [activeTab, setActiveTab] = useState<'units' | 'activities' | 'videos' | 'resources'>('activities');
  const [expandedUnitId, setExpandedUnitId] = useState<string>(units[0]?.id || '');

  return (
    <div className="py-6 space-y-6">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 text-white">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-grades"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="الرجوع للخلف"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للخلف</span>
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{grade.icon}</span>
              <h1 className="text-xl sm:text-2xl font-black font-['Changa',sans-serif]">
                {grade.name} - مادة العلوم 🔬
              </h1>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">{grade.subtitle}</p>
          </div>
        </div>

        {onCreateActivityForGrade && (
          <button
            id="btn-add-activity-for-grade"
            onClick={() => onCreateActivityForGrade(gradeId)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-lg transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ إنشاء نشاط لهذا الصف</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-purple-950/60 border border-purple-500/20 max-w-2xl mx-auto justify-center">
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'activities'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-purple-200 hover:bg-purple-900/40'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-amber-300" />
          <span>🎮 الأنشطة والتحديات ({gradeActivities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'units'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-purple-200 hover:bg-purple-900/40'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>📚 الوحدات والدروس ({units.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'resources'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-purple-200 hover:bg-purple-900/40'
          }`}
        >
          <Share2 className="w-4 h-4 text-amber-300" />
          <span>🔗 الروابط والمحاكاة ({gradeResources.length})</span>
        </button>
      </div>

      {/* Tab 1: Activities (User's primary focus) */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                🎮 الأنشطة والتحديات التفاعلية لـ {grade.name}
              </h2>
              <p className="text-xs text-purple-200 mt-1">
                تحدَّ زملاءك، أجب عن الأسئلة بدقة، واكسب النقاط للتصدر في لوحة الشرف!
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-3 py-1.5 rounded-xl border border-amber-400/30">
              ⭐ متوافق مع شاشة التحدي المباشر
            </span>
          </div>

          {gradeActivities.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 p-6">
              <div className="text-5xl mb-3">🧪</div>
              <h3 className="text-lg font-black text-white">لا توجد أنشطة مضافة بعد لهذا الصف</h3>
              <p className="text-xs text-purple-200 mt-1 max-w-md mx-auto">
                يمكن للمعلم الدخول إلى "إنشاء نشاط تفاعلي" وإضافة أول نشاط وأسئلة في ثوانٍ!
              </p>
              {onCreateActivityForGrade && (
                <button
                  onClick={() => onCreateActivityForGrade(gradeId)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:scale-105 transition-all"
                >
                  + أنشئ أول نشاط لهذا الصف الآن
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gradeActivities.map((activity) => (
                <div
                  key={activity.id}
                  id={`activity-card-${activity.id}`}
                  className="rounded-3xl bg-white text-slate-800 overflow-hidden shadow-2xl hover:-translate-y-2 hover:shadow-purple-500/30 transition-all duration-300 border-2 border-transparent hover:border-purple-300 flex flex-col justify-between"
                >
                  <div>
                    {activity.coverImage && (
                      <div className="relative h-44 w-full overflow-hidden bg-purple-900">
                        <img
                          src={activity.coverImage}
                          alt={activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-black bg-purple-600 text-white shadow-md">
                          {activity.unitTitle.split(':')[0]}
                        </span>
                        <span className="absolute bottom-3 right-3 text-xs font-bold text-amber-300 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>{activity.totalPoints} نقطة</span>
                        </span>
                        <span className="absolute bottom-3 left-3 text-xs font-bold text-white/90">
                          ⏱️ {activity.totalTimeSeconds} ثانية
                        </span>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-purple-700">
                        <span>👨🏫 إعداد: {activity.teacherName}</span>
                        <span>•</span>
                        <span>{activity.questionsCount} أسئلة</span>
                      </div>

                      <h3 className="text-lg font-black text-purple-950 mt-2 leading-snug">
                        {activity.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                        <span className="text-slate-600 font-medium">
                          🎮 لُعب {activity.playsCount || 1} مرة
                        </span>
                        <span className="text-purple-900 font-extrabold">
                          رمز النشاط: {activity.shareCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Play Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      id={`btn-play-${activity.id}`}
                      onClick={() => onLaunchActivity(activity)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>بدء التحدي واللعب الآن</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Units and Lessons */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white">
            📚 الوحدات والدروس المقررة في مادة العلوم
          </h2>

          {units.length === 0 ? (
            <div className="p-8 text-center bg-white/5 rounded-2xl text-purple-200">
              الوحدات قيد التحضير والتحديث الأكاديمي.
            </div>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => {
                const isExpanded = expandedUnitId === unit.id;
                return (
                  <div
                    key={unit.id}
                    className="rounded-2xl bg-white text-slate-800 overflow-hidden shadow-lg border border-purple-100"
                  >
                    <div
                      onClick={() => setExpandedUnitId(isExpanded ? '' : unit.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-black">
                          {unit.number}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-purple-950">
                            {unit.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">{unit.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                        <span>{unit.lessons.length} دروس</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-purple-50/40 space-y-3">
                        <p className="text-xs font-bold text-slate-400">قائمة دروس الوحدة:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {unit.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm flex flex-col justify-between"
                            >
                              <div>
                                <h4 className="text-sm font-extrabold text-purple-900">
                                  {lesson.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {lesson.summary}
                                </p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-emerald-700 font-bold">جاهز للتحدي</span>
                                <button
                                  onClick={() => {
                                    // if an activity exists for this unit, launch it
                                    const matchedAct = gradeActivities.find(a => a.unitId === unit.id) || gradeActivities[0];
                                    if (matchedAct) onLaunchActivity(matchedAct);
                                  }}
                                  className="text-purple-700 hover:text-purple-950 font-black flex items-center gap-1"
                                >
                                  <span>تحدي الدرس</span>
                                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Resources & Simulations */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              🔗 الروابط والمحاكاة التفاعلية لـ {grade.name}
            </h2>
            <span className="text-xs text-purple-200">
              مكتبة منتقاة من المحاكاة ثلاثية الأبعاد والمواقع العلمية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradeResources.map((res) => (
              <div
                key={res.id}
                className="rounded-3xl bg-white text-slate-800 overflow-hidden shadow-xl p-5 border border-purple-100 flex flex-col justify-between hover:shadow-2xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800">
                      {res.type === 'simulation' ? '🔬 محاكاة' : res.type === 'video' ? '🎥 فيديو' : res.type === 'game' ? '🎮 لعبة' : '🌐 موقع'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      بواسطة: {res.authorName}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-purple-950 mt-2">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onOpenResource(res)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    <span>🚀 فتح المورد التعليمي</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
