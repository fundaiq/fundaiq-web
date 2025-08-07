// fetchDCF.ts
export async function fetchDCF(assumptions) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assumptions),
  });
  return await res.json();
}
