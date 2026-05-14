import React, { useState } from 'react';
import styles from './RadioAuth.module.css';

export default function RadioAuth({ onJoinSession, error }) {
  const [role, setRole] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!role || !sessionId || !displayName) {
      alert('Please fill all fields');
      return;
    }
    onJoinSession(role, sessionId, displayName);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1>🎙️ Radio Communication System</h1>
        <p className={styles.subtitle}>Two-Way ATC ↔ Pilot Communication</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.roleSelection}>
          <div 
            className={`${styles.roleCard} ${role === 'atc' ? styles.selected : ''}`}
            onClick={() => { setRole('atc'); setShowForm(true); }}
          >
            <div className={styles.roleIcon}>🛂</div>
            <h3>Air Traffic Control</h3>
            <p>Manage traffic, issue clearances, monitor aircraft</p>
          </div>

          <div 
            className={`${styles.roleCard} ${role === 'pilot' ? styles.selected : ''}`}
            onClick={() => { setRole('pilot'); setShowForm(true); }}
          >
            <div className={styles.roleIcon}>✈️</div>
            <h3>Pilot</h3>
            <p>Monitor ATC transmissions, request clearances, readback</p>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleJoin} className={styles.joinForm}>
            <div className={styles.formGroup}>
              <label>Display Name / Callsign</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === 'atc' ? 'e.g., Delhi Departure' : 'e.g., IndiGo 6E-101'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Session ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="e.g., session-001"
              />
            </div>

            <div className={styles.roleBadge}>
              Selected: <strong>{role.toUpperCase()}</strong>
            </div>

            <button type="submit" className={styles.joinBtn}>
              Join Session as {role.toUpperCase()}
            </button>

            <button 
              type="button" 
              onClick={() => { setShowForm(false); setRole(''); }}
              className={styles.backBtn}
            >
              Back
            </button>
          </form>
        )}

        <div className={styles.info}>
          <h4>ℹ️ How to Use:</h4>
          <ul>
            <li><strong>ATC:</strong> Click microphone to speak clearances, monitor readbacks</li>
            <li><strong>Pilot:</strong> Listen to ATC transmissions, click to readback</li>
            <li>Real-time audio streaming between both stations</li>
            <li>Same session ID required to connect in a channel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
