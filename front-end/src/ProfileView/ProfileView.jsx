export default function ProfileView({ user, extractedResume, analysisResult, completedTasks = {}, onToggleTask, onReturnToChat }) {
  const matchScore = analysisResult?.matchScore || 0;
  const targetRole = analysisResult?.targetRole || "Not Selected Yet";
  const existingSkills = analysisResult?.existingSkills || [];
  const missingSkills = analysisResult?.missingSkills || [];
  const recommendations = analysisResult?.recommendations || [];

  // Calculate Roadmap Progress %
  const totalTasks = recommendations.length;
  const completedCount = recommendations.filter((_, i) => completedTasks[`${targetRole}-${i}`]).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="w-full max-w-4xl px-4 py-8 flex flex-col items-center gap-6 mx-auto animate-fadeIn">
      
      {/* Top Banner & Header */}
      <div className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 md:p-8 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {user?.name || 'Student Profile'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                Placement Candidate
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{user?.email || 'Guest Student'}</p>
            <p className="text-xs text-amber-400/90 font-medium mt-1">
              Target Role: <span className="text-white font-semibold">{targetRole}</span>
            </p>
          </div>
        </div>

        {/* Readiness Dial */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 min-w-36 text-center">
          <span className="text-3xl font-extrabold text-white">
            {matchScore}<span className="text-sm text-amber-400">%</span>
          </span>
          <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border text-amber-400 border-amber-500/30 bg-amber-500/10">
            Readiness Score
          </span>
        </div>
      </div>

      {/* 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
        
        {/* Card 1: Resume Extraction Details */}
        <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">📄 Resume Status</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              extractedResume ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}>
              {extractedResume ? 'Analyzed' : 'No Resume Uploaded'}
            </span>
          </div>

          {extractedResume ? (
            <div className="flex flex-col gap-2 text-xs text-zinc-300">
              <p><span className="text-zinc-400">File Name:</span> <strong className="text-white">{extractedResume.filename}</strong></p>
              <p><span className="text-zinc-400">Page Count:</span> <strong className="text-white">{extractedResume.pages} Page(s)</strong></p>
              
              <div className="mt-2 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-400 max-h-32 overflow-y-auto">
                {extractedResume.extractedText}
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">Upload your resume to see extracted text and skill breakdown.</p>
          )}
        </div>

        {/* Card 2: Roadmap Completion & Progress Tracker */}
        <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">📈 Roadmap Progress</h3>
            <span className="text-xs font-bold text-amber-400">{progressPercent}% Done</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-2 mt-1 max-h-48 overflow-y-auto pr-1">
              {recommendations.map((rec, i) => {
                const taskId = `${targetRole}-${i}`;
                const isDone = Boolean(completedTasks[taskId]);
                return (
                  <div
                    key={i}
                    onClick={() => onToggleTask && onToggleTask(taskId)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors border text-xs ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="mt-0.5 rounded accent-amber-500 cursor-pointer"
                    />
                    <span>{rec}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">Select a target role in chat to generate your placement roadmap to-do items.</p>
          )}
        </div>
      </div>

      {/* Skill Matrix Section */}
      <div className="w-full p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md flex flex-col gap-4 text-left">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">⚡ Skill Matrix Inventory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="text-xs font-bold text-emerald-400 mb-2">Acquired Skills ({existingSkills.length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {existingSkills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="text-xs font-bold text-amber-400 mb-2">Missing Skill Gaps ({missingSkills.length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium">
                  ⚠️ {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Return Button */}
      <button
        onClick={onReturnToChat}
        className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-sm mt-2"
      >
        ← Return
      </button>
    </div>
  );
}
