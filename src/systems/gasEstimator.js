/* ==========================================
   Gas Estimator — Static cost heuristic
   ========================================== */

export function estimateGas(code) {
    if (!code || typeof code !== 'string') return 0;
    
    let totalGas = 0;
    
    // Remove comments to prevent false positives
    const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

    // 1. Storage Operations
    const persistentMatches = cleanCode.match(/storage\(\)\s*\.\s*persistent\(\)/g) || [];
    totalGas += persistentMatches.length * 500;

    const instanceMatches = cleanCode.match(/storage\(\)\s*\.\s*instance\(\)/g) || [];
    totalGas += instanceMatches.length * 400;

    const temporaryMatches = cleanCode.match(/storage\(\)\s*\.\s*temporary\(\)/g) || [];
    totalGas += temporaryMatches.length * 200;

    // 2. Loop Constructs
    const loopMatches = cleanCode.match(/\b(for\s|while\s|loop\s*\{)/g) || [];
    totalGas += loopMatches.length * 200;
    
    // Also catch `.iter()` or `.into_iter()`
    const iterMatches = cleanCode.match(/\.(iter|into_iter)\(\)/g) || [];
    totalGas += iterMatches.length * 200;

    // 3. Allocations / Cloning
    const cloneMatches = cleanCode.match(/\.clone\(\)/g) || [];
    totalGas += cloneMatches.length * 50;

    // 4. Data Structures (Vec, Map creations)
    const dataStructMatches = cleanCode.match(/\b(Vec::new|Map::new|vec!|map!)/g) || [];
    totalGas += dataStructMatches.length * 20;

    return totalGas;
}
