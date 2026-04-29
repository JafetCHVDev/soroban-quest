// contractSimulator.js
// Simulates Soroban contract execution with state visualization

class ContractSimulator {
  constructor() {
    this.storage = new Map();
    this.callStack = [];
    this.eventLog = [];
    this.authChecks = [];
    this.currentStep = 0;
    this.simulationSteps = [];
    this.isSimulating = false;
  }

  // Parse contract code to extract functions, storage operations, and auth checks
  parseContract(code) {
    const functions = this.extractFunctions(code);
    const storageOps = this.extractStorageOperations(code);
    const authChecks = this.extractAuthChecks(code);
    
    return {
      functions,
      storageOps,
      authChecks,
      parsedCode: code
    };
  }

  // Extract function definitions from Rust code
  extractFunctions(code) {
    const functions = [];
    const functionRegex = /pub\s+fn\s+(\w+)\s*\([^)]*\)(?:\s*->\s*[^{]+)?\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      const functionStart = match.index;
      const functionBody = this.extractFunctionBody(code, functionStart);
      
      functions.push({
        name: functionName,
        body: functionBody,
        params: this.extractParameters(match[0]),
        isPublic: true
      });
    }
    
    return functions;
  }

  // Extract function body with proper brace matching
  extractFunctionBody(code, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    let body = '';
    
    for (let i = startIndex; i < code.length; i++) {
      const char = code[i];
      
      if (char === '{') {
        if (!inFunction) {
          inFunction = true;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inFunction) {
          body += char;
          break;
        }
      }
      
      if (inFunction) {
        body += char;
      }
    }
    
    return body;
  }

  // Extract parameters from function signature
  extractParameters(functionSignature) {
    const paramMatch = functionSignature.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];
    
    const paramString = paramMatch[1];
    if (!paramString.trim()) return [];
    
    return paramString.split(',').map(param => {
      const parts = param.trim().split(':');
      return {
        name: parts[0].trim(),
        type: parts[1] ? parts[1].trim() : 'unknown'
      };
    });
  }

  // Extract storage operations from code
  extractStorageOperations(code) {
    const operations = [];
    
    // Storage get operations
    const getRegex = /(\w+)\.get\(&[^)]+\)/g;
    let match;
    while ((match = getRegex.exec(code)) !== null) {
      operations.push({
        type: 'get',
        variable: match[1],
        line: this.getLineNumber(code, match.index)
      });
    }
    
    // Storage set operations
    const setRegex = /(\w+)\.set\(&[^)]+,\s*([^)]+)\)/g;
    while ((match = setRegex.exec(code)) !== null) {
      operations.push({
        type: 'set',
        variable: match[1],
        value: match[2],
        line: this.getLineNumber(code, match.index)
      });
    }
    
    // Storage remove operations
    const removeRegex = /(\w+)\.remove\(&[^)]+\)/g;
    while ((match = removeRegex.exec(code)) !== null) {
      operations.push({
        type: 'remove',
        variable: match[1],
        line: this.getLineNumber(code, match.index)
      });
    }
    
    return operations;
  }

  // Extract auth checks from code
  extractAuthChecks(code) {
    const authChecks = [];
    
    // require_auth calls
    const authRegex = /require_auth\(&([^)]+)\)/g;
    let match;
    while ((match = authRegex.exec(code)) !== null) {
      authChecks.push({
        type: 'require_auth',
        argument: match[1],
        line: this.getLineNumber(code, match.index)
      });
    }
    
    return authChecks;
  }

  // Get line number from character index
  getLineNumber(code, index) {
    const lines = code.substring(0, index).split('\n');
    return lines.length;
  }

  // Simulate contract execution
  simulateExecution(parsedContract, functionName, args = {}) {
    this.reset();
    this.isSimulating = true;
    
    const functionDef = parsedContract.functions.find(f => f.name === functionName);
    if (!functionDef) {
      throw new Error(`Function ${functionName} not found`);
    }
    
    // Add initial step
    this.addStep({
      type: 'function_start',
      function: functionName,
      args,
      storage: new Map(this.storage),
      message: `Starting execution of ${functionName}`
    });
    
    // Simulate function body execution
    this.simulateFunctionBody(functionDef, parsedContract, args);
    
    // Add final step
    this.addStep({
      type: 'function_end',
      function: functionName,
      storage: new Map(this.storage),
      message: `Completed execution of ${functionName}`
    });
    
    this.isSimulating = false;
    return this.simulationSteps;
  }

  // Simulate function body execution
  simulateFunctionBody(functionDef, parsedContract, args) {
    const body = functionDef.body;
    
    // Simulate storage operations
    const storageOps = this.findStorageOpsInBody(body, parsedContract.storageOps);
    
    for (const op of storageOps) {
      switch (op.type) {
        case 'get':
          this.simulateStorageGet(op.variable);
          break;
        case 'set':
          this.simulateStorageSet(op.variable, this.generateMockValue());
          break;
        case 'remove':
          this.simulateStorageRemove(op.variable);
          break;
      }
    }
    
    // Simulate auth checks
    const authOps = this.findAuthOpsInBody(body, parsedContract.authChecks);
    for (const auth of authOps) {
      this.simulateAuthCheck(auth.argument);
    }
  }

  // Find storage operations in function body
  findStorageOpsInBody(body, allStorageOps) {
    return allStorageOps.filter(op => body.includes(op.variable));
  }

  // Find auth operations in function body
  findAuthOpsInBody(body, allAuthOps) {
    return allAuthOps.filter(auth => body.includes(auth.argument));
  }

  // Simulate storage get operation
  simulateStorageGet(variable) {
    const key = `${variable}_key`;
    const value = this.storage.get(key) || 'null';
    
    this.addStep({
      type: 'storage_get',
      variable,
      key,
      value,
      storage: new Map(this.storage),
      message: `Read ${variable}: ${value}`
    });
  }

  // Simulate storage set operation
  simulateStorageSet(variable, value) {
    const key = `${variable}_key`;
    const oldValue = this.storage.get(key);
    this.storage.set(key, value);
    
    this.addStep({
      type: 'storage_set',
      variable,
      key,
      value,
      oldValue,
      storage: new Map(this.storage),
      message: `Set ${variable}: ${oldValue} → ${value}`
    });
  }

  // Simulate storage remove operation
  simulateStorageRemove(variable) {
    const key = `${variable}_key`;
    const oldValue = this.storage.get(key);
    this.storage.delete(key);
    
    this.addStep({
      type: 'storage_remove',
      variable,
      key,
      oldValue,
      storage: new Map(this.storage),
      message: `Removed ${variable}: ${oldValue}`
    });
  }

  // Simulate auth check
  simulateAuthCheck(argument) {
    // Simulate auth success (in real implementation this would check actual auth)
    const authorized = Math.random() > 0.2; // 80% success rate for demo
    
    this.addStep({
      type: 'auth_check',
      argument,
      authorized,
      storage: new Map(this.storage),
      message: `Auth check for ${argument}: ${authorized ? '✅ Authorized' : '❌ Rejected'}`
    });
    
    if (!authorized) {
      throw new Error('Authorization failed');
    }
  }

  // Generate mock value for storage
  generateMockValue() {
    const values = ['42', 'hello', 'true', '100', '"contract_value"'];
    return values[Math.floor(Math.random() * values.length)];
  }

  // Add simulation step
  addStep(step) {
    step.stepNumber = this.currentStep++;
    step.timestamp = Date.now();
    this.simulationSteps.push(step);
    this.eventLog.push(step);
  }

  // Reset simulator state
  reset() {
    this.storage.clear();
    this.callStack = [];
    this.eventLog = [];
    this.authChecks = [];
    this.currentStep = 0;
    this.simulationSteps = [];
    this.isSimulating = false;
  }

  // Get current storage state
  getStorageState() {
    return Object.fromEntries(this.storage);
  }

  // Get simulation summary
  getSimulationSummary() {
    const storageOps = this.simulationSteps.filter(step => 
      ['storage_get', 'storage_set', 'storage_remove'].includes(step.type)
    );
    const authOps = this.simulationSteps.filter(step => step.type === 'auth_check');
    
    return {
      totalSteps: this.simulationSteps.length,
      storageOperations: storageOps.length,
      authChecks: authOps.length,
      finalStorage: this.getStorageState(),
      events: this.eventLog
    };
  }

  // Step through simulation
  stepTo(stepNumber) {
    if (stepNumber < 0 || stepNumber >= this.simulationSteps.length) {
      return null;
    }
    
    const step = this.simulationSteps[stepNumber];
    this.currentStep = stepNumber;
    
    // Restore storage state at this step
    if (step.storage) {
      this.storage = new Map(step.storage);
    }
    
    return step;
  }

  // Get available functions for simulation
  getSimulatableFunctions(parsedContract) {
    return parsedContract.functions
      .filter(func => func.isPublic)
      .map(func => ({
        name: func.name,
        params: func.params,
        description: `Execute ${func.name} function`
      }));
  }
}

export default ContractSimulator;
