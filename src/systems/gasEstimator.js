/* ==========================================
   Gas Estimator — Heuristic scorer for
   Soroban/Rust code resource usage
   ========================================== */

export function estimateGas(code) {
  let score = 0;

  // Normalize code for easier matching
  const normalized = code.replace(/\s+/g, ' ');

  // 1. Storage Operations
  // env.storage().persistent().set(...)
  const storageSets = (code.match(/storage\(\)\s*\.\s*(persistent|temporary|instance)\(\)\s*\.\s*set/g) || []).length;
  const storageGets = (code.match(/storage\(\)\s*\.\s*(persistent|temporary|instance)\(\)\s*\.\s*get/g) || []).length;
  
  score += storageSets * 1000;
  score += storageGets * 500;

  // 2. Loops
  const forLoops = (code.match(/\bfor\s+[^{]+\{/g) || []).length;
  const whileLoops = (code.match(/\bwhile\s+[^{]+\{/g) || []).length;
  const rawLoops = (code.match(/\bloop\s*\{/g) || []).length;

  score += (forLoops + whileLoops + rawLoops) * 200;

  // 3. Data Structures & Allocations
  const vecCreates = (code.match(/vec!\[/g) || []).length;
  const vecNews = (code.match(/\bVec::new\(\)/g) || []).length;
  const mapCreates = (code.match(/\bMap::new\(\)/g) || []).length;
  const stringCreates = (code.match(/\bString::from_slice/g) || []).length;

  score += (vecCreates + vecNews) * 100;
  score += mapCreates * 100;
  score += stringCreates * 50;

  // 4. Clones
  const clones = (code.match(/\.clone\(\)/g) || []).length;
  score += clones * 50;

  // 5. Method calls
  const pushes = (code.match(/\.push_back\(|\.push_front\(/g) || []).length;
  score += pushes * 20;

  const symbolShorts = (code.match(/symbol_short!/g) || []).length;
  const symbolNews = (code.match(/Symbol::new/g) || []).length;
  score += symbolShorts * 10;
  score += symbolNews * 20;

  return score;
}
