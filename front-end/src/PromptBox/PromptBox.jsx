import { useRef, useState } from 'react';

export default function PromptBox({ onSend, onFileUpload }) {
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (onSend) onSend(prompt);
    setPrompt('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl px-2"
    >
      {/* Hidden File Input for Prompt Box Attachment */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Minimal Glassmorphic Prompt Box Container */}
      <div className="flex items-center gap-2 p-2 pl-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-amber-500/40 focus-within:border-amber-500/70 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.3)] focus-within:bg-black/50 transition-all duration-300">
        
        {/* Upload / Plus SVG Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-gray-300 hover:text-amber-400 hover:bg-white/10 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none cursor-pointer group"
          title="Upload resume or document"
          aria-label="Upload document"
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-colors duration-200"
          >
            <path 
              d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="square"
            />
            <path 
              d="M8 12H16" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="square"
            />
            <path 
              d="M12 16V8" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="square"
            />
          </svg>
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Or I'll Help you to build your resume!"
          className="w-full bg-transparent text-white placeholder-gray-400/80 focus:outline-none px-2 text-sm md:text-base font-normal tracking-wide"
        />

        {/* Submit Send Button */}
        <button
          type="submit"
          disabled={!prompt.trim()}
          className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none ${
            prompt.trim()
              ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer'
              : 'bg-white/10 text-gray-500 cursor-not-allowed opacity-50'
          }`}
          aria-label="Send Prompt"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m5 12 7-7 7 7"/>
            <path d="M12 19V5"/>
          </svg>
        </button>
      </div>
    </form>
  );
}
