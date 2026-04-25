// SimulatorPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import ContractSimulator from '../systems/contractSimulator';

export default function SimulatorPanel({ code, onClose }) {
  const [simulator] = useState(() => new ContractSimulator());
  const [parsedContract, setParsedContract] = useState(null);
  const [simulationSteps, setSimulationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [storageState, setStorageState] = useState({});
  const [callStack, setCallStack] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms between steps
  
  const intervalRef = useRef(null);

  // Parse contract code when it changes
  useEffect(() => {
    if (code) {
      try {
        const parsed = simulator.parseContract(code);
        setParsedContract(parsed);
        if (parsed.functions.length > 0) {
          setSelectedFunction(parsed.functions[0].name);
        }
      } catch (error) {
        console.error('Failed to parse contract:', error);
      }
    }
  }, [code, simulator]);

  // Auto-play simulation
  useEffect(() => {
    if (isPlaying && currentStep < simulationSteps.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, simulationSpeed);
    } else if (isPlaying && currentStep >= simulationSteps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, simulationSteps.length, simulationSpeed]);

  // Update display when current step changes
  useEffect(() => {
    if (simulationSteps.length > 0 && currentStep < simulationSteps.length) {
      const step = simulationSteps[currentStep];
      setStorageState(step.storage ? Object.fromEntries(step.storage) : {});
      
      // Update call stack
      if (step.type === 'function_start') {
        setCallStack(prev => [...prev, step.function]);
      } else if (step.type === 'function_end') {
        setCallStack(prev => prev.filter(fn => fn !== step.function));
      }
      
      // Update event log
      setEventLog(prev => [...prev.slice(-19), step]); // Keep last 20 events
    }
  }, [currentStep, simulationSteps]);

  // Start simulation
  const startSimulation = () => {
    if (!parsedContract || !selectedFunction) return;
    
    try {
      const steps = simulator.simulateExecution(parsedContract, selectedFunction);
      setSimulationSteps(steps);
      setCurrentStep(0);
      setIsPlaying(true);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert(`Simulation error: ${error.message}`);
    }
  };

  // Playback controls
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    if (currentStep < simulationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCallStack([]);
    setEventLog([]);
    simulator.reset();
  };

  // Get step type display
  const getStepDisplay = (step) => {
    switch (step.type) {
      case 'function_start':
        return { icon: '🚀', color: '#10b981', text: `Function: ${step.function}` };
      case 'function_end':
        return { icon: '✅', color: '#10b981', text: `Completed: ${step.function}` };
      case 'storage_get':
        return { icon: '📖', color: '#3b82f6', text: `Read: ${step.variable}` };
      case 'storage_set':
        return { icon: '✏️', color: '#f59e0b', text: `Write: ${step.variable}` };
      case 'storage_remove':
        return { icon: '🗑️', color: '#ef4444', text: `Remove: ${step.variable}` };
      case 'auth_check':
        return { icon: step.authorized ? '🔓' : '🔒', color: step.authorized ? '#10b981' : '#ef4444', text: `Auth: ${step.authorized ? 'Pass' : 'Fail'}` };
      default:
        return { icon: '📝', color: '#6b7280', text: 'Unknown' };
    }
  };

  if (!parsedContract) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No contract code to simulate.
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)'
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          🔬 Contract Simulator
        </h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>

      {/* Controls */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-tertiary)'
      }}>
        {/* Function Selection */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '0.5rem' 
          }}>
            Select Function:
          </label>
          <select
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)'
            }}
          >
            {parsedContract.functions.map(func => (
              <option key={func.name} value={func.name}>
                {func.name}({func.params.map(p => p.name).join(', ')})
              </option>
            ))}
          </select>
        </div>

        {/* Playback Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={startSimulation}
            disabled={!selectedFunction}
          >
            ▶️ Start Simulation
          </button>
          
          {simulationSteps.length > 0 && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={togglePlayPause}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              
              <button
                className="btn btn-ghost btn-sm"
                onClick={stepBackward}
                disabled={currentStep === 0}
              >
                ⏮ Step Back
              </button>
              
              <button
                className="btn btn-ghost btn-sm"
                onClick={stepForward}
                disabled={currentStep >= simulationSteps.length - 1}
              >
                Step Forward ⏭
              </button>
              
              <button
                className="btn btn-ghost btn-sm"
                onClick={resetSimulation}
              >
                🔄 Reset
              </button>
            </>
          )}
        </div>

        {/* Speed Control */}
        {simulationSteps.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Speed:
            </span>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              style={{
                padding: '0.25rem 0.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)'
              }}
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
            
            {/* Progress */}
            <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Step {currentStep + 1} of {simulationSteps.length}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Panel - Storage State */}
        <div style={{
          flex: 1,
          padding: '1rem',
          borderRight: '1px solid var(--border-subtle)',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
            🗄️ Storage State
          </h4>
          {Object.keys(storageState).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No storage entries yet
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {Object.entries(storageState).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    {key}
                  </div>
                  <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle Panel - Call Stack */}
        <div style={{
          flex: 1,
          padding: '1rem',
          borderRight: '1px solid var(--border-subtle)',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
            📚 Call Stack
          </h4>
          {callStack.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No active function calls
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {callStack.map((funcName, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>🚀</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {funcName}()
                  </span>
                  <span style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.75rem',
                    marginLeft: 'auto'
                  }}>
                    Level {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Event Log */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
            📋 Event Log
          </h4>
          {eventLog.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No events yet
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {eventLog.map((event, index) => {
                const display = getStepDisplay(event);
                return (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      opacity: index === eventLog.length - 1 ? 1 : 0.7
                    }}
                  >
                    <span style={{ color: display.color }}>
                      {display.icon}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {display.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Current Step Info */}
      {simulationSteps.length > 0 && currentStep < simulationSteps.length && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)',
          fontSize: '0.85rem'
        }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Current Step:
          </div>
          <div style={{ color: 'var(--text-primary)' }}>
            {simulationSteps[currentStep].message}
          </div>
        </div>
      )}
    </div>
  );
}
