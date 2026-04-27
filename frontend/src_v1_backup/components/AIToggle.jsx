import React from 'react';
import { Zap, Cloud, Cpu } from 'lucide-react';

const MODES = [
  { id: 'local', label: 'Fast', icon: Zap, desc: 'Local AI', color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'api', label: 'Smart', icon: Cloud, desc: 'Cloud AI', color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'auto', label: 'Auto', icon: Cpu, desc: 'Auto Route', color: 'text-purple-600', bg: 'bg-purple-100' }
];

export default function AIToggle({ mode, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-sm border border-donkeyBrown/20">
      {MODES.map(({ id, label, icon: Icon, desc, color, bg }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === id 
              ? `${bg} ${color} shadow-sm` 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          title={`${label} - ${desc}`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
