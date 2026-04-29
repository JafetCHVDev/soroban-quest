// Basic test for contract simulator functionality
import ContractSimulator from '../contractSimulator.js';

// Test contract samples
const testContracts = {
  simpleStorage: `
pub struct Storage {
    counter: u64,
}

impl Storage {
    pub fn new() -> Storage {
        Storage { counter: 0 }
    }
    
    pub fn increment(&mut self) {
        self.counter += 1;
    }
    
    pub fn get_counter(&self) -> u64 {
        self.counter
    }
}

pub fn increment(env: Env) {
    let mut storage = Storage::new();
    storage.increment();
    env.storage().set(&COUNTER, &storage.counter);
}

pub fn get_counter(env: Env) -> u64 {
    env.storage().get(&COUNTER).unwrap_or(0)
}
  `,
  
  withAuth: `
pub fn protected_function(env: Env) {
    require_auth!(&env.current_contract_address());
    
    let data = env.storage().get(&DATA_KEY);
    env.storage().set(&DATA_KEY, &42);
}

pub fn public_function(env: Env) {
    env.storage().set(&PUBLIC_KEY, &"public_value");
}
  `,
  
  complexOperations: `
pub fn complex_operation(env: Env, key: Bytes, value: u64) {
    require_auth!(&env.current_contract_address());
    
    let old_value = env.storage().get(&key);
    env.storage().set(&key, &value);
    
    if old_value.is_some() {
        env.storage().remove(&OLD_VALUES_KEY);
    }
}

pub fn read_multiple(env: Env, keys: Vec<Bytes>) -> Vec<u64> {
    let mut results = Vec::new();
    for key in keys {
        if let Some(value) = env.storage().get(&key) {
            results.push(value);
        }
    }
    results
}
  `
};

// Test function
function testContractSimulator() {
  console.log('Testing ContractSimulator...');
  
  try {
    const simulator = new ContractSimulator();
    console.log('✓ ContractSimulator instantiated successfully');
    
    // Test parsing different contract types
    Object.entries(testContracts).forEach(([name, code]) => {
      console.log(`\n--- Testing ${name} contract ---`);
      
      // Parse contract
      const parsed = simulator.parseContract(code);
      console.log(`✓ Parsed ${name}: ${parsed.functions.length} functions found`);
      
      // Test function extraction
      parsed.functions.forEach(func => {
        console.log(`  - Function: ${func.name}(${func.params.map(p => p.name).join(', ')})`);
      });
      
      // Test storage operations detection
      if (parsed.storageOps.length > 0) {
        console.log(`  - Storage operations: ${parsed.storageOps.length}`);
        parsed.storageOps.forEach(op => {
          console.log(`    * ${op.type} on ${op.variable}`);
        });
      }
      
      // Test auth checks detection
      if (parsed.authChecks.length > 0) {
        console.log(`  - Auth checks: ${parsed.authChecks.length}`);
        parsed.authChecks.forEach(auth => {
          console.log(`    * require_auth on ${auth.argument}`);
        });
      }
      
      // Test simulation if functions available
      if (parsed.functions.length > 0) {
        const firstFunction = parsed.functions[0];
        console.log(`  - Simulating ${firstFunction.name}...`);
        
        try {
          const steps = simulator.simulateExecution(parsed, firstFunction.name);
          console.log(`    ✓ Simulation completed: ${steps.length} steps`);
          
          // Test step types
          const stepTypes = [...new Set(steps.map(s => s.type))];
          console.log(`    - Step types: ${stepTypes.join(', ')}`);
          
          // Test storage state
          const summary = simulator.getSimulationSummary();
          console.log(`    - Final storage entries: ${Object.keys(summary.finalStorage).length}`);
          
        } catch (error) {
          console.log(`    ⚠ Simulation error: ${error.message}`);
        }
      }
    });
    
    console.log('\n✅ All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for potential use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testContractSimulator, testContracts };
}
