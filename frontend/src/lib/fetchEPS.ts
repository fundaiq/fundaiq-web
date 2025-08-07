// fetchEPS.ts
export async function fetchEPS(assumptions) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project-eps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assumptions),
  });
  return await res.json();
}
