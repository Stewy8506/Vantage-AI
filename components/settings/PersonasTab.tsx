"use client";

import React from "react";

interface CustomPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  commentRatio: number;
}

interface PersonasTabProps {
  customPersonas: CustomPersona[];
  newPersona: CustomPersona;
  setNewPersona: React.Dispatch<React.SetStateAction<CustomPersona>>;
  handleAddPersona: () => void;
  handleRemovePersona: (id: string) => void;
}

export default function PersonasTab({
  customPersonas,
  newPersona,
  setNewPersona,
  handleAddPersona,
  handleRemovePersona,
}: PersonasTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Focus Group Personas</h3>
        <p className="text-xs text-zinc-500">
          Customize the focus group personas who simulate reactions, comments, and engagement probability.
        </p>
      </div>

      <div className="typographic-form">
        {/* Add Persona */}
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label">Create Target Persona</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col col-span-2">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Persona Name</span>
                <input
                  type="text"
                  placeholder="e.g. Skeptical CTO"
                  className="minimal-input text-xs"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Avatar Emoji</span>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="💡"
                  className="minimal-input text-xs text-center"
                  value={newPersona.avatar}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, avatar: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Unique ID</span>
                <input
                  type="text"
                  placeholder="e.g. cto"
                  className="minimal-input text-xs font-mono"
                  value={newPersona.id}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, id: e.target.value }))}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Comment Ratio ({newPersona.commentRatio}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newPersona.commentRatio}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, commentRatio: parseInt(e.target.value) || 0 }))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <div className="flex flex-col mt-4">
              <span className="text-[10px] text-zinc-500 font-mono mb-1">Biography & Critique Focus</span>
              <textarea
                className="minimal-input text-xs"
                placeholder="Values deep technical specs, filters marketing hype, prioritizes security..."
                rows={3}
                value={newPersona.description}
                onChange={(e) => setNewPersona(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <button
              onClick={handleAddPersona}
              className="custom-btn custom-btn-accent text-xs font-mono py-2 px-4 mt-4"
            >
              + Add Persona Profile
            </button>
          </div>
        </div>

        {/* Persona List */}
        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <label className="row-label mb-2 block">Active Simulator Panel</label>
            <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
              {customPersonas.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 font-sans">No personas registered.</div>
              ) : (
                customPersonas.map((p) => (
                  <div key={p.id} className="flex justify-between items-start p-3">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 font-sans">
                        <span className="text-[16px]">{p.avatar}</span>
                        <span className="font-bold text-white text-[12px]">{p.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({p.commentRatio}% Comments)</span>
                      </div>
                      <div className="text-zinc-500 text-[10px] mt-0.5 font-mono">ID: {p.id}</div>
                      <div className="text-zinc-400 text-[10px] mt-1 italic font-sans line-clamp-2" title={p.description}>
                        {p.description}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePersona(p.id)}
                      className="text-zinc-500 hover:text-rose-500 font-mono text-[9px] uppercase border border-zinc-800 hover:border-rose-500 px-2 py-1 transition-colors mt-1"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
