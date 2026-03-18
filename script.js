/* --- CONFIGURATION & STATE --- */
let examQuestions = { physics: [], biology: [] };
let currentSubject = 'physics';
let currentIdx = { physics: 0, biology: 0 }; 
let userAnswers = { physics: {}, biology: {} };
let timeLeft = 5400; // 90 Minutes
let securityWarnings = 0;
let finalReport = ""; 
let timerInterval;

/* --- 1. SECURITY SYSTEM --- */
window.onblur = function() {
    securityWarnings++;
    if(securityWarnings >= 3) {
        alert("SECURITY BREACH: Multiple tab switches detected. Auto-submitting...");
        finishExam();
    } else {
        alert(`SECURITY WARNING: You left the exam screen! (${securityWarnings}/3 Warnings)`);
    }
};

/* --- 2. EXAM INITIALIZATION --- */
function startExam() {
    const name = document.getElementById('student-name').value;
    if(!name) return alert("Full Name Required!");

    // Initialize: Pick 50 random questions for each subject from masterBank
    // Ensure your questions.js defines 'masterBank' with 'physics' and 'biology' keys
    for(let sub in examQuestions) {
        if(masterBank[sub]) {
            let shuffled = [...masterBank[sub]].sort(() => 0.5 - Math.random());
            examQuestions[sub] = shuffled.slice(0, 50);
        }
    }

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');
    document.getElementById('exam-controls').classList.remove('hidden');

    startTimer();
    renderQuestion();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft/60), s = timeLeft % 60;
        const box = document.getElementById('timer-box');
        box.innerText = `${m}:${s<10?'0':''}${s}`;
        
        if(timeLeft < 300) box.classList.add('low-time');
        if(timeLeft <= 0) { 
            clearInterval(timerInterval); 
            finishExam(); 
        }
    }, 1000);
}

/* --- 3. CORE NAVIGATION --- */
function switchSubject(sub) {
    currentSubject = sub;
    
    // Update UI Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${sub}`).classList.add('active');
    
    document.getElementById('subject-tag').innerText = sub.toUpperCase();
    renderQuestion();
}

function renderQuestion() {
    const sub = currentSubject;
    const idx = currentIdx[sub];
    const q = examQuestions[sub][idx];

    // Update Meta Data
    document.getElementById('q-number').innerText = `Question ${idx + 1} of ${examQuestions[sub].length}`;
    document.getElementById('q-text').innerText = q.q;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = "";
    
    // Render Options
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        // Apply 'selected' class if answer exists in memory
        btn.className = 'option-card' + (userAnswers[sub][idx] === opt ? ' selected' : '');
        btn.onclick = () => { 
            userAnswers[sub][idx] = opt; 
            renderQuestion(); 
        };
        grid.appendChild(btn);
    });

    // Handle Button Visibility
    document.getElementById('prev-btn').style.visibility = (idx === 0) ? "hidden" : "visible";
    
    const isLastOfCurrent = idx === examQuestions[sub].length - 1;
    document.getElementById('next-btn').classList.toggle('hidden', isLastOfCurrent);
    
    // Show submit button only on the last question of Biology
    const isEndResult = (sub === 'biology' && isLastOfCurrent);
    document.getElementById('submit-btn').classList.toggle('hidden', !isEndResult);
}

function navigate(dir) {
    const sub = currentSubject;
    const targetIdx = currentIdx[sub] + dir;
    
    if (targetIdx >= 0 && targetIdx < examQuestions[sub].length) {
        currentIdx[sub] = targetIdx;
        renderQuestion();
    }
}

/* --- 4. SCORING & RESULTS --- */
function finishExam() {
    clearInterval(timerInterval);
    let pScore = 0, bScore = 0;
    
    // 1. Calculate Individual Scores
    examQuestions.physics.forEach((q, i) => { 
        if(userAnswers.physics[i] === q.a) pScore++; 
    });
    examQuestions.biology.forEach((q, i) => { 
        if(userAnswers.biology[i] === q.a) bScore++; 
    });

    const total = pScore + bScore;
    const max = examQuestions.physics.length + examQuestions.biology.length;
    const name = document.getElementById('student-name').value;

    // 2. Update the Result Modal UI
    document.getElementById('res-candidate-name').innerText = name;
    document.getElementById('res-physics').innerText = `${pScore}/${examQuestions.physics.length}`;
    document.getElementById('res-biology').innerText = `${bScore}/${examQuestions.biology.length}`;
    document.getElementById('res-total').innerText = `${total}/${max}`;
    document.getElementById('res-percent').innerText = ((total/max)*100).toFixed(1) + "%";

    // 3. Display the Modal
    document.getElementById('result-modal').classList.remove('hidden');

    // 4. Build WhatsApp Message String
    finalReport = `*IBEJU SENIOR HIGH SCHOOL RESULT*%0A` +
                  `------------------------------------%0A` +
                  `*Candidate:* ${name}%0A%0A` +
                  `*SUBJECT BREAKDOWN*%0A` +
                  `*Physics:* ${pScore}/${examQuestions.physics.length}%0A` +
                  `*Biology:* ${bScore}/${examQuestions.biology.length}%0A%0A` +
                  `*TOTAL SCORE:* ${total}/${max} (${((total/max)*100).toFixed(1)}%)%0A` +
                  `*Security Violations:* ${securityWarnings}%0A` +
                  `------------------------------------`;
}

/* --- 5. EXTERNAL SUBMISSION --- */
function sendToWhatsApp() {
    const phone = "2347082828150";
    window.location.href = `https://wa.me/${phone}?text=${finalReport}`;
}