import React, { useState, useEffect } from 'react';
import MainScreen from './components/MainScreen';
import LockScreen from './components/LockScreen';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      // Listen for navigation events from main process
      window.electronAPI.onUpdateDisplay((message) => {
        // Check if we should navigate to main screen
        if (message === 'NAVIGATE_TO_MAIN') {
          setIsUnlocked(true);
        } else if (message === 'LOCK') {
          setIsUnlocked(false);
        }
      });
    }
  }, []);

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#f3f4f6',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {isUnlocked ? <MainScreen /> : <LockScreen />}
    </div>
  );
}

export default App;