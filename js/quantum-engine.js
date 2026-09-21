    lucide.createIcons();

    /* ==========================================================
       MOBILE TAB SWITCHER LOGIC
       ========================================================== */
    function switchMobileTab(tab) {
      document.querySelectorAll('.mobile-tab-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`tab-btn-${tab}`).classList.add('active');

      const colBloch = document.getElementById('view-bloch');
      const colCircuit = document.getElementById('view-circuit');
      const colTelemetry = document.getElementById('view-telemetry');

      colBloch.classList.remove('mobile-active');
      colCircuit.classList.remove('mobile-active');
      colTelemetry.classList.remove('mobile-active');

      if (tab === 'bloch') {
        colBloch.classList.add('mobile-active');
        setTimeout(handleBlochResize, 50);
      } else if (tab === 'circuit') {
        colCircuit.classList.add('mobile-active');
      } else if (tab === 'telemetry') {
        colTelemetry.classList.add('mobile-active');
      }
    }

    /* ==========================================================
       QUANTUM AUDIO SYNTHESIZER & TRACK SEQUENCER
       ========================================================== */
    class QuantumAudioEngine {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.isPlaying = false;
        this.currentStep = 0;
        this.playbackTimer = null;
      }

      init() {
        if (this.ctx) {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
          return;
        }
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      // Single Gate Tap Chime
      playGateChime(gate, qubitIdx = 0) {
        if (!this.enabled) return;
        this.init();

        // Pentatonic register mapped across qubits
        const baseFreqs = [
          [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50], // q0: High
          [392.00, 440.00, 523.25, 587.33, 659.25, 783.99],  // q1: Mid-High
          [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],  // q2: Mid
          [130.81, 146.83, 164.81, 196.00, 220.00, 261.63]   // q3: Bass
        ];

        const gateIndexMap = { H: 0, X: 1, Y: 2, Z: 3, S: 4, T: 5, CX: 2, M: 0 };
        const f = baseFreqs[qubitIdx][gateIndexMap[gate] || 0];

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = qubitIdx === 3 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      }

      // Entanglement Preset Chime
      playEntanglementChime() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.1, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.6);
        });
      }

      // Step-by-Step Circuit Sequencer (Polyphonic Sonification)
      playStep(stepIndex) {
        if (!this.enabled) return;
        this.init();

        for (let q = 0; q < NUM_QUBITS; q++) {
          const gate = circuitGrid[q][stepIndex];
          if (gate) {
            this.playGateChime(gate, q);
          }
        }
      }
    }

    const qAudio = new QuantumAudioEngine();

    function toggleAudio() {
      qAudio.enabled = !qAudio.enabled;
      qAudio.init();
      const btn = document.getElementById('btn-audio');
      const icon = document.getElementById('audio-icon');
      if (qAudio.enabled) {
        btn.classList.add('active');
        icon.setAttribute('data-lucide', 'volume-2');
        showToast('Sound FX: ACTIVE');
      } else {
        btn.classList.remove('active');
        icon.setAttribute('data-lucide', 'volume-x');
        showToast('Sound FX: MUTED');
      }
      lucide.createIcons();
    }

    /* ==========================================================
       PLAY QUANTUM TRACK (Full Circuit Sonification Sequencer)
       ========================================================== */
    function togglePlayMusic() {
      qAudio.init();

      const btn = document.getElementById('btn-play-music');
      const icon = document.getElementById('play-music-icon');
      const text = document.getElementById('play-music-text');
      const playhead = document.getElementById('playhead-bar');

      if (qAudio.isPlaying) {
        // Stop Playback
        qAudio.isPlaying = false;
        clearInterval(qAudio.playbackTimer);
        btn.classList.remove('playing');
        icon.setAttribute('data-lucide', 'play');
        text.textContent = 'PLAY TRACK';
        playhead.classList.remove('active');
        document.querySelectorAll('.wire-slot').forEach(s => s.classList.remove('playing-step'));
        showToast('Quantum Track Stopped');
      } else {
        // Start Playback
        qAudio.isPlaying = true;
        btn.classList.add('playing');
        icon.setAttribute('data-lucide', 'square');
        text.textContent = 'STOP TRACK';
        playhead.classList.add('active');
        qAudio.currentStep = 0;

        showToast('🎶 Playing Quantum Circuit Sonification...');
        executeSequencerStep();
        qAudio.playbackTimer = setInterval(executeSequencerStep, 340); // 340ms per step
      }
      lucide.createIcons();
    }

    function executeSequencerStep() {
      if (!qAudio.isPlaying) return;

      const step = qAudio.currentStep;
      qAudio.playStep(step);

      // Move visual playhead line
      const playhead = document.getElementById('playhead-bar');
      // Calculate position: label width is ~62px, slot width is 42px + 8px gap = 50px
      const leftOffset = 62 + step * 50;
      playhead.style.left = `${leftOffset}px`;

      // Highlight active slots
      document.querySelectorAll('.wire-slot').forEach(s => s.classList.remove('playing-step'));
      for (let q = 0; q < NUM_QUBITS; q++) {
        const slotEl = document.querySelector(`.qubit-row:nth-child(${q + 2}) .wire-slot:nth-child(${step + 2})`);
        if (slotEl) slotEl.classList.add('playing-step');
      }

      // Loop back to 0
      qAudio.currentStep = (qAudio.currentStep + 1) % NUM_STEPS;
    }

    /* ==========================================================
       3D BLOCH SPHERE (Three.js WebGL)
       ========================================================== */
    const blochContainer = document.getElementById('bloch-canvas');
    const bScene = new THREE.Scene();
    bScene.background = new THREE.Color(0x06080f);

    const bCamera = new THREE.PerspectiveCamera(45, blochContainer.clientWidth / blochContainer.clientHeight, 0.1, 100);
    bCamera.position.set(2.8, 2.2, 3.4);

    const bRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    bRenderer.setSize(blochContainer.clientWidth, blochContainer.clientHeight);
    bRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    blochContainer.appendChild(bRenderer.domElement);

    const bControls = new THREE.OrbitControls(bCamera, bRenderer.domElement);
    bControls.enableDamping = true;
    bControls.dampingFactor = 0.05;
    bControls.minDistance = 2.0;
    bControls.maxDistance = 8.0;

    const bAmbient = new THREE.AmbientLight(0xffffff, 0.8);
    bScene.add(bAmbient);
    const bLight = new THREE.PointLight(0x00f0ff, 2, 20);
    bLight.position.set(5, 5, 5);
    bScene.add(bLight);

    const sphereGeo = new THREE.SphereGeometry(1.2, 36, 36);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0a1c38,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.8
    });
    const blochSphere = new THREE.Mesh(sphereGeo, sphereMat);
    bScene.add(blochSphere);

    const wireGeo = new THREE.SphereGeometry(1.2, 18, 18);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.12 });
    bScene.add(new THREE.Mesh(wireGeo, wireMat));

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 });
    const eqRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.008, 16, 100), ringMat);
    eqRing.rotation.x = Math.PI / 2;
    bScene.add(eqRing);

    const merRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.008, 16, 100), ringMat);
    bScene.add(merRing);

    function createAxis(from, to, color) {
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      const length = from.distanceTo(to);
      const arrow = new THREE.ArrowHelper(dir, from, length, color, 0.12, 0.08);
      bScene.add(arrow);
    }

    createAxis(new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(1.6, 0, 0), 0xf43f5e);
    createAxis(new THREE.Vector3(0, -1.6, 0), new THREE.Vector3(0, 1.6, 0), 0x00f0ff);
    createAxis(new THREE.Vector3(0, 0, -1.6), new THREE.Vector3(0, 0, 1.6), 0x10b981);

    let stateVectorArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1.2,
      0xffea00,
      0.18,
      0.12
    );
    bScene.add(stateVectorArrow);

    const tipMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffea00 })
    );
    bScene.add(tipMesh);

    function updateBlochSphere(theta, phi) {
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.cos(theta);
      const z = Math.sin(theta) * Math.sin(phi);

      const dir = new THREE.Vector3(x, y, z).normalize();
      bScene.remove(stateVectorArrow);
      stateVectorArrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1.2, 0xffea00, 0.18, 0.12);
      bScene.add(stateVectorArrow);

      tipMesh.position.set(x * 1.2, y * 1.2, z * 1.2);

      document.getElementById('bloch-theta').textContent = (theta * 180 / Math.PI).toFixed(1) + '°';
      document.getElementById('bloch-phi').textContent = (phi * 180 / Math.PI).toFixed(1) + '°';
    }

    function handleBlochResize() {
      if (!blochContainer) return;
      const width = blochContainer.clientWidth || window.innerWidth;
      const height = blochContainer.clientHeight || 300;
      bCamera.aspect = width / height;
      bCamera.updateProjectionMatrix();
      bRenderer.setSize(width, height);
    }

    /* ==========================================================
       QUANTUM CIRCUIT & STATE VECTOR ENGINE
       ========================================================== */
    const NUM_QUBITS = 4;
    const NUM_STEPS = 8;
    let selectedTool = 'H';
    let selectedQubitIdx = 0;

    let circuitGrid = Array(NUM_QUBITS).fill(null).map(() => Array(NUM_STEPS).fill(null));

    function selectTool(gate) {
      selectedTool = gate;
      document.querySelectorAll('.gate-badge').forEach(b => {
        b.classList.toggle('selected', b.textContent === gate);
      });
    }

    function selectQubit(idx) {
      selectedQubitIdx = idx;
      document.querySelectorAll('.btn-qselect').forEach((b, i) => {
        b.classList.toggle('active', i === idx);
      });
      document.getElementById('bloch-qubit-lbl').textContent = `Bloch Sphere: |ψ${idx}⟩`;
      computeQuantumState();
    }

    class Complex {
      constructor(r = 0, i = 0) {
        this.r = r;
        this.i = i;
      }
      add(c) { return new Complex(this.r + c.r, this.i + c.i); }
      sub(c) { return new Complex(this.r - c.r, this.i - c.i); }
      mul(c) {
        return new Complex(
          this.r * c.r - this.i * c.i,
          this.r * c.i + this.i * c.r
        );
      }
      scale(s) { return new Complex(this.r * s, this.i * s); }
      mag2() { return this.r * this.r + this.i * this.i; }
      phase() { return Math.atan2(this.i, this.r); }
    }

    const SQRT1_2 = Math.SQRT1_2;
    const GATES = {
      H: [
        [new Complex(SQRT1_2, 0), new Complex(SQRT1_2, 0)],
        [new Complex(SQRT1_2, 0), new Complex(-SQRT1_2, 0)]
      ],
      X: [
        [new Complex(0, 0), new Complex(1, 0)],
        [new Complex(1, 0), new Complex(0, 0)]
      ],
      Y: [
        [new Complex(0, 0), new Complex(0, -1)],
        [new Complex(0, 1), new Complex(0, 0)]
      ],
      Z: [
        [new Complex(1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(-1, 0)]
      ],
      S: [
        [new Complex(1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 1)]
      ],
      T: [
        [new Complex(1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(SQRT1_2, SQRT1_2)]
      ]
    };

    function computeQuantumState() {
      const DIM = 16;
      let state = Array(DIM).fill(null).map((_, i) => i === 0 ? new Complex(1, 0) : new Complex(0, 0));

      for (let step = 0; step < NUM_STEPS; step++) {
        for (let q = 0; q < NUM_QUBITS; q++) {
          const gate = circuitGrid[q][step];
          if (!gate) continue;

          if (GATES[gate]) {
            const u = GATES[gate];
            const nextState = Array(DIM).fill(null).map(() => new Complex(0, 0));
            const bitMask = 1 << (NUM_QUBITS - 1 - q);

            for (let i = 0; i < DIM; i++) {
              const bit = (i & bitMask) ? 1 : 0;
              const i0 = i & ~bitMask;
              const i1 = i | bitMask;

              if (bit === 0) {
                const term0 = u[0][0].mul(state[i0]);
                const term1 = u[0][1].mul(state[i1]);
                nextState[i] = term0.add(term1);
              } else {
                const term0 = u[1][0].mul(state[i0]);
                const term1 = u[1][1].mul(state[i1]);
                nextState[i] = term0.add(term1);
              }
            }
            state = nextState;
          } else if (gate === 'CX') {
            const targetQ = (q + 1) % NUM_QUBITS;
            const ctrlMask = 1 << (NUM_QUBITS - 1 - q);
            const targetMask = 1 << (NUM_QUBITS - 1 - targetQ);

            const nextState = Array(DIM).fill(null).map(() => new Complex(0, 0));
            for (let i = 0; i < DIM; i++) {
              if (i & ctrlMask) {
                const flipped = i ^ targetMask;
                nextState[i] = state[flipped];
              } else {
                nextState[i] = state[i];
              }
            }
            state = nextState;
          }
        }
      }

      updateUIWithState(state);
    }

    function updateUIWithState(state) {
      let diracParts = [];
      state.forEach((c, idx) => {
        const p = c.mag2();
        if (p > 0.001) {
          const bitStr = idx.toString(2).padStart(NUM_QUBITS, '0');
          const amp = Math.sqrt(p).toFixed(3);
          diracParts.push(`${amp}|${bitStr}⟩`);
        }
      });
      document.getElementById('dirac-display').textContent = diracParts.length > 0 ? `|Ψ⟩ = ${diracParts.join(' + ')}` : '|Ψ⟩ = |0000⟩';

      let nonZeroCount = state.filter(c => c.mag2() > 0.05).length;
      const isEntangled = nonZeroCount > 1 && (
        (state[0].mag2() > 0.3 && state[15].mag2() > 0.3) ||
        (state[0].mag2() > 0.3 && state[3].mag2() > 0.3) ||
        (state[0].mag2() > 0.3 && state[7].mag2() > 0.3)
      );

      const entBadge = document.getElementById('entanglement-badge');
      const entText = document.getElementById('entanglement-text');
      if (isEntangled) {
        entBadge.style.background = 'rgba(168, 85, 247, 0.25)';
        entBadge.style.borderColor = 'var(--purple)';
        entBadge.style.color = '#e9d5ff';
        entText.textContent = 'MAXIMAL ENTANGLEMENT DETECTED (BELL / GHZ)';
      } else {
        entBadge.style.background = 'rgba(16, 185, 129, 0.12)';
        entBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        entBadge.style.color = 'var(--emerald)';
        entText.textContent = 'SEPARABLE QUANTUM STATE';
      }

      const barsContainer = document.getElementById('state-bars-container');
      barsContainer.innerHTML = '';
      state.forEach((c, idx) => {
        const prob = c.mag2();
        const bitStr = idx.toString(2).padStart(NUM_QUBITS, '0');
        const phase = c.phase();
        const hue = ((phase + Math.PI) / (Math.PI * 2)) * 360;

        const row = document.createElement('div');
        row.className = 'state-bar-row';
        row.innerHTML = `
          <div class="state-key">|${bitStr}⟩</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${(prob * 100).toFixed(1)}%; background: hsl(${hue}, 90%, 55%);"></div>
          </div>
          <div class="state-prob">${(prob * 100).toFixed(0)}%</div>
        `;
        barsContainer.appendChild(row);
      });

      let p0 = 0, p1 = 0;
      const mask = 1 << (NUM_QUBITS - 1 - selectedQubitIdx);
      state.forEach((c, i) => {
        if (i & mask) p1 += c.mag2();
        else p0 += c.mag2();
      });

      const theta = 2 * Math.acos(Math.min(1, Math.max(0, Math.sqrt(p0))));
      let phi = 0;
      if (p0 > 0.01 && p1 > 0.01) {
        phi = state.find(c => c.mag2() > 0.05)?.phase() || 0;
      }
      updateBlochSphere(theta, phi);

      runShots(1024, false);
    }

    function runShots(shots = 1024, notify = true) {
      const DIM = 16;
      let counts = Array(DIM).fill(0);

      const probs = Array.from(document.querySelectorAll('.state-prob')).map(el => parseFloat(el.textContent) / 100);

      const cdf = [];
      let acc = 0;
      probs.forEach(p => {
        acc += p;
        cdf.push(acc);
      });

      for (let s = 0; s < shots; s++) {
        const r = Math.random();
        const outcome = cdf.findIndex(c => r <= c);
        if (outcome !== -1) counts[outcome]++;
      }

      const histBox = document.getElementById('histogram-box');
      histBox.innerHTML = '';
      const maxCount = Math.max(...counts, 1);

      counts.forEach((cnt, idx) => {
        if (cnt === 0 && probs[idx] === 0) return;
        const bitStr = idx.toString(2).padStart(NUM_QUBITS, '0');
        const heightPct = (cnt / maxCount) * 85;

        const col = document.createElement('div');
        col.className = 'hist-col';
        col.innerHTML = `
          <div class="hist-bar" style="height: ${heightPct}%;"></div>
          <div class="hist-lbl">${bitStr}</div>
        `;
        histBox.appendChild(col);
      });

      if (notify) showToast(`Sampled ${shots} Shots via Quantum Collapse`);
    }

    /* ==========================================================
       RENDER CIRCUIT BOARD WIRES & SLOTS
       ========================================================== */
    function renderCircuitBoard() {
      const board = document.getElementById('circuit-board');
      // Keep playhead-bar, re-render rows
      board.querySelectorAll('.qubit-row').forEach(r => r.remove());

      for (let q = 0; q < NUM_QUBITS; q++) {
        const row = document.createElement('div');
        row.className = 'qubit-row';

        const label = document.createElement('div');
        label.className = 'qubit-label';
        label.innerHTML = `|q${q}⟩ <span style="font-size: 11px; color: var(--text-muted);">&gt;</span>`;
        row.appendChild(label);

        const wire = document.createElement('div');
        wire.className = 'qubit-wire';

        const wireLine = document.createElement('div');
        wireLine.className = 'wire-line';
        wire.appendChild(wireLine);

        for (let s = 0; s < NUM_STEPS; s++) {
          const slot = document.createElement('div');
          slot.className = 'wire-slot';
          const gate = circuitGrid[q][s];

          if (gate) {
            slot.classList.add('filled');
            const badge = document.createElement('div');
            badge.className = `gate-badge gate-${gate.toLowerCase()}`;
            badge.textContent = gate;
            slot.appendChild(badge);
          }

          slot.onclick = () => onSlotClick(q, s);
          wire.appendChild(slot);
        }

        row.appendChild(wire);
        board.appendChild(row);
      }
    }

    function onSlotClick(q, s) {
      if (circuitGrid[q][s]) {
        circuitGrid[q][s] = null;
      } else {
        circuitGrid[q][s] = selectedTool;
        qAudio.playGateChime(selectedTool, q);
      }
      renderCircuitBoard();
      computeQuantumState();
    }

    function resetCircuit() {
      if (qAudio.isPlaying) togglePlayMusic();
      circuitGrid = Array(NUM_QUBITS).fill(null).map(() => Array(NUM_STEPS).fill(null));
      renderCircuitBoard();
      computeQuantumState();
      showToast('Circuit Cleared to Ground State |0000⟩');
    }

    /* ==========================================================
       PRESET QUANTUM ALGORITHMS
       ========================================================== */
    function loadPreset(name) {
      if (qAudio.isPlaying) togglePlayMusic();
      resetCircuit();

      if (name === 'bell') {
        circuitGrid[0][0] = 'H';
        circuitGrid[0][1] = 'CX';
        showToast('Preset: Bell State (|00> + |11>)/√2');
        qAudio.playEntanglementChime();
      } else if (name === 'ghz') {
        circuitGrid[0][0] = 'H';
        circuitGrid[0][1] = 'CX';
        circuitGrid[1][2] = 'CX';
        showToast('Preset: 3-Qubit GHZ State (|000> + |111>)/√2');
        qAudio.playEntanglementChime();
      } else if (name === 'teleport') {
        circuitGrid[1][0] = 'H';
        circuitGrid[1][1] = 'CX';
        circuitGrid[0][2] = 'CX';
        circuitGrid[0][3] = 'H';
        circuitGrid[0][4] = 'M';
        circuitGrid[1][4] = 'M';
        showToast('Preset: Quantum Teleportation Protocol');
      } else if (name === 'grover') {
        circuitGrid[0][0] = 'H';
        circuitGrid[1][0] = 'H';
        circuitGrid[0][1] = 'Z';
        circuitGrid[1][1] = 'Z';
        circuitGrid[0][2] = 'H';
        circuitGrid[1][2] = 'H';
        circuitGrid[0][3] = 'X';
        circuitGrid[1][3] = 'X';
        showToast("Preset: Grover's Search Step");
      } else if (name === 'superdense') {
        circuitGrid[0][0] = 'H';
        circuitGrid[0][1] = 'CX';
        circuitGrid[0][2] = 'X';
        circuitGrid[0][3] = 'Z';
        circuitGrid[0][4] = 'CX';
        circuitGrid[0][5] = 'H';
        showToast('Preset: Superdense Coding Protocol');
      } else if (name === 'qrng') {
        circuitGrid[0][0] = 'H';
        circuitGrid[1][0] = 'H';
        circuitGrid[2][0] = 'H';
        circuitGrid[3][0] = 'H';
        circuitGrid[0][1] = 'M';
        circuitGrid[1][1] = 'M';
        circuitGrid[2][1] = 'M';
        circuitGrid[3][1] = 'M';
        showToast('Preset: 4-Qubit True Random Generator (QRNG)');
      }

      renderCircuitBoard();
      computeQuantumState();
    }

    function showToast(msg) {
      const toast = document.getElementById('toast-banner');
      const text = document.getElementById('toast-text');
      text.textContent = msg;
      toast.classList.add('show');
      clearTimeout(window.toastTimer);
      window.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2800);
    }

    /* ==========================================================
       DRAGGABLE RESIZABLE PANELS & FULLSCREEN MAXIMIZE
       ========================================================== */
    let maximizedPanel = null;

    function toggleMaximize(panel) {
      const grid = document.querySelector('.workspace-grid');
      const blochIcon = document.getElementById('bloch-max-icon');
      const circuitIcon = document.getElementById('circuit-max-icon');
      const telemetryIcon = document.getElementById('telemetry-max-icon');

      if (maximizedPanel === panel) {
        // Restore
        grid.classList.remove('max-bloch', 'max-circuit', 'max-telemetry');
        maximizedPanel = null;
        blochIcon?.setAttribute('data-lucide', 'maximize-2');
        circuitIcon?.setAttribute('data-lucide', 'maximize-2');
        telemetryIcon?.setAttribute('data-lucide', 'maximize-2');
        showToast('Restored Panel View');
      } else {
        // Maximize
        grid.classList.remove('max-bloch', 'max-circuit', 'max-telemetry');
        grid.classList.add(`max-${panel}`);
        maximizedPanel = panel;

        blochIcon?.setAttribute('data-lucide', panel === 'bloch' ? 'minimize-2' : 'maximize-2');
        circuitIcon?.setAttribute('data-lucide', panel === 'circuit' ? 'minimize-2' : 'maximize-2');
        telemetryIcon?.setAttribute('data-lucide', panel === 'telemetry' ? 'minimize-2' : 'maximize-2');
        showToast(`Maximized ${panel.toUpperCase()} View`);
      }
      lucide.createIcons();
      setTimeout(handleBlochResize, 60);
    }

    function initPanelResizers() {
      const blochCol = document.getElementById('view-bloch');
      const telemetryCol = document.getElementById('view-telemetry');
      const resizerBloch = document.getElementById('resizer-bloch');
      const resizerTelemetry = document.getElementById('resizer-telemetry');

      if (!resizerBloch || !resizerTelemetry) return;

      // Load saved widths from localStorage
      const savedBlochW = localStorage.getItem('apex_bloch_w');
      const savedTelemetryW = localStorage.getItem('apex_telemetry_w');
      if (savedBlochW && window.innerWidth > 900) {
        blochCol.style.width = `${savedBlochW}px`;
      }
      if (savedTelemetryW && window.innerWidth > 900) {
        telemetryCol.style.width = `${savedTelemetryW}px`;
      }

      let activeResizer = null;
      let startX = 0;
      let startW = 0;

      // Resizer 1 (Bloch)
      resizerBloch.addEventListener('pointerdown', (e) => {
        if (window.innerWidth <= 900 || maximizedPanel) return;
        activeResizer = 'bloch';
        startX = e.clientX;
        startW = blochCol.getBoundingClientRect().width;
        resizerBloch.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        resizerBloch.setPointerCapture(e.pointerId);
      });

      // Resizer 2 (Telemetry)
      resizerTelemetry.addEventListener('pointerdown', (e) => {
        if (window.innerWidth <= 900 || maximizedPanel) return;
        activeResizer = 'telemetry';
        startX = e.clientX;
        startW = telemetryCol.getBoundingClientRect().width;
        resizerTelemetry.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        resizerTelemetry.setPointerCapture(e.pointerId);
      });

      window.addEventListener('pointermove', (e) => {
        if (!activeResizer) return;

        if (activeResizer === 'bloch') {
          const delta = e.clientX - startX;
          const newW = Math.max(180, Math.min(window.innerWidth * 0.70, startW + delta));
          blochCol.style.width = `${newW}px`;
          handleBlochResize();
        } else if (activeResizer === 'telemetry') {
          const delta = startX - e.clientX;
          const newW = Math.max(240, Math.min(window.innerWidth * 0.60, startW + delta));
          telemetryCol.style.width = `${newW}px`;
        }
      });

      const stopDrag = () => {
        if (!activeResizer) return;
        if (activeResizer === 'bloch') {
          resizerBloch.classList.remove('dragging');
          localStorage.setItem('apex_bloch_w', Math.round(blochCol.getBoundingClientRect().width));
        } else if (activeResizer === 'telemetry') {
          resizerTelemetry.classList.remove('dragging');
          localStorage.setItem('apex_telemetry_w', Math.round(telemetryCol.getBoundingClientRect().width));
        }
        activeResizer = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        handleBlochResize();
      };

      window.addEventListener('pointerup', stopDrag);
      window.addEventListener('pointercancel', stopDrag);

      // Double-click to reset widths
      resizerBloch.addEventListener('dblclick', () => {
        blochCol.style.width = '350px';
        localStorage.removeItem('apex_bloch_w');
        handleBlochResize();
        showToast('Bloch Sphere Panel Reset');
      });

      resizerTelemetry.addEventListener('dblclick', () => {
        telemetryCol.style.width = '370px';
        localStorage.removeItem('apex_telemetry_w');
        showToast('Telemetry Panel Reset');
      });
    }

    /* ==========================================================
       ANIMATION LOOP & RESIZE
       ========================================================== */
    function animate() {
      requestAnimationFrame(animate);
      bControls.update();
      bRenderer.render(bScene, bCamera);
    }

    window.addEventListener('resize', handleBlochResize);

    renderCircuitBoard();
    loadPreset('bell');
    initPanelResizers();
    animate();
