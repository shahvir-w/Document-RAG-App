import React from 'react';
import { SplitSquareHorizontal, MessageSquare } from 'lucide-react';

interface ViewSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const ViewSlider: React.FC<ViewSliderProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-4">
      <SplitSquareHorizontal className={`w-5 h-5 ${value === 0 ? 'text-blue-400' : 'text-gray-500'}`} />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none bg-gray-700/50 cursor-pointer
                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400
                 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                 [&::-webkit-slider-thumb]:hover:scale-110"
      />
      <MessageSquare className={`w-5 h-5 ${value === 1 ? 'text-blue-400' : 'text-gray-500'}`} />
    </div>
  );
}

export default ViewSlider;