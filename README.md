# ⚛️ ApexQuantum | Interactive Quantum Computing Circuit & 3D Bloch Sphere Simulator

> **Next-Generation Interactive Quantum Computer and Circuit Simulator** featuring a 3D WebGL Bloch Sphere, 4-qubit circuit composer, real-time complex state vector calculation, quantum entanglement detection, and Monte Carlo measurement shot sampling.

![ApexQuantum Banner](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80)

---

## 🌟 Highlights & Key Features

1. **🌐 Interactive 3D WebGL Bloch Sphere**:
   - Rotatable 3D Bloch sphere rendered with Three.js.
   - Dynamic quantum state vector arrow ($|\psi\rangle = \cos(\theta/2)|0\rangle + e^{i\phi}\sin(\theta/2)|1\rangle$).
   - Real-time polar ($\theta$) and azimuthal ($\phi$) angles calculation for any selected qubit ($q_0 \dots q_3$).

2. **🎛️ 4-Qubit Circuit Composer**:
   - Interactive 4-wire circuit board ($q_0, q_1, q_2, q_3$) with 8 timeline steps.
   - Rich toolbox of quantum gates:
     - **$H$ (Hadamard)**: Superposition generator.
     - **$X, Y, Z$ (Pauli)**: Bit-flip and phase-flip operations.
     - **$S, T$**: $\pi/2$ and $\pi/4$ phase rotations.
     - **$\text{CX}$ (CNOT)**: Controlled-NOT for multi-qubit entanglement.
     - **$M$**: Quantum measurement operator.

3. **🔢 Real-Time Complex State Vector Engine**:
   - Computes all $2^4 = 16$ complex probability amplitudes ($c_0 \dots c_{15}$) instantaneously.
   - Dirac bra-ket notation display ($|\Psi\rangle = \sum c_k |k\rangle$).
   - Color-coded probability spectrum with HSL phase wheel mapping ($\arg(c_k)$).

4. **🔗 Quantum Entanglement Detection**:
   - Automatic detection of quantum correlations and non-separable states (Bell States $|\Phi^+\rangle$, GHZ States).
   - Visual entanglement status badge.

5. **🎲 Monte Carlo 1024-Shot Measurement Sampler**:
   - Simulates quantum wavefunction collapse with an animated histogram of measurement outcomes.

6. **📜 Pre-built Quantum Algorithms**:
   - **Bell State ($|\Phi^+\rangle$)**: $\frac{|00\rangle + |11\rangle}{\sqrt{2}}$.
   - **GHZ State**: 3-Qubit maximal entanglement $\frac{|000\rangle + |111\rangle}{\sqrt{2}}$.
   - **Quantum Teleportation**: Complete 3-qubit teleportation protocol.
   - **Grover's Search Step**: Quantum amplitude amplification oracle.
   - **Superdense Coding**: Transmit 2 classical bits using 1 entangled qubit.
   - **QRNG**: True quantum random number generation from superposition.

7. **🔊 Synthesized Quantum Audio (Web Audio API)**:
   - Resonant harmonic chords and gate chimes matching active quantum states.

---

## 🚀 Live Demo

Experience the live interactive simulator directly in your browser:
**[https://tareq0001.github.io/ApexQuantum-Interactive-Quantum-Computing-Simulator/](https://tareq0001.github.io/ApexQuantum-Interactive-Quantum-Computing-Simulator/)**

---

## 🎮 How to Use

1. **Select a Gate**: Click on any gate badge in the toolbar ($H, X, Y, Z, S, T, CX, M$).
2. **Place on Wire**: Click any slot on the qubit wires to place or remove the gate.
3. **Inspect Bloch Sphere**: Switch between $q_0 \dots q_3$ to inspect the 3D state vector orientation.
4. **Load Algorithms**: Click on any preset (Bell State, GHZ, Teleportation, Grover) for instant scaffolding.
5. **Sample Measurements**: Click `SAMPLE` to execute 1024 quantum measurement shots.

---

## 🛠️ Tech Stack

- **Graphics**: WebGL, Three.js (r128), OrbitControls
- **Mathematics**: Complex number linear algebra, tensor products, unitary matrix transformations
- **Audio**: Web Audio API (Harmonic frequency synthesis)
- **UI & Styling**: Cyber dark theme, JetBrains Mono, Outfit font, Lucide Icons

---

## 👨‍💻 Developed By

**Tareq Aboushi (أ. طارق ابوعشي)**
- GitHub: [@Tareq0001](https://github.com/Tareq0001)
- Portfolio: [https://tareq0001.github.io/](https://tareq0001.github.io/)
