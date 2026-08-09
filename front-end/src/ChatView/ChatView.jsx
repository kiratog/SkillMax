import { useRef, useEffect } from 'react';

const POPULAR_ROLES = [
  { id: 'Frontend Engineer', title: 'Frontend Engineer', icon: '💻' },
  { id: 'Backend Engineer', title: 'Backend Engineer', icon: '⚙️' },
  { id: 'Full Stack Engineer', title: 'Full Stack Engineer', icon: '🌐' },
  { id: 'AI / ML Engineer', title: 'AI / ML Engineer', icon: '🤖' },
  { id: 'Data Engineer', title: 'Data Engineer', icon: '📊' },
  { id: 'DevOps / Cloud Engineer', title: 'DevOps / Cloud Engineer', icon: '☁️' },
];

export default function ChatView({ messages, onSelectRole, onToggleTask, completedTasks = {} }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-3xl px-4 py-6 flex flex-col gap-6 mx-auto animate-fadeIn">
      {messages.map((msg, index) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={index}
            className={`flex items-start gap-3 w-full ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Bot Avatar */}
            {!isUser && (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                ⚡
              </div>
            )}

            {/* Message Content Container */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] p-4 rounded-2xl text-xs leading-relaxed bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none`}
            >
              {/* Text message */}
              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

              {/* SPECIAL BOT CARD: Resume Uploaded & Role Selector Chips */}
              {msg.type === 'resume_extracted' && (
                <div className="mt-3 flex flex-col gap-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-[11px] text-amber-400 font-semibold">
                    <span>📄 {msg.data.filename}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">{msg.data.pages} pages</span>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-medium">
                    Click a target role below or type your custom goal in the chat box:
                  </p>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {POPULAR_ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => onSelectRole(role.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-zinc-200 hover:text-amber-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{role.icon}</span>
                        <span>{role.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SPECIAL BOT CARD: Skill Gap Analysis & Roadmap inside Chat */}
              {msg.type === 'analysis_result' && msg.data && (
                <div className="mt-4 flex flex-col gap-4 pt-4 border-t border-zinc-800">
                  {/* Gauge Header */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Target Role</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{msg.data.targetRole}</h4>
                    </div>
                    <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-zinc-950 border border-amber-500/30">
                      <span className="text-xl font-extrabold text-amber-400">{msg.data.matchScore}%</span>
                      <span className="text-[9px] text-zinc-400 font-medium uppercase">Readiness</span>
                    </div>
                  </div>

                  {/* Existing vs Missing Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="font-bold text-emerald-400 block mb-1">✓ Skills You Have ({msg.data.existingSkills?.length || 0})</span>
                      <div className="flex flex-wrap gap-1">
                        {msg.data.existingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="font-bold text-amber-400 block mb-1">⚠️ Skill Gaps ({msg.data.missingSkills?.length || 0})</span>
                      <div className="flex flex-wrap gap-1">
                        {msg.data.missingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Roadmap To-Do Items */}
                  {msg.data.recommendations && msg.data.recommendations.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-zinc-800 text-[11px]">
                      <span className="font-bold text-zinc-300 block mb-2 uppercase tracking-wider text-[10px]">
                        📋 Placement Action Plan (Roadmap To-Do List)
                      </span>
                      <div className="space-y-2">
                        {msg.data.recommendations.map((rec, i) => {
                          const taskId = `${msg.data.targetRole}-${i}`;
                          const isDone = Boolean(completedTasks[taskId]);
                          return (
                            <div
                              key={i}
                              onClick={() => onToggleTask && onToggleTask(taskId)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                                isDone
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                                  : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => {}} // handled by parent onClick
                                className="mt-0.5 rounded accent-amber-500 cursor-pointer"
                              />
                              <span>{rec}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold shrink-0 mt-0.5">
                👤
              </div>
            )}
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
}
