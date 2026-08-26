import { describe, it, expect } from 'vitest';
import { estimateGas } from '../gasEstimator.js';

describe('Gas Estimator', () => {
    it('calculates storage operations correctly', () => {
        const code = `
            env.storage().persistent().set(&key, &value);
            let val = env.storage().persistent().get(&key).unwrap_or(0);
        `;
        // 1 set (1000) + 1 get (500) = 1500
        expect(estimateGas(code)).toBe(1500);
    });

    it('penalizes loops', () => {
        const code = `
            for item in list {
                // do something
            }
            while x > 0 {
                x -= 1;
            }
            loop {
                break;
            }
        `;
        // 3 loops * 200 = 600
        expect(estimateGas(code)).toBe(600);
    });

    it('penalizes clones and allocations', () => {
        const code = `
            let my_vec = vec![&env, 1, 2, 3];
            let other_vec = Vec::new(&env);
            let map = Map::new(&env);
            let s = String::from_slice(&env, "hello");
            let cloned = data.clone();
        `;
        // vec![] (100) + Vec::new (100) + Map::new (100) + String::from_slice (50) + clone (50) = 400
        expect(estimateGas(code)).toBe(400);
    });

    it('scores inefficient code higher than efficient code (storage)', () => {
        const inefficient = `
            let val1 = env.storage().persistent().get(&key).unwrap_or(0);
            let val2 = env.storage().persistent().get(&key).unwrap_or(0);
            env.storage().persistent().set(&key, val1 + val2);
        `;
        const efficient = `
            let val = env.storage().persistent().get(&key).unwrap_or(0);
            env.storage().persistent().set(&key, val * 2);
        `;
        const inefficientScore = estimateGas(inefficient); // 2 get (1000) + 1 set (1000) = 2000
        const efficientScore = estimateGas(efficient);     // 1 get (500) + 1 set (1000) = 1500
        
        expect(inefficientScore).toBe(2000);
        expect(efficientScore).toBe(1500);
        expect(inefficientScore).toBeGreaterThan(efficientScore);
    });
});
