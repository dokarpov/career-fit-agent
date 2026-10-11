export function validateVault(items) {
  if (!Array.isArray(items)) return { ok:false, errors:["Vault must be an array."] };
  const errors = [];
  items.forEach((x,i)=>{
    ["id","title","claim","evidence","status"].forEach(k=>{
      if (!x?.[k]) errors.push(`Item ${i}: missing ${k}`);
    });
  });
  return { ok:errors.length===0, errors };
}

export function publicVault(items) {
  return items.filter(x => x.visibility === "public" || x.visibility === "public-safe");
}

export function mergeVault(base, extra) {
  const map = new Map();
  [...base, ...extra].forEach(x => map.set(x.id, x));
  return [...map.values()];
}
