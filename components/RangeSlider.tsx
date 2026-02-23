import React from 'react';

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  onChange,
}) => {
  const widthPercentage = `${((value - 1) / 9) * 100}%`;

  return (
    <div className="relative w-full py-2">
      {/* Track Background */}
      <div className="relative w-full h-1.5 bg-slate-800 rounded-full shadow-inner border border-white/5">

        {/* Active Track (Progress) */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-300"
          style={{ width: widthPercentage }}
        ></div>

        {/* Real Input (Hidden) */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
        />

        {/* Custom Visual Thumb (El "Tirador") */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-8 w-4 bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-orange-500 rounded-lg transition-all duration-150 pointer-events-none transform -translate-x-1/2 flex items-center justify-center z-20"
          style={{ left: widthPercentage }}
        >
          {/* Centered Point */}
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
        </div>
      </div>

      {/* Range Labels */}
      <div className="flex justify-between mt-6 px-1">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Deficiente</span>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sobresaliente</span>
      </div>
    </div>
  );
};
