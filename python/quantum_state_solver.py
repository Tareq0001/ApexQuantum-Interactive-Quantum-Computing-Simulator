"""
ApexQuantum | High-Performance Quantum State Solver
====================================================
Exact numerical state vector evolution and density matrix calculation
using Kronecker tensor products and complex unitary matrix operations.

Author: Tareq Ali (@Tareq0001)
"""

import numpy as np
from typing import Dict, List, Tuple


class QuantumStateSolver:
    """Simulates multi-qubit state evolution via linear algebra."""

    # Standard 1-qubit quantum gate matrices
    I = np.array([[1, 0], [0, 1]], dtype=complex)
    H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)
    X = np.array([[0, 1], [1, 0]], dtype=complex)
    Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
    Z = np.array([[1, 0], [0, -1]], dtype=complex)
    S = np.array([[1, 0], [0, 1j]], dtype=complex)
    T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=complex)

    def __init__(self, num_qubits: int = 4):
        self.num_qubits = num_qubits
        self.dim = 2 ** num_qubits

    def get_initial_state(self) -> np.ndarray:
        """Returns the ground state |0000>."""
        state = np.zeros(self.dim, dtype=complex)
        state[0] = 1.0
        return state

    def apply_single_qubit_gate(self, state: np.ndarray, gate: np.ndarray, target: int) -> np.ndarray:
        """Applies a 1-qubit gate to the specified qubit using Kronecker products."""
        op = 1
        for q in range(self.num_qubits):
            mat = gate if q == target else self.I
            op = np.kron(op, mat) if isinstance(op, np.ndarray) else mat
        return op @ state

    def apply_cnot(self, state: np.ndarray, control: int, target: int) -> np.ndarray:
        """Applies a 2-qubit CNOT gate."""
        next_state = np.zeros_like(state)
        ctrl_mask = 1 << (self.num_qubits - 1 - control)
        target_mask = 1 << (self.num_qubits - 1 - target)

        for i in range(self.dim):
            if i & ctrl_mask:
                flipped = i ^ target_mask
                next_state[i] = state[flipped]
            else:
                next_state[i] = state[i]
        return next_state

    def compute_probabilities(self, state: np.ndarray) -> np.ndarray:
        """Calculates measurement probabilities P(k) = |c_k|^2."""
        return np.abs(state) ** 2

    def sample_measurement(self, state: np.ndarray, shots: int = 1024) -> Dict[str, int]:
        """Performs Monte Carlo projective measurement collapse."""
        probs = self.compute_probabilities(state)
        outcomes = np.random.choice(self.dim, size=shots, p=probs)
        unique, counts = np.unique(outcomes, return_counts=True)
        return {
            format(idx, f"0{self.num_qubits}b"): int(cnt)
            for idx, cnt in zip(unique, counts)
        }


if __name__ == "__main__":
    solver = QuantumStateSolver(num_qubits=4)
    state = solver.get_initial_state()

    # Create Bell State |Phi+> on q0 and q1
    state = solver.apply_single_qubit_gate(state, solver.H, 0)
    state = solver.apply_cnot(state, control=0, target=1)

    print("State Vector amplitudes (|0000> and |1100>):")
    print(f"  |0000>: {state[0]:.4f}")
    print(f"  |1100>: {state[12]:.4f}")

    counts = solver.sample_measurement(state, shots=1024)
    print("\n1024 Monte Carlo Measurement Counts:", counts)
