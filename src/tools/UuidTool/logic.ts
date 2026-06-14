import { UuidInput, UuidOutput } from './types';

export async function generateUuids(input: UuidInput): Promise<UuidOutput> {
  if (input.count < 1 || input.count > 1000) {
    throw new Error('Count must be between 1 and 1000');
  }

  // v1 is not natively supported by crypto API easily in browser without a library,
  // making a fallback proxy to the backend or use a simple v4 logic.
  // We'll proxy to backend since we created a backend for this.
  
  const response = await fetch('/api/v1/uuid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: input.version, count: input.count })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate UUIDs');
  }

  return data.data.uuids;
}

export function generateUuidsLocal(input: UuidInput): UuidOutput {
  if (input.count < 1 || input.count > 1000) {
    throw new Error('Count must be between 1 and 1000');
  }

  if (input.version === 'v1') {
    throw new Error('v1 is only supported via backend currently, use remote tool');
  }

  return Array.from({ length: input.count }, () => crypto.randomUUID());
}
