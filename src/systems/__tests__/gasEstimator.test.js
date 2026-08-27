import { describe, it, expect } from 'vitest';
import { estimateGas } from '../gasEstimator.js';

describe('gasEstimator', () => {
    it('returns 0 for empty or invalid input', () => {
        expect(estimateGas('')).toBe(0);
        expect(estimateGas(null)).toBe(0);
    });

    it('estimates cost for storage operations', () => {
        const code = `
            env.storage().persistent().set(&key, &val); // 500
            env.storage().instance().get(&key); // 400
            env.storage().temporary().get(&key); // 200
        `;
        expect(estimateGas(code)).toBe(1100);
    });

    it('estimates cost for loops', () => {
        const code = `
            for item in vec.iter() { // 200 + 200
                // do something
            }
            while true { // 200
                break;
            }
        `;
        expect(estimateGas(code)).toBe(600);
    });

    it('estimates cost for cloning', () => {
        const code = `
            let x = data.clone(); // 50
        `;
        expect(estimateGas(code)).toBe(50);
    });

    it('ignores comments', () => {
        const code = `
            // env.storage().persistent().set(&key, &val);
            /* env.storage().instance().get(&key); */
            let x = 1;
        `;
        expect(estimateGas(code)).toBe(0);
    });

    it('calculates total correctly for a combined scenario', () => {
        const inefficient = `
            let mut result = Vec::new(&env); // 20
            for i in 0..10 { // 200
                let val: u32 = env.storage().instance().get(&key).unwrap(); // 400
                result.push_back(val.clone()); // 50
            }
        `;
        expect(estimateGas(inefficient)).toBe(670);

        const efficient = `
            let val: u32 = env.storage().instance().get(&key).unwrap(); // 400
            let mut result = Vec::new(&env); // 20
            for i in 0..10 { // 200
                result.push_back(val);
            }
        `;
        expect(estimateGas(efficient)).toBe(620);
    });
});
