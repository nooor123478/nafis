import { useState } from 'react';
import { GradeId, CycleId } from '../types';
import { GRADES_DATA, SCIENCE_UNITS } from '../data/mockData';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Layers } from 'lucide-react';

interface CycleGradeSelectorProps {
  selectedCycle: CycleId;
  onSelectCycle: (cycle: CycleId) => void;
  onSelectGrade: (gradeId: GradeId) => void;
  onBack?: () => void;
}

export default function CycleGradeSelector({
  selectedCycle,
  onSelectCycle,
  onSelectGrade,
  onBack,
}: CycleGradeSelectorProps) {
  const filteredGrades = GRADES_DATA.filter((g) => g.cycleId === selectedCycle);

  return (
    <div className="py-6 space-y-8">
      
      {/* Back button if available */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            id="btn-back-cycle"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm border border-white/20 backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للخلف</span>
          </button>

          <span className="text-xs text-purple-200 font-bold bg-purple-900/60 px-3 py-1.5 rounded-xl border border-purple-500/20">
            {selectedCycle === 'cycle-1' ? '🟢 المرحلة الأولى (1-4)' : '🔵 المرحلة الثانية (5-10)'}
          </span>
        </div>
      )}

      {/* Cycle Tabs Switcher */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-white font-['Changa',sans-serif]">
          📚 اختر الحلقة والصف الدراسي
        </h2>
        <p className="text-purple-200 text-sm max-w-xl mx-auto">
          اختر المرحلة التعليمية لاستعراض مناهج مادة العلوم والوحدات التعليمية والأنشطة التنافسية
        </p>

        <div className="inline-flex p-1.5 rounded-2xl bg-purple-950/70 border border-purple-500/30 shadow-xl max-w-md mx-auto">
          <button
            id="tab-cycle-1"
            onClick={() => onSelectCycle('cycle-1')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${
              selectedCycle === 'cycle-1'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <span>🟢</span>
            <span>الحلقة الأولى (الصفوف 1–4)</span>
          </button>

          <button
            id="tab-cycle-2"
            onClick={() => onSelectCycle('cycle-2')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${
              selectedCycle === 'cycle-2'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <span>🔵</span>
            <span>الحلقة الثانية (الصفوف 5–10)</span>
          </button>
        </div>
      </div>

      {/* Grade Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGrades.map((grade) => {
          const unitsForGrade = SCIENCE_UNITS.filter((u) => u.gradeId === grade.id);
          const unitsCount = unitsForGrade.length > 0 ? unitsForGrade.length : grade.unitsCount;

          return (
            <div
              key={grade.id}
              id={`grade-card-${grade.id}`}
              onClick={() => onSelectGrade(grade.id)}
              className="group cursor-pointer rounded-3xl bg-white text-slate-800 p-6 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-400 flex flex-col justify-between"
            >
              <div>
                {/* Grade Number Badge and Science Icon */}
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-900 font-black text-2xl flex items-center justify-center border border-purple-100 group-hover:bg-purple-900 group-hover:text-amber-300 transition-colors">
                    {grade.icon}
                  </span>
                  <span className="text-xs font-black px-3 py-1 bg-purple-100 text-purple-900 rounded-full">
                    الصف {grade.number}
                  </span>
                </div>

                <h3 className="text-xl font-black text-purple-950 mt-4 group-hover:text-purple-700 transition-colors">
                  {grade.name}
                </h3>
                <p className="text-xs font-bold text-amber-700 mt-1">
                  🔬 مادة العلوم المتكاملة
                </p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {grade.description}
                </p>

                {/* Units preview */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>{unitsCount} وحدات تعليمية</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>أنشطة تفاعلية</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-purple-800 group-hover:text-purple-950">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>دخول مادة العلوم والأنشطة</span>
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center group-hover:bg-purple-800 group-hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
