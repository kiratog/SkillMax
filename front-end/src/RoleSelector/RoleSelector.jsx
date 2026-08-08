import { useState } from 'react';

const POPULAR_ROLES = [
  { id: 'Frontend Engineer', title: 'Frontend Engineer', icon: '💻', desc: 'React, TypeScript, CSS & Web Performance' },
  { id: 'Backend Engineer', title: 'Backend Engineer', icon: '⚙️', desc: 'Node.js, Databases, REST/GraphQL & System Design' },
  { id: 'Full Stack Engineer', title: 'Full Stack Engineer', icon: '🌐', desc: 'End-to-end Web Apps, DB, APIs & Frontend' },
  { id: 'AI / ML Engineer', title: 'AI / ML Engineer', icon: '🤖', desc: 'Python, PyTorch, LLMs, Computer Vision & MLOps' },
  { id: 'Data Engineer', title: 'Data Engineer', icon: '📊', desc: 'SQL, ETL Pipelines, PySpark & Data Warehousing' },
  { id: 'DevOps / Cloud Engineer', title: 'DevOps / Cloud Engineer', icon: '☁️', desc: 'Docker, Kubernetes, CI/CD, AWS & Terraform' },
];

export default function RoleSelector({ onSelectRole, onBack }) {
  const [selectedRole, setSelectedRole] = useState('Full Stack Engineer');
  const [customRole, setCustomRole] = useState('');

  const handleProceed = () => {
    const roleToUse = customRole.trim() ? customRole.trim() : selectedRole;
    if (onSelectRole) onSelectRole(roleToUse);
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col items-center justify-center text-center animate-fadeIn">
      {/* Container */}
      <div className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 md:p-8 backdrop-blur-md flex flex-col items-center gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Select Your Target Job Role
          </h2>
          <p className="text-xs text-zinc-400 max-w-md">
            SkillMax will compare your resume skills against industry requirements for this role to detect your skill gaps.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full my-2">
          {POPULAR_ROLES.map((role) => {
            const isSelected = selectedRole === role.id && !customRole;
            return (
              <div
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setCustomRole('');
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{role.icon}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{role.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-tight">{role.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Role Input */}
        <div className="w-full text-left">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Or type a custom job role:
          </label>
          <input
            type="text"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="e.g. Mobile App Developer, Cybersecurity Analyst..."
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-amber-500/70 focus:outline-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              ← Back to Resume
            </button>
          )}
          <button
            onClick={handleProceed}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-sm"
          >
            Analyze Skill Gaps for {customRole.trim() ? customRole.trim() : selectedRole} →
          </button>
        </div>
      </div>
    </div>
  );
}
