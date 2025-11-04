
"use client";
import { useEffect } from 'react';

export default function O2Trainer() {
  useEffect(() => {
    // --- Core Variables ---
    const pbInput = document.getElementById('pb-input') as HTMLInputElement;
    const generateBtn = document.getElementById('generate-btn');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');

    const inputSection = document.getElementById('input-section');
    const timerSection = document.getElementById('timer-section');
    const tableContainer = document.getElementById('table-container');
    const o2TableBody = document.getElementById('o2-table');
    const completionMessage = document.getElementById('completion-message');

    const roundDisplay = document.getElementById('round-display');
    const holdTargetDisplay = document.getElementById('hold-target-display');
    const statusText = document.getElementById('status-text');
    const timerValue = document.getElementById('timer-value');

    let sessionRunning = false;
    let currentRound = 0;
    let currentPhase = 'PREP'; // 'PREP', 'HOLD', 'RECOVERY'
    let timerInterval: NodeJS.Timeout;
    let tableData: any[] = [];

    const FIXED_PREP_TIME = 120;
    const HOLD_INCREMENT = 10;
    const ROUNDS = 8;

    function playTone(freq = 440, duration = 0.5) {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, context.currentTime);
            gainNode.gain.setValueAtTime(0.5, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration);

            oscillator.start();
            oscillator.stop(context.currentTime + duration);
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    }

    function formatTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function generateTable() {
        const pbSeconds = parseInt(pbInput.value, 10);

        if (isNaN(pbSeconds) || pbSeconds < 60) {
            alertUser("Please enter a comfortable Personal Best time of at least 60 seconds.");
            return;
        }

        const startHoldTime = Math.max(30, Math.round(pbSeconds * 0.5));
        tableData = [];

        for (let i = 0; i < ROUNDS; i++) {
            const increasingHoldTime = startHoldTime + (i * HOLD_INCREMENT);
            tableData.push({
                prep: FIXED_PREP_TIME,
                hold: increasingHoldTime,
                status: 'PENDING'
            });
        }

        renderTable(tableData);

        if(holdTargetDisplay) holdTargetDisplay.textContent = `Hold (Starts): ${formatTime(startHoldTime)}`;
        if(timerSection) timerSection.classList.remove('hidden');
        if(completionMessage) completionMessage.classList.add('hidden');
        if(timerValue) timerValue.textContent = formatTime(tableData[0].prep);
        if(statusText) statusText.textContent = "READY TO START";
    }

    function renderTable(data: any[]) {
        if (!o2TableBody) return;
        o2TableBody.innerHTML = '';
        data.forEach((round, index) => {
            const row = document.createElement('tr');
            row.id = `round-${index + 1}`;
            row.className = `border-b transition-colors ${round.status === 'COMPLETED' ? 'bg-green-900/30 text-gray-500' : 'hover:bg-[#27375a] text-white'}`;
            
            let statusClass = '';
            if (index === currentRound - 1 && sessionRunning) {
                statusClass = currentPhase === 'PREP' ? 'bg-green-600/30 font-bold' : (currentPhase === 'HOLD' ? 'bg-red-600/30 font-bold' : '');
            }

            row.innerHTML = `
                <th scope="row" class="px-3 py-2 sm:px-6 sm:py-3 rounded-l-lg ${statusClass}">
                    ${index + 1}
                </th>
                <td class="px-3 py-2 sm:px-6 sm:py-3 ${statusClass}">
                    ${formatTime(round.prep)}
                </td>
                <td class="px-3 py-2 sm:px-6 sm:py-3 rounded-r-lg ${statusClass}">
                    ${formatTime(round.hold)}
                </td>
            `;
            o2TableBody.appendChild(row);
        });
    }
    
    function alertUser(message: string) {
        if(!statusText) return;
        statusText.textContent = message;
        statusText.classList.remove('status-hold', 'status-prep');
        statusText.classList.add('text-yellow-400');
        setTimeout(() => {
            if(statusText) {
                statusText.textContent = "READY";
                statusText.classList.remove('text-yellow-400');
            }
        }, 5000);
    }

    function startSession() {
        if (tableData.length === 0) {
            alertUser("Please generate the training table first.");
            return;
        }

        sessionRunning = true;
        currentRound = 1;
        currentPhase = 'PREP';

        if(startBtn) startBtn.classList.add('hidden');
        if(stopBtn) stopBtn.classList.remove('hidden');
        if(inputSection) inputSection.classList.add('hidden');
        if(tableContainer) tableContainer.classList.remove('hidden');
        if(completionMessage) completionMessage.classList.add('hidden');

        runRound();
    }

    function stopSession() {
        clearInterval(timerInterval);
        sessionRunning = false;
        currentRound = 0;
        currentPhase = 'PREP';
        tableData = [];
        
        if(startBtn) startBtn.classList.remove('hidden');
        if(stopBtn) stopBtn.classList.add('hidden');
        if(timerSection) timerSection.classList.add('hidden');
        if(tableContainer) tableContainer.classList.add('hidden');
        if(inputSection) inputSection.classList.remove('hidden');
        
        if(timerValue) timerValue.textContent = '00:00';
        if(statusText) statusText.textContent = 'SESSION ENDED';
    }

    function runRound() {
        if (!sessionRunning) return;

        if (currentRound > tableData.length) {
            clearInterval(timerInterval);
            sessionRunning = false;
            if(timerSection) timerSection.classList.add('hidden');
            if(tableContainer) tableContainer.classList.add('hidden');
            if(completionMessage) completionMessage.classList.remove('hidden');
            if(inputSection) inputSection.classList.remove('hidden');
            return;
        }

        const round = tableData[currentRound - 1];
        if(roundDisplay) roundDisplay.textContent = `Round ${currentRound} / ${tableData.length}`;

        let duration, nextPhase;
        let currentStatusClass, statusTextContent;
        let toneFrequency;
        let countdownStart = 3;

        if (currentPhase === 'PREP') {
            duration = round.prep;
            nextPhase = 'HOLD';
            statusTextContent = 'RECOVERY (Breathe Slowly, 2:00)';
            currentStatusClass = 'status-prep';
            toneFrequency = 500;
        } else if (currentPhase === 'HOLD') {
            duration = round.hold;
            nextPhase = 'RECOVERY';
            statusTextContent = 'HOLD (Low Oxygen Tolerance)';
            currentStatusClass = 'status-hold';
            toneFrequency = 700;
        } else if (currentPhase === 'RECOVERY') {
            currentRound++;
            currentPhase = 'PREP';
            
            if (currentRound > 1) {
                tableData[currentRound - 2].status = 'COMPLETED';
            }
            
            runRound();
            return;
        }
        
        if(timerValue){
            timerValue.classList.remove('status-prep', 'status-hold', 'text-white');
            timerValue.classList.add(currentStatusClass);
        }

        if(statusText){
            statusText.textContent = statusTextContent;
            statusText.classList.remove('status-prep', 'status-hold', 'text-white');
            statusText.classList.add(currentStatusClass);
        }
        
        playTone(toneFrequency, 0.5);

        let timeLeft = duration;
        if(timerValue) timerValue.textContent = formatTime(timeLeft);
        
        renderTable(tableData);

        clearInterval(timerInterval);
        
        let countdownActive = false;
        
        timerInterval = setInterval(() => {
            timeLeft--;

            if (timeLeft <= countdownStart && timeLeft > 0 && !countdownActive) {
                countdownActive = true;
            }
            
            if (timeLeft >= 0) {
                if(timerValue) timerValue.textContent = formatTime(timeLeft);
                
                if (countdownActive) {
                    if(timerValue) timerValue.classList.toggle('bg-yellow-500/50');
                    playTone(timeLeft % 2 === 0 ? 800 : 900, 0.1);
                }
            }

            if (timeLeft < 0) {
                clearInterval(timerInterval);
                countdownActive = false;

                if (currentPhase === 'HOLD') {
                    tableData[currentRound - 1].status = 'COMPLETED';
                }
                
                currentPhase = nextPhase;
                runRound();
            }
        }, 1000);
    }

    generateBtn?.addEventListener('click', generateTable);
    startBtn?.addEventListener('click', startSession);
    stopBtn?.addEventListener('click', stopSession);

    generateTable();
    
    return () => {
      clearInterval(timerInterval);
      generateBtn?.removeEventListener('click', generateTable);
      startBtn?.removeEventListener('click', startSession);
      stopBtn?.removeEventListener('click', stopSession);
    }

  }, []);

  return (
    <>
      <style>{`
        /* Custom styles for a cleaner look - kept consistent with CO2 table */
        body {
          font-family: 'Inter', sans-serif;
          background-color: #1a1a2e; /* Deep purple background */
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container-card {
          background-color: #16213e; /* Slightly lighter card color */
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          max-width: 600px;
        }
        .timer-display {
          font-size: 4rem;
          font-weight: 700;
          line-height: 1;
          margin: 0.5rem 0;
          transition: color 0.3s;
        }
        .status-prep {
          color: #4ade80; /* Green for Prep */
        }
        .status-hold {
          color: #f87171; /* Red for Hold */
        }
        .btn-primary {
          background-color: #e94560; /* Pinkish-red accent */
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #b82643;
        }
      `}</style>
      <div className="p-4 flex items-center justify-center min-h-screen w-full">
        <div id="app" className="container-card w-full p-6 sm:p-8 rounded-xl space-y-6">
            <h1 className="text-3xl font-bold text-center text-white">O₂ Tolerance Table</h1>

            <div className="bg-red-800/50 border border-red-500 rounded-lg p-4 text-sm text-red-300 space-y-2">
                <h2 className="font-bold text-base text-red-100">🛑 EXTREME HYPOXIA WARNING:</h2>
                <ul className="list-disc list-inside space-y-1">
                    <li>**THIS IS DANGEROUS.** You must be trained and experienced with breath-hold to use this.</li>
                    <li>**NEVER** practice this alone. **ALWAYS** have a dedicated, experienced spotter present.</li>
                    <li>Stop the session immediately if you experience dizziness, uncontrollable diaphragm spasms, or intense discomfort.</li>
                    <li>**DO NOT** hyperventilate (over-breathe) before the holds. Breathe normally for the 2:00 prep period.</li>
                </ul>
            </div>

            <div id="input-section" className="space-y-4">
                <p className="text-sm text-gray-300">Enter your maximum *comfortable* breath-hold time (PB) in seconds. The table will start hold times at about 50% of your PB and increase by 10 seconds each set.</p>
                <div className="flex items-center space-x-3">
                    <input
                        type="number"
                        id="pb-input"
                        placeholder="e.g., 90 (seconds)"
                        className="w-full p-3 rounded-lg bg-[#27375a] text-white border border-[#3b5998] focus:border-[#e94560] focus:ring focus:ring-[#e94560]/50"
                        min="60"
                        max="600"
                        defaultValue="90"
                    />
                    <button
                        id="generate-btn"
                        className="btn-primary px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
                    >
                        Generate Table
                    </button>
                </div>
            </div>

            <div id="timer-section" className="hidden text-center space-y-4">
                <div className="flex justify-center items-center space-x-2 text-xl font-medium text-gray-400">
                    <span id="round-display">Round 1 / 8</span>
                    <span className="text-gray-600">•</span>
                    <span id="hold-target-display">Hold: 00:00</span>
                </div>

                <div id="status-text" className="text-2xl font-semibold text-white">READY</div>
                <div id="timer-value" className="timer-display text-white">00:00</div>

                <button
                    id="start-btn"
                    className="btn-primary w-full py-3 rounded-lg font-semibold text-lg"
                >
                    START SESSION
                </button>
                <button
                    id="stop-btn"
                    className="bg-gray-700 hover:bg-gray-600 text-white w-full py-3 rounded-lg font-semibold text-lg"
                >
                    STOP SESSION
                </button>
            </div>

            <div id="table-container" className="mt-6 hidden">
                <h3 className="text-xl font-semibold mb-3 text-center text-[#e94560]">Training Protocol</h3>
                <table className="w-full text-sm text-left rounded-lg overflow-hidden">
                    <thead className="text-xs uppercase bg-[#27375a] text-gray-300">
                        <tr>
                            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">Set</th>
                            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">Prep (Constant 2:00)</th>
                            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">Hold (Increasing)</th>
                        </tr>
                    </thead>
                    <tbody id="o2-table" className="divide-y divide-[#27375a]">
                    </tbody>
                </table>
            </div>

            <div id="completion-message" className="hidden text-center p-6 rounded-lg bg-green-900/50 text-green-300">
                <p className="text-xl font-bold mb-2">Session Complete!</p>
                <p>Congratulations! Remember to recover fully and wait at least 24 hours before your next session.</p>
            </div>
        </div>
      </div>
    </>
  );
}
