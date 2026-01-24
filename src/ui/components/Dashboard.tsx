import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const handleOpen = () => setVisible(true);
        const handleClose = () => setVisible(false);
        window.addEventListener('open-dashboard', handleOpen);
        window.addEventListener('close-dashboard', handleClose);
        return () => {
            window.removeEventListener('open-dashboard', handleOpen);
            window.removeEventListener('close-dashboard', handleClose);
        };
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#0f0c29', color: 'white', zIndex: 2000,
            backgroundImage: 'linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)',
            fontFamily: 'Inter, Arial, sans-serif', padding: '40px', boxSizing: 'border-box',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', background: 'linear-gradient(to right, #fff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HUNTERLESS x GMONADS</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#888' }}>Real-time Monad Network Metrics</p>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: '#fff',
                        padding: '10px 20px', cursor: 'pointer', borderRadius: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    ✕ Close
                </button>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '0px' }}>
                {['overview', 'validators', 'staking'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'transparent', border: 'none',
                            color: activeTab === tab ? '#00ff88' : '#888',
                            fontSize: '18px', cursor: 'pointer', textTransform: 'capitalize',
                            borderBottom: activeTab === tab ? '3px solid #00ff88' : '3px solid transparent',
                            padding: '10px 5px', fontWeight: activeTab === tab ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Network Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <Card label="Block Time" value="395ms" color="#00d4ff" icon="⚡" />
                        <Card label="Current TPS" value="8,450" color="#9b59b6" icon="🚀" />
                        <Card label="Total Staked" value="15.2B MON" color="#2ecc71" icon="💎" />
                        <Card label="Gas Price" value="15 gwei" color="#f1c40f" icon="⛽" />
                    </div>

                    <h3 style={{ color: '#888', marginBottom: '15px' }}>LIVE ACTIVITY</h3>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00ff88', fontFamily: 'monospace' }}>
                        <span style={{ color: '#ff5555' }}>● LIVE</span> Block #14205331 Finalized • Validator #42 Proposed Block • 152 Tx Processed
                    </div>
                </div>
            )}

            {activeTab === 'validators' && (
                <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Active Validators (171 Total)</h2>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '15px', color: '#888', background: 'rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: 'bold' }}>
                            <span>NAME</span><span>STAKED</span><span>UPTIME</span>
                        </div>
                        <ValidatorRow name="Monad Val 01" staked="1.2M MON" uptime="99.9%" />
                        <ValidatorRow name="Hunterless Node" staked="950k MON" uptime="99.8%" />
                        <ValidatorRow name="GMonad Prime" staked="800k MON" uptime="100%" />
                        <ValidatorRow name="DeFi Llama" staked="600k MON" uptime="99.5%" />
                        <ValidatorRow name="Community Node" staked="450k MON" uptime="98.0%" />
                    </div>
                </div>
            )}

            {activeTab === 'staking' && (
                <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Liquid Staking (12.97% APY)</h2>
                    <div style={{ background: '#1a1a2e', padding: '40px', borderRadius: '16px', maxWidth: '600px', border: '1px solid #333' }}>
                        <p style={{ color: '#aaa', marginBottom: '30px', lineHeight: '1.6' }}>
                            Stake data: <strong>15,240,120,500 MON</strong> staked across 171 validators.<br />
                            Next epoch in: <strong>4h 12m</strong>.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input type="text" placeholder="0.00" style={{
                                    width: '100%', padding: '15px', background: '#0f0c29', border: '1px solid #444',
                                    color: '#fff', borderRadius: '8px', fontSize: '18px', outline: 'none'
                                }} />
                                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>MON</span>
                            </div>
                            <button style={{
                                background: 'linear-gradient(to right, #8e44ad, #9b59b6)', border: 'none', color: '#fff',
                                padding: '16px 40px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '16px',
                                boxShadow: '0 4px 15px rgba(155, 89, 182, 0.4)'
                            }}>STAKE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Card: React.FC<any> = ({ label, value, color, icon }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ color: '#888' }}>{label}</span>
            <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color, letterSpacing: '-1px' }}>{value}</div>
    </div>
);

const ValidatorRow: React.FC<any> = ({ name, staked, uptime }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '20px 15px', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333' }}></div>
            <span style={{ color: 'white', fontWeight: '500' }}>{name}</span>
        </div>
        <span style={{ color: '#00d4ff', display: 'flex', alignItems: 'center' }}>{staked}</span>
        <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center' }}>{uptime}</span>
    </div>
);

export default Dashboard;
