import React, { useState, useEffect } from 'react';

const DeadlineLoading: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [finished, setFinished] = useState(false);
    const [removed, setRemoved] = useState(false);

    useEffect(() => {
        // Animate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setFinished(true);
                    // Auto-hide after 2 seconds of "Missed" state
                    setTimeout(() => setRemoved(true), 2500);
                    return 100;
                }
                // Non-linear, stressed loading speed
                const speed = Math.random() * 2;
                return Math.min(prev + speed, 100);
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    if (removed) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#050505', color: '#ff3333', zIndex: 9999,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            fontFamily: 'Courier New, monospace', overflow: 'hidden'
        }}>
            {/* Container */}
            <div style={{ width: '80%', maxWidth: '600px', position: 'relative' }}>

                {/* Title */}
                <h1 style={{
                    textAlign: 'center', marginBottom: '40px', fontSize: '24px', letterSpacing: '4px',
                    textTransform: 'uppercase', textShadow: '0 0 10px #ff0000'
                }}>
                    {finished ? 'DEADLINE MISSED' : 'DEADLINE LOADING...'}
                </h1>

                {/* Progress Track */}
                <div style={{
                    width: '100%', height: '4px', background: '#330000', borderRadius: '2px', position: 'relative'
                }}>
                    {/* Progress Fill */}
                    <div style={{
                        width: `${progress}%`, height: '100%', background: '#ff0000',
                        boxShadow: '0 0 15px #ff0000', transition: 'width 0.05s linear',
                        position: 'relative'
                    }}>
                        {/* Programmer Character (The Tip) */}
                        <div style={{
                            position: 'absolute', right: '-15px', top: '-25px', fontSize: '24px',
                            filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.5))',
                            transform: `scaleX(-1) translateX(${Math.sin(progress) * 2}px)` // Frantic shake
                        }}>
                            👨‍💻
                        </div>

                        {/* Shadow Monster */}
                        <div style={{
                            position: 'absolute', right: '20px', top: '-30px', fontSize: '30px',
                            opacity: progress / 100, transition: 'opacity 0.2s', filter: 'grayscale(100%) brightness(0) drop-shadow(0 0 5px #ff0000)'
                        }}>
                            👹
                        </div>
                    </div>
                </div>

                {/* Status Text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#888' }}>
                    <span>TASK: URGENT_DEPLOY</span>
                    <span>{Math.floor(progress)}%</span>
                </div>

                {finished && (
                    <div style={{
                        position: 'absolute', top: '100px', width: '100%', textAlign: 'center',
                        color: '#ff0000', fontSize: '14px', animation: 'blink 0.5s infinite alternate'
                    }}>
                        SYSTEM FAILURE: TIME EXCEEDED
                    </div>
                )}
            </div>

            <style>{`
        @keyframes blink { from { opacity: 1; } to { opacity: 0.3; } }
      `}</style>
        </div>
    );
};

export default DeadlineLoading;
