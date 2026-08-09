import { useState, useEffect } from 'react';
import './App.css';
import AmberBlobBackground from './BlobBackground';
import { NavBar } from './Navbar/navbar';
import ResumeUpload from './Upload/upload';
import ChatView from './ChatView/ChatView';
import ProfileView from './ProfileView/ProfileView';
import PromptBox from './PromptBox/PromptBox';
import AuthModal from './AuthModal/AuthModal';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Views: 'upload' | 'chat' | 'profile'
  const [activeView, setActiveView] = useState('upload');
  
  // Resume & Analysis State
  const [extractedResume, setExtractedResume] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  // Conversational Chat Messages Feed - Starts clean
  const [messages, setMessages] = useState([]);

  // Load User & Restore Persisted Resume & Analysis from MongoDB on Mount / Refresh
// Load User & Restore Persisted Resume & Analysis from MongoDB on Mount / Refresh
useEffect(() => {
  const storedUser = localStorage.getItem('skillmax_user');
  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Failed to parse user session:', err);
    }
  }

  const API_URL = import.meta.env.VITE_API_URL;

  // Loud, unmissable sanity check — always log this on every load
  console.log('%c[SkillMax] API_URL:', 'color: orange; font-weight: bold', API_URL);

  if (!API_URL) {
    console.error('[SkillMax] VITE_API_URL is undefined! Check your .env file and restart the dev server.');
    return;
  }

  const restoreSavedData = async () => {
    const token = localStorage.getItem('skillmax_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout, no more infinite hangs

    try {
      const res = await fetch(`${API_URL}/api/ai/latest-analysis`, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error(
          `[SkillMax] Expected JSON but got "${contentType}". Status: ${res.status}. Body starts with: ${text.slice(0, 100)}`
        );
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error(`[SkillMax] latest-analysis returned ${res.status}:`, data);
        return;
      }

      if (data.success && data.extractedText) {
        const resumeData = {
          filename: data.filename || 'Uploaded_Resume.pdf',
          pages: data.pages || 1,
          textLength: data.textLength || data.extractedText.length,
          extractedText: data.extractedText,
        };
        setExtractedResume(resumeData);

        if (data.targetRole) {
          setAnalysisResult(data);
          setCompletedTasks(data.completedTasks || {});
          setMessages([
            {
              sender: 'bot',
              text: `Loaded your saved resume "${resumeData.filename}" (${resumeData.textLength} characters).`,
              type: 'resume_extracted',
              data: resumeData,
            },
            {
              sender: 'bot',
              text: `Restored your Placement Readiness Report for ${data.targetRole}:`,
              type: 'analysis_result',
              data,
            },
          ]);
          setActiveView('chat');
        } else {
          setMessages([
            {
              sender: 'bot',
              text: `Loaded your saved resume "${resumeData.filename}". Which job role are you targeting for placement?`,
              type: 'resume_extracted',
              data: resumeData,
            },
          ]);
          setActiveView('chat');
        }
      } else {
        console.log('[SkillMax] No stored analysis yet — showing upload screen.', data.message || '');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('[SkillMax] Request to backend timed out after 8s. Is the server actually running/reachable?');
      } else {
        console.error('[SkillMax] Could not restore latest analysis:', err.message);
      }
    }
  };

  restoreSavedData();
}, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  // Called when resume PDF is uploaded
  const handleResumeAnalyzed = (resumeData) => {
    setExtractedResume(resumeData);
    setActiveView('chat');

    // Add conversational bot response to chat feed
    setMessages((prev) => [
      ...prev,
      {
        sender: 'bot',
        text: `Awesome! I've analyzed your resume "${resumeData.filename}" (${resumeData.textLength} characters extracted).`,
        type: 'resume_extracted',
        data: resumeData,
      },
    ]);
  };

  // Trigger AI skill analysis with Smart Job Role Validation
const handleSelectRole = async (targetRole, addUserMessage = true) => {
  const resumeToUse = extractedResume || {
    extractedText: "Computer Science student proficient in JavaScript, React, HTML, CSS, Node.js, Git, SQL.",
    filename: "Candidate_Resume.pdf"
  };

  if (addUserMessage) {
    setMessages(prev => [...prev, { sender: 'user', text: targetRole }]);
  }

  setMessages(prev => [...prev, { sender: 'bot', text: `⚡ Analyzing your resume for ${targetRole}...` }]);

  const token = localStorage.getItem('skillmax_token');

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/analyze-resume`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ extractedText: resumeToUse.extractedText, targetRole }),
    });

    const data = await res.json();

    // Remove thinking message
    setMessages(prev => { const u = [...prev]; u.pop(); return u; });

    if (!res.ok || data.isInvalidRole) {
      setMessages(prev => [...prev, { sender: 'bot', text: data.message || `Please enter a valid job role like Frontend Engineer or Data Analyst.` }]);
      return;
    }

    setAnalysisResult(data);
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: `Here is your Placement Readiness Report for ${data.targetRole}:`,
      type: 'analysis_result',
      data,
    }]);
  } catch (err) {
    setMessages(prev => { const u = [...prev]; u.pop(); return u; });
    setMessages(prev => [...prev, { sender: 'bot', text: `⚠️ Something went wrong: ${err.message}` }]);
  }
};

  // Handle prompt box text send
const handlePromptSend = async (text) => {
  if (!text.trim()) return;
  if (activeView === 'upload') setActiveView('chat');

  setMessages(prev => [...prev, { sender: 'user', text }]);
  setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);

  try {
    const token = localStorage.getItem('skillmax_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: text,
        context: {
          hasResume: !!extractedResume,
          targetRole: analysisResult?.targetRole || null,
          matchScore: analysisResult?.matchScore || null,
        }
      })
    });

    const data = await res.json();

    // Remove thinking
    setMessages(prev => { const u = [...prev]; u.pop(); return u; });

    if (data.type === 'analyze') {
      await handleSelectRole(data.targetRole, false); // user msg already added
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text: data.text }]);
    }
  } catch (err) {
    setMessages(prev => { const u = [...prev]; u.pop(); return u; });
    setMessages(prev => [...prev, { sender: 'bot', text: `Something went wrong: ${err.message}` }]);
  }
};

  const handleToggleTask = async (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));

    // Persist task toggle to MongoDB
    try {
      const token = localStorage.getItem('skillmax_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${import.meta.env.VITE_API_URL}/api/ai/toggle-task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          analysisId: analysisResult?.analysisId,
          taskId,
        }),
      });
    } catch (err) {
      console.warn('Could not persist task toggle:', err);
    }
  };

  const handleToggleProfileView = () => {
    if (activeView === 'profile') {
      setActiveView(extractedResume ? 'chat' : 'upload');
    } else {
      setActiveView('profile');
    }
  };

  return (
    <AmberBlobBackground speed={2} distortion={0.48}>
      {/* Top Navbar */}
      <NavBar 
        user={user}
        setUser={setUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        activeView={activeView}
        onToggleProfileView={handleToggleProfileView}
        onGoHome={() => setActiveView(extractedResume ? 'chat' : 'upload')}
      />
      
      {/* Central Conversational View Content */}
      <main className="flex-1 w-full flex items-center justify-center pt-20 pb-28">
        {activeView === 'profile' ? (
          <ProfileView 
            user={user}
            extractedResume={extractedResume}
            analysisResult={analysisResult}
            completedTasks={completedTasks}
            onToggleTask={handleToggleTask}
            onReturnToChat={() => setActiveView(extractedResume ? 'chat' : 'upload')}
          />
        ) : activeView === 'chat' ? (
          <ChatView 
            messages={messages}
            onSelectRole={handleSelectRole}
            onToggleTask={handleToggleTask}
            completedTasks={completedTasks}
          />
        ) : (
          <ResumeUpload 
            user={user}
            onRequireAuth={() => setIsAuthOpen(true)}
            onAnalyzed={handleResumeAnalyzed}
          />
        )}
      </main>

      {/* Bottom Conversational Prompt Box (Only shown in Chat & Upload views) */}
      {activeView !== 'profile' && (
        <PromptBox 
          onSend={handlePromptSend} 
          onFileUpload={(file) => {
            console.log('File attached via prompt box:', file);
          }} 
        />
      )}

      {/* Auth Modal for optional login */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </AmberBlobBackground>
  );
}

export default App;
