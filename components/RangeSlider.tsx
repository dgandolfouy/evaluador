import React from 'react';

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description: string;
  feedback?: string;
  onFeedbackChange: (text: string) => void;
}

const MAX_CHARS = 500;

export const RangeSlider: React.FC<RangeSliderProps> = ({ 
  value, 
  onChange, 
  label, 
  description,
  feedback,
  onFeedbackChange
}) => {
  const getColor = (val: number) => {
    if (val < 5) return 'text-red-500 bg-red-500';
    if (val < 8) return 'text-amber-500 bg-amber-500';
    return 'text-orange-500 bg-orange-500';
  };

  const colorClass = getColor(value);
  const widthPercentage = `${(value / 10) * 100}%`;
  const currentChars = feedback?.length || 0;

  return (
    <div className="group bg-slate-900 border-b border-slate-800 last:border-0 p-4 sm:p-8 hover:bg-slate-800/50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
      
      {/* Info */}
      <div className="md:col-span-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-orange-500 rounded-full"></div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{label}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-4 sm:pl-5">{description}</p>
      </div>

      {/* Slider */}
      <div className="md:col-span-4 pt-2">
        <div className="flex justify-between items-end mb-4">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntuación</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-3xl font-black ${colorClass.split(' ')[0]}`}>{value}</span>
              <span className="text-slate-600 font-bold text-xs sm:text-base">/ 10</span>
            </div>
        </div>
        
        <div className="relative w-full h-3 sm:h-4 bg-slate-800 rounded-full cursor-pointer shadow-inner border border-slate-700">
            <div className="absolute top-0 left-0 h-full w-full rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${colorClass.split(' ')[1]}`}
                    style={{ width: widthPercentage }}
                ></div>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {/* Thumb Visual */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 bg-slate-900 shadow-xl border-2 border-orange-500 rounded-full transition-all duration-500 pointer-events-none transform -translate-x-1/2 flex items-center justify-center"
                style={{ left: widthPercentage }}
            >
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            </div>
        </div>
        <div className="flex justify-between mt-3 text-[8px] sm:text-[9px] text-slate-500 uppercase font-black tracking-widest">
            <span>Deficiente</span>
            <span>Sobresaliente</span>
        </div>
      </div>

      {/* Feedback */}
      <div className="md:col-span-4">
        <div className="flex justify-between items-center mb-3">
            <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Evidencia ISO 9001
            </label>
            <span className={`text-[9px] sm:text-[10px] font-bold ${currentChars >= MAX_CHARS ? 'text-red-500' : 'text-slate-600'}`}>
                {currentChars} / {MAX_CHARS}
            </span>
        </div>
        <textarea
            value={feedback || ''}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder="Describa hechos, datos o situaciones observadas..."
            maxLength={MAX_CHARS}
            className="w-full text-xs sm:text-sm p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-slate-900 focus:border-orange-500 outline-none transition-all resize-none h-24 sm:h-28 font-medium placeholder:text-slate-600 text-white"
        />
      </div>

    </div>
  );
};
