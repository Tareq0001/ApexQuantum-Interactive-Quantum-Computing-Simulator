/**
 * ApexQuantum | TypeScript Type Definitions
 * ==========================================
 * Strict types for quantum state vectors, complex amplitudes,
 * circuit composer grids, and Web Audio sequencer engines.
 * 
 * Author: Tareq Ali (@Tareq0001)
 */

export type QuantumGateType = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'CX' | 'M';

export interface ComplexNumber {
  re: number;
  im: number;
  add(other: ComplexNumber): ComplexNumber;
  mul(other: ComplexNumber): ComplexNumber;
  mag2(): number;
  phase(): number;
}

export type CircuitGrid = (QuantumGateType | null)[][];

export interface QuantumStateVector {
  dimension: number;
  amplitudes: ComplexNumber[];
  probabilities: number[];
  isEntangled: boolean;
  diracNotation: string;
}

export interface BlochAngles {
  theta: number;
  phi: number;
}

export interface AudioSequencerConfig {
  bpm: number;
  stepDurationMs: number;
  activeStep: number;
  isPlaying: boolean;
}

export interface MeasurementResult {
  shots: number;
  counts: Record<string, number>;
  collapsedStates: string[];
}
