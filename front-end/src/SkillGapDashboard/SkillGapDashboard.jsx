export default function SkillGapDashboard({ analysisResult, onReset, onChangeRole }) {
  if (!analysisResult) return null;

  const {
    matchScore = 70,
    targetRole = "Full Stack Engineer",
    existingSkills = [],
    missingSkills = [],
    strengths = [],
    recommendations = [],
  } = analysisResult;

  // Determine score color badge
  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'High Readiness', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (score >= 60) return { label: 'Moderate Readiness', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: 'Needs Skill Building', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const badge = getScoreBadge(matchScore);

  return (
    <div className="w-full max-w-3xl px-4 flex flex-col items-center justify-center text-center animate-fadeIn my-6">
      <div className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 md:p-8 backdrop-blur-md flex flex-col items-center gap-6 shadow-2xl">
        
        {/* Header & Score Gauge */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-800/80 pb-6 text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">
              {targetRole}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Based on AI resume text parsing and benchmark industry placement criteria.
            </p>
          </div>

          {/* Readiness Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 min-w-36 text-center">
            <span className="text-3xl md:text-4xl font-extrabold text-white">
              {matchScore}<span className="text-lg text-amber-400">%</span>
            </span>
            <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Existing Skills vs Skill Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
          
          {/* Acquired Skills */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Skills You Have ({existingSkills.length})
              </h3>
            </div>
            
            {existingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {existingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No direct matches found in resume text.</p>
            )}
          </div>

          {/* Skill Gaps */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Skill Gaps to Bridge ({missingSkills.length})
              </h3>
            </div>

            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                  >
                    ⚠️ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">You hit all key skill requirements!</p>
            )}
          </div>
        </div>

        {/* Key Recommendations Box */}
        {recommendations.length > 0 && (
          <div className="w-full p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-left">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              💡 Actionable Learning Steps
            </h3>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          {onChangeRole && (
            <button
              onClick={onChangeRole}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Change Target Role
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Upload Different PDF
            </button>
          )}
          <button
            onClick={() => alert("Proceeding to Phase 3: Personalized Learning Roadmap Generator!")}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-sm"
          >
            Generate Personalized Learning Roadmap (Phase 3) →
          </button>
        </div>
      </div>
    </div>
  );
}
