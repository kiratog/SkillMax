import { useRef, useState, useEffect } from "react";

export default function ResumeUpload({ user, onRequireAuth, onAnalyzed }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | require_auth | error
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  // User is authenticated ONLY if user object exists and token is present
  const isAuthenticated = Boolean(user && localStorage.getItem("skillmax_token"));

  // Automatically clear any stale auth error message as soon as user logs in
  useEffect(() => {
    if (isAuthenticated) {
      if (status === "require_auth") {
        setStatus("idle");
        setErrorMessage("");
      }
    }
  }, [user, isAuthenticated, status]);

  const processFileUpload = async (file) => {
    if (!isAuthenticated) {
      setStatus("require_auth");
      setErrorMessage("Please Log In / Sign Up to upload your resume");
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (!file) return;

    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorMessage("Only PDF resumes are supported. Please upload a .pdf file.");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    const token = localStorage.getItem("skillmax_token");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:5001/api/resume/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process resume");
      }

      setResumeData(data);
      setStatus("success");
      if (onAnalyzed) onAnalyzed(data);
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Upload failed. Try again.");
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      setStatus("require_auth");
      setErrorMessage("Please Log In / Sign Up to upload your resume");
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setErrorMessage("");
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFileUpload(file);
  };

  // Drag & Drop handlers on SVG
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isAuthenticated) {
      setStatus("require_auth");
      setErrorMessage("Please Log In / Sign Up to upload your resume");
      if (onRequireAuth) onRequireAuth();
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFileUpload(files[0]);
    }
  };

  const handleResetUpload = () => {
    setResumeData(null);
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {status === "success" && resumeData ? (
        /* Minimal Sleek Summary Card when Resume is Extracted */
        <div className="w-full max-w-lg rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 backdrop-blur-md flex flex-col items-center text-center gap-5 transition-all duration-300">
          <div className="flex flex-col items-center gap-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              ✓ Resume Uploaded & Text Extracted
            </span>
            <h3 className="text-xl font-semibold text-white tracking-tight mt-2">
              {resumeData.filename}
            </h3>
            <p className="text-xs text-zinc-400">
              {resumeData.pages} Page{resumeData.pages > 1 ? "s" : ""} • {resumeData.textLength} Characters Extracted
            </p>
          </div>

          {/* Actual Extracted Text Preview Box */}
          <div className="w-full max-h-48 overflow-y-auto p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left text-xs text-zinc-300 font-mono leading-relaxed custom-scrollbar">
            <p className="text-amber-400/80 font-semibold mb-1 uppercase tracking-wider text-[10px]">Extracted Text Preview:</p>
            <p className="whitespace-pre-wrap">{resumeData.extractedText || "No text extracted."}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-1">
            <button
              onClick={() => alert("Proceeding to Target Role Skill Gap Analysis (Phase 2)!")}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              Analyze Skills & Detect Gaps →
            </button>
            <button
              onClick={handleResetUpload}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Upload Different PDF
            </button>
          </div>
        </div>
      ) : (
        /* Standalone Document SVG Alone in Middle */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className="relative flex flex-col items-center justify-center cursor-pointer group p-4"
        >
          {status === "uploading" ? (
            <div className="w-56 h-72 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-amber-400 font-medium text-sm">Reading Resume...</span>
            </div>
          ) : (
            <svg 
              className={`w-56 md:w-64 h-auto object-contain transition-all duration-300 ${
                isDragging ? "scale-105 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" : "group-hover:scale-105"
              }`} 
              viewBox="0 0 256 383" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M168 47.875H40V335.125H216V119.688" stroke="#f59e0b" strokeWidth="2" strokeLinecap="square" strokeDasharray="4 4"/>
              <path d="M216 119.688L168 47.875V119.688H216Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="square"/>
              <path d="M128 172V212M108 192H148" stroke="#f59e0b" strokeWidth="2" strokeLinecap="square"/>
              
              {/* Inner Vector Text: "Upload your Resume" */}
              <g fill="#f59e0b">
                {/* U */}
                <path d="M62.56 248.09h1.32v7.22c0 .75-.18 1.41-.53 2-.35.58-.84 1.04-1.47 1.38-.64.33-1.39.5-2.24.5s-1.6-.17-2.24-.5c-.64-.34-1.13-.8-1.48-1.38-.35-.58-.52-1.25-.52-2v-7.22h1.32v7.12c0 .53.12 1.01.35 1.42.23.41.57.73 1 .97.44.24.96.35 1.57.35s1.13-.11 1.57-.35c.44-.24.77-.56 1-.97.23-.41.35-.89.35-1.42v-7.12z"/>
                {/* p */}
                <path d="M66.35 262.07v-11.25h1.21v1.3h.15c.09-.14.22-.32.38-.54.17-.22.41-.42.72-.6.31-.18.73-.27 1.26-.27.69 0 1.3.17 1.82.52.53.34.94.83 1.23 1.46.29.63.44 1.38.44 2.24 0 .87-.15 1.62-.44 2.25-.3.63-.7 1.12-1.23 1.47-.52.34-1.12.52-1.8.52-.53 0-.95-.09-1.27-.26-.32-.18-.56-.38-.73-.6-.17-.23-.3-.42-.39-.57h-.11v4.33h-1.25zm1.24-7.16c0 .62.09 1.17.27 1.64.18.47.44.84.79 1.1.35.27.78.4 1.28.4.53 0 .97-.14 1.32-.41.35-.28.62-.66.8-1.13.18-.47.27-1 .27-1.58 0-.58-.09-1.1-.27-1.56-.18-.47-.44-.84-.8-1.11-.35-.27-.79-.41-1.32-.41-.51 0-.94.13-1.29.39-.35.25-.61.61-.79 1.07-.18.46-.27.99-.27 1.6z"/>
                {/* l */}
                <path d="M76.75 248.09v10.91h-1.26v-10.91h1.26z"/>
                {/* o */}
                <path d="M82.37 259.17c-.74 0-1.39-.17-1.94-.52-.55-.35-.99-.84-1.3-1.47-.31-.63-.46-1.37-.46-2.22 0-.85.15-1.6.46-2.23.31-.64.75-1.13 1.3-1.48.55-.35 1.2-.52 1.94-.52s1.39.17 1.94.52c.56.35 1 .84 1.31 1.48.31.63.47 1.38.47 2.23 0 .85-.16 1.59-.47 2.22-.31.63-.74 1.12-1.31 1.47-.55.35-1.2.52-1.94.52zm0-1.13c.56 0 1.02-.14 1.38-.43.36-.29.63-.67.8-1.14.18-.47.27-.98.27-1.53 0-.55-.09-1.06-.27-1.53-.17-.47-.44-.85-.8-1.14-.36-.29-.82-.43-1.38-.43s-1.02.14-1.38.43c-.36.29-.63.67-.8 1.14-.17.47-.26.98-.26 1.53 0 .55.09 1.06.26 1.53.17.47.44.85.8 1.14.36.29.82.43 1.38.43z"/>
                {/* a */}
                <path d="M90.41 259.19c-.52 0-.99-.1-1.41-.29-.42-.2-.76-.49-1.01-.86-.25-.38-.37-.83-.37-1.36 0-.47.09-.85.28-1.14.18-.29.43-.52.74-.69.31-.17.65-.29 1.02-.37.38-.08.76-.15 1.14-.2.5-.06.9-.11 1.21-.14.31-.04.54-.1.68-.18.15-.08.22-.22.22-.42v-.04c0-.53-.14-.94-.43-1.23-.28-.29-.71-.44-1.29-.44-.6 0-1.07.13-1.41.39-.34.26-.58.54-.72.84l-1.19-.43c.21-.5.5-.89.85-1.17.36-.28.75-.48 1.18-.59.43-.11.85-.17 1.26-.17.26 0 .56.03.9.09.34.06.68.19 1 .38.32.19.59.48.8.87.21.39.32.91.32 1.56v5.39h-1.26v-1.11h-.06c-.09.18-.23.37-.43.57-.2.2-.47.37-.8.51-.33.14-.73.21-1.21.21zm.19-1.13c.5 0 .92-.1 1.26-.29.34-.2.6-.45.77-.76.18-.31.27-.63.27-.97v-1.15c-.05.06-.17.12-.35.18-.18.05-.39.09-.62.13-.23.03-.46.07-.68.1-.12.02-.95.04-1.08.06-.33.04-.63.11-.92.21-.28.09-.51.23-.68.42-.17.18-.26.43-.26.75 0 .44.16.77.48.99.33.22.74.33 1.24.33z"/>
                {/* d */}
                <path d="M99.54 259.17c-.68 0-1.28-.17-1.8-.52-.52-.35-.93-.84-1.23-1.47-.29-.64-.44-1.39-.44-2.25 0-.86.15-1.6.44-2.24.29-.63.7-.12 1.23-1.47.53-.34 1.13-.52 1.82-.52.53 0 .95.09 1.26.27.31.17.55.37.72.6.17.22.3.4.39.54h.11v-4.03h1.26v10.91h-1.22v-1.26h-.15c-.09.15-.22.34-.39.57-.17.22-.41.42-.73.6-.32.17-.74.26-1.27.26zm.17-1.13c.5 0 .93-.13 1.28-.4.35-.27.61-.64.79-1.11.18-.47.27-1.02.27-1.63 0-.62-.09-1.15-.27-1.61-.18-.46-.44-.82-.79-1.09-.35-.26-.78-.39-1.31-.39-.53 0-.96.14-1.31.41-.35.27-.62.64-.79 1.1-.17.46-.26.98-.26 1.56 0 .58.09 1.11.27 1.58.18.47.44.85.8 1.13.35.28.79.42 1.32.42z"/>
                
                {/* your */}
                <path d="M110.8 262.07c-.21 0-.4 0-.57-.05-.17-.03-.28-.07-.35-.1l.32-1.11c.31.08.58.11.81.09.23-.02.44-.13.62-.31.18-.18.35-.48.5-.9l.24-.64-3.03-8.23h1.36l2.26 6.52h.09l2.26-6.52h1.36l-3.47 9.38c-.16.42-.35.77-.58 1.05-.23.28-.5.49-.81.62-.3.14-.64.21-1.02.21z"/>
                <path d="M121.37 259.17c-.74 0-1.39-.17-1.94-.52-.55-.35-.99-.84-1.3-1.47-.31-.63-.46-1.37-.46-2.22 0-.85.15-1.6.46-2.23.31-.64.75-1.13 1.3-1.48.55-.35 1.2-.52 1.94-.52s1.39.17 1.94.52c.56.35 1 .84 1.31 1.48.31.63.47 1.38.47 2.23 0 .85-.16 1.59-.47 2.22-.31.63-.74 1.12-1.31 1.47-.55.35-1.2.52-1.94.52zm0-1.13c.56 0 1.02-.14 1.38-.43.36-.29.63-.67.8-1.14.18-.47.27-.98.27-1.53 0-.55-.09-1.06-.27-1.53-.17-.47-.44-.85-.8-1.14-.36-.29-.82-.43-1.38-.43s-1.02.14-1.38.43c-.36.29-.63.67-.8 1.14-.17.47-.26.98-.26 1.53 0 .55.09 1.06.26 1.53.17.47.44.85.8 1.14.36.29.82.43 1.38.43z"/>
                <path d="M132.15 255.66v-4.84h1.26v8.18h-1.26v-1.38h-.09c-.19.42-.49.77-.89 1.06-.4.29-.92.43-1.54.43-.51 0-.96-.11-1.36-.34-.4-.23-.71-.57-.94-1.02-.23-.46-.34-1.04-.34-1.74v-5.2h1.26v5.11c0 .6.17 1.07.5 1.43.34.35.77.53 1.29.53.31 0 .63-.08.95-.24.33-.16.6-.4.82-.73.22-.33.34-.75.34-1.26z"/>
                <path d="M135.71 259v-8.18h1.21v1.24h.09c.15-.4.42-.73.81-.98.39-.25.83-.38 1.32-.38.09 0 .21 0 .35.01.14 0 .24.01.31.02v1.28c-.04-.01-.14-.03-.29-.05-.15-.02-.31-.04-.48-.04-.4 0-.75.08-1.06.25-.31.16-.56.39-.74.68-.18.29-.27.62-.27.99v5.18h-1.26z"/>

                {/* Resume */}
                <path d="M145.68 259v-10.91h3.69c.85 0 1.55.15 2.1.44.55.29.95.68 1.21 1.19.26.5.39 1.08.39 1.72 0 .64-.13 1.21-.39 1.71-.26.5-.66.89-1.2 1.17-.54.28-1.24.42-2.08.42h-2.98v-1.19h2.94c.58 0 1.05-.08 1.4-.25.36-.17.62-.41.78-.73.16-.32.24-.69.24-1.13 0-.44-.08-.82-.24-1.15-.16-.33-.42-.58-.78-.76-.36-.18-.83-.27-1.42-.27h-2.32v9.74h-1.32zm5.14-4.9l2.68 4.9h-1.53l-2.64-4.9h1.49z"/>
                <path d="M158.45 259.17c-.79 0-1.47-.17-2.04-.52-.57-.35-1.01-.84-1.32-1.47-.3-.63-.46-1.37-.46-2.21 0-.84.15-1.58.46-2.22.31-.64.74-1.14 1.29-1.5.55-.36 1.2-.54 1.94-.54.43 0 .85.07 1.26.21.41.14.79.37 1.13.69.34.32.61.74.81 1.26.2.52.3 1.16.3 1.93v.53h-6.31v-1.09h5.03c0-.46-.09-.87-.28-1.23-.18-.36-.44-.65-.78-.86-.33-.21-.73-.31-1.18-.31-.5 0-.93.12-1.3.37-.36.25-.64.57-.84.96-.19.39-.29.81-.29 1.27v.73c0 .62.11 1.14.32 1.57.22.43.52.75.9.98.38.22.83.33 1.34.33.33 0 .63-.05.9-.14.27-.1.5-.24.7-.43.19-.19.34-.43.45-.71l1.21.34c-.13.41-.34.77-.64 1.09-.3.31-.67.55-1.12.72-.44.17-.94.26-1.5.26z"/>
                <path d="M169.54 252.65l-1.13.32c-.07-.19-.17-.37-.31-.55-.14-.18-.32-.33-.56-.45-.23-.12-.53-.18-.9-.18-.5 0-.92.12-1.25.35-.33.23-.5.52-.5.87 0 .31.11.56.34.74.23.18.58.33 1.06.45l1.21.3c.73.18 1.28.45 1.64.82.36.36.54.83.54 1.4 0 .47-.14.89-.41 1.26-.27.37-.64.66-1.12.87-.48.21-1.04.32-1.67.32-.83 0-1.52-.18-2.07-.54-.55-.36-.89-.89-1.04-1.59l1.19-.3c.11.44.33.77.65.99.32.22.74.33 1.25.33.59 0 1.05-.12 1.4-.37.35-.25.52-.55.52-.9 0-.28-.1-.52-.3-.71-.2-.2-.5-.35-.92-.44l-1.36-.32c-.75-.18-1.29-.44-1.61-.78-.32-.34-.48-.79-.48-1.35 0-.46.13-.87.39-1.23.26-.36.62-.64 1.07-.84.45-.2 0.97-.3 1.55-.3.81 0 1.44.18 1.9.53.46.36.79.83.99 1.41z"/>
                <path d="M176.74 255.66v-4.84h1.26v8.18h-1.26v-1.38h-.09c-.19.42-.49.77-.89 1.06-.4.29-.92.43-1.54.43-.51 0-.96-.11-1.36-.34-.4-.23-.71-.57-.94-1.02-.23-.46-.34-1.04-.34-1.74v-5.2h1.26v5.11c0 .6.17 1.07.5 1.43.34.35.77.53 1.29.53.31 0 .63-.08.95-.24.33-.16.6-.4.82-.73.22-.33.34-.75.34-1.26z"/>
                <path d="M180.3 259v-8.18h1.21v1.28h.09c.17-.44.45-.78.83-1.02.38-.24.84-.37 1.37-.37.54 0 .99.12 1.35.37.36.24.64.58.84 1.02h.09c.21-.42.52-.76.94-1.01.42-.25.92-.38 1.51-.38.73 0 1.33.23 1.8.69.47.45.7 1.16.7 2.12v5.48h-1.26v-5.48c0-.6-.17-1.03-.5-1.29-.33-.26-.72-.39-1.17-.39-.58 0-1.02.17-1.34.52-.32.34-.48.78-.48 1.31v5.33h-1.28v-5.6c0-.47-.15-.84-.45-1.13-.3-.29-.69-.43-1.17-.43-.33 0-.64.09-.92.26-.28.17-.51.41-.68.72-.17.31-.26.66-.26 1.06v5.11h-1.26z"/>
                <path d="M196.77 259.17c-.79 0-1.47-.17-2.04-.52-.57-.35-1.01-.84-1.32-1.47-.3-.63-.46-1.37-.46-2.21 0-.84.15-1.58.46-2.22.31-.64.74-1.14 1.29-1.5.55-.36 1.2-.54 1.94-.54.43 0 .85.07 1.26.21.41.14.79.37 1.13.69.34.32.61.74.81 1.26.2.52.3 1.16.3 1.93v.53h-6.31v-1.09h5.03c0-.46-.09-.87-.28-1.23-.18-.36-.44-.65-.78-.86-.33-.21-.73-.31-1.18-.31-.5 0-.93.12-1.3.37-.36.25-.64.57-.84.96-.19.39-.29.81-.29 1.27v.73c0 .62.11 1.14.32 1.57.22.43.52.75.9.98.38.22.83.33 1.34.33.33 0 .63-.05.9-.14.27-.1.5-.24.7-.43.19-.19.34-.43.45-.71l1.21.34c-.13.41-.34.77-.64 1.09-.3.31-.67.55-1.12.72-.44.17-.94.26-1.5.26z"/>
              </g>
            </svg>
          )}

          {/* ONLY show log in prompt when UNAUTHENTICATED */}
          {status === "require_auth" && !isAuthenticated && (
            <p className="mt-2 text-amber-400 text-xs font-semibold animate-pulse text-center">
              {errorMessage || "Please Log In / Sign Up to upload your resume"}
            </p>
          )}

          {status === "error" && (
            <p className="mt-2 text-red-400 text-xs font-medium text-center">
              {errorMessage || "Try again."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}