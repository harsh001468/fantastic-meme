import React from 'react';

interface StatsDisplayProps {
    accuracy: number;
    score: number;
    tokensEarned: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ accuracy, score, tokensEarned }) => {
    return (
        <div className="stats-display">
            <h2>Player Stats</h2>
            <p>Accuracy: {accuracy.toFixed(2)}%</p>
            <p>Score: {score}</p>
            <p>Tokens Earned: {tokensEarned}</p>
        </div>
    );
};

export default StatsDisplay;