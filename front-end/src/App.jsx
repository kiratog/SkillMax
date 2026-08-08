import { useState, useEffect } from 'react';
import './App.css';
import AmberBlobBackground from './BlobBackground';
import { NavBar } from './navbar/navbar';
import ResumeUpload from './Upload/upload';
import PromptBox from './PromptBox/PromptBox';
import AuthModal from './AuthModal/AuthModal';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

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
        <ResumeUpload 
          user={user}
          onRequireAuth={() => setIsAuthOpen(true)}
        />
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
