// src/components/ui/club-form-elements.tsx
import React from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import CuratorLoader from "./CuratorLoader";

export const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
      active
        ? "bg-primary text-white shadow-lg"
        : "text-gray-400 hover:bg-primary/5"
    }`}
  >
    {icon} {label}
  </button>
);

export const Input = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
      {label}
    </label>
    <input
      {...props}
      onChange={(e) => props.onChange(e.target.value)}
      className="w-full bg-[#fdf8f1] dark:bg-black/20 border border-primary/10 p-3 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
    />
  </div>
);

export const Select = ({ label, options, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-[#fdf8f1] dark:bg-black/20 border border-primary/10 p-3 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Select Category</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
        size={16}
      />
    </div>
  </div>
);

export const TextArea = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#fdf8f1] dark:bg-black/20 border border-primary/10 p-3 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary/20 h-28 resize-none"
    />
  </div>
);

export const SaveButton = ({ loading, onClick, label, icon: Icon }: any) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
  >
    {loading ? (
      <CuratorLoader />
    ) : (
      <>
        <Icon size={18} /> {label}
      </>
    )}
  </button>
);
