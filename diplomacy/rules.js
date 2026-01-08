
// --- Rules ---
const PHASES = [
  { key:"S-M", label:"Spring Movement" },
  { key:"S-R", label:"Spring Retreats" },
  { key:"F-M", label:"Fall Movement" },
  { key:"F-R", label:"Fall Retreats" },
  { key:"W-A", label:"Winter Adjustments" },
];

function deepClone(x){ try { return JSON.parse(JSON.stringify(x)); } catch(e){ return x; } }
function isSea(id){ return PROVINCES[id]?.type==='sea'; }
function isLand(id){ return PROVINCES[id]?.type==='land'; }
function isCoast(id){ return !!PROVINCES[id]?.coast; }
function isAdjacent(a,b){ return PROVINCES[a]?.adj?.includes(b); }

function canMove(unit, to){ if (!isAdjacent(unit.prov, to)) return false; if (unit.kind==='A') return isLand(to); if (unit.kind==='F') return isSea(to)||isCoast(to); return false; }

// Minimal resolve to keep UI working; full logic available in earlier builds
//function resolveMovementPhase(state){ const log=["Resolution executed (demo)."]; return { units:state.units, dislodged:[], bouncesAt:[], log }; }

function resolveMovementPhase(state) {
  const log = [];
  // Work on a copy so we can return new positions
  const units = state.units.map(u => ({ ...u }));
  const unitById = new Map(units.map(u => [u.id, u]));

  // Collect candidate moves that are adjacent & legal
  const moveTarget = new Map();
  for (const [uid, ord] of Object.entries(state.orders || {})) {
    const u = unitById.get(uid);
    if (!u) continue;
    if (ord.type === 'MOVE' && ord.targetProv && canMove(u, ord.targetProv)) {
      moveTarget.set(uid, ord.targetProv);
    }
  }

  // Group attackers by destination
  const attackers = new Map(); // dest -> [uids]
  for (const [uid, dest] of moveTarget.entries()) {
    const list = attackers.get(dest) || [];
    list.push(uid);
    attackers.set(dest, list);
  }

  // Initial success set: destinations with exactly one attacker
  let success = new Set(
    [...moveTarget.entries()]
      .filter(([uid, dest]) => (attackers.get(dest) || []).length === 1)
      .map(([uid]) => uid)
  );

  // Rule: head-to-head swap (A->B and B->A) bounces both
  for (const uid of [...success]) {
    const from = unitById.get(uid).prov;
    const dest = moveTarget.get(uid);
    const defender = units.find(x => x.prov === dest);
    if (defender) {
      const defMove = moveTarget.get(defender.id);
      if (defender && defMove === from && success.has(defender.id)) {
        success.delete(uid);
        success.delete(defender.id);
        log.push(`Swap bounce: ${uid} ${from} ↔ ${defender.id} ${dest}`);
      }
    }
  }

  // Blocking: attacker cannot enter if original occupant is not leaving successfully
  let changed;
  do {
    changed = false;
    for (const uid of [...success]) {
      const dest = moveTarget.get(uid);
      const occ = units.find(x => x.prov === dest && x.id !== uid);
      if (occ && !success.has(occ.id)) {
        success.delete(uid);
        log.push(`Bounce at ${dest}: ${uid} blocked by ${occ.id}`);
        changed = true;
      }
    }
  } while (changed);

  // Apply successful moves, log failures
  for (const [uid, dest] of moveTarget.entries()) {
    const u = unitById.get(uid);
    if (success.has(uid)) {
      log.push(`${u.id} → ${dest}`);
      u.prov = dest;
    } else {
      log.push(`${u.id} fails to move to ${dest}`);
    }
  }

  const bouncedDestinations = [...new Set(
    [...attackers.entries()].filter(([, arr]) => arr.length > 1).map(([d]) => d)
  )];

  return {
    units: [...unitById.values()],
    dislodged: [],          // not computed in this minimal engine
    bouncesAt: bouncedDestinations,
    log
  };
}

function computeRetreatOptions(state,res){ return new Map(); }
function applyRetreats(state,ret){ return state.units; }
function updateSupplyOwnership(state){ return state.ownership; }
function computeAdjustments(state){ return { deltas:new Map(), buildSlots:new Map() }; }

// Export helpers
window.canMove = canMove; window.PHASES = PHASES; window.resolveMovementPhase = resolveMovementPhase; window.computeRetreatOptions = computeRetreatOptions; window.applyRetreats = applyRetreats; window.updateSupplyOwnership = updateSupplyOwnership; window.computeAdjustments = computeAdjustments;
