import { useState, useEffect } from 'react';
import './App.css';
import AmberBlobBackground from './BlobBackground';
import { NavBar } from './navbar/navbar';
import ResumeUpload from './Upload/upload';
import RoleSelector from './RoleSelector/RoleSelector';
import SkillGapDashboard from './SkillGapDashboard/SkillGapDashboard';
import PromptBox from './PromptBox/PromptBox';
import AuthModal from './AuthModal/AuthModal';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Phase 2 Step State: "upload" | "role" | "dashboard"
  const [currentStep, setCurrentStep] = useState('upload');
  const [extractedResume, setExtractedResume] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('skillmax_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user session:', err);
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  // Called when PDF text is extracted in Upload component
  const handleResumeAnalyzed = (data) => {
    setExtractedResume(data);
    // Proceed to Step 2: Role Selector
    setCurrentStep('role');
  };

  // Called when target role is selected in RoleSelector
  const handleSelectRole = async (targetRole) => {
    if (!extractedResume || !extractedResume.extractedText) return;

    setIsAnalyzing(true);
    const token = localStorage.getItem('skillmax_token');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:5001/api/ai/analyze-resume', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          extractedText: extractedResume.extractedText,
          targetRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to analyze skill gaps');
      }

      setAnalysisResult(data);
      setCurrentStep('dashboard');
    } catch (err) {
      console.error('AI Analysis Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setExtractedResume(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
  };

  const handlePromptSend = (text) => {
    console.log('Prompt submitted:', text);
  };

  const handlePromptFileUpload = (file) => {
    console.log('File attached via prompt box:', file);
  };

  return (
    <AmberBlobBackground speed={2} distortion={0.48}>
      <NavBar 
        user={user}
        setUser={setUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      
      <main className="flex min-h-screen w-full items-center justify-center pt-16 pb-24">
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-medium text-sm">Performing AI Skill Gap Analysis...</span>
          </div>
        ) : currentStep === 'upload' ? (
          <ResumeUpload 
            user={user}
            onRequireAuth={() => setIsAuthOpen(true)}
            onAnalyzed={handleResumeAnalyzed}
          />
        ) : currentStep === 'role' ? (
          <RoleSelector 
            onSelectRole={handleSelectRole}
            onBack={() => setCurrentStep('upload')}
          />
        ) : (
          <SkillGapDashboard 
            analysisResult={analysisResult}
            onReset={handleReset}
            onChangeRole={() => setCurrentStep('role')}
          />
        )}
      </main>

      <PromptBox onSend={handlePromptSend} onFileUpload={handlePromptFileUpload} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </AmberBlobBackground>
  );
}

export default App;
