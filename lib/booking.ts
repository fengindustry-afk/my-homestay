export const BLOCKING_STATUSES: string[] = ['paid', 'confirmed'];

export const TENTATIVE_STATUS: string = 'pending';

export const HOLD_HOURS = 24;

export function isBlockingStatus(status: string | null | undefined): boolean {
  return status === 'paid' || status === 'confirmed';
}

export function isHoldActive(
  createdAtIso: string | Date | null | undefined,
  now: Date = new Date()
): boolean {
  if (createdAtIso == null) return false;
  const created = createdAtIso instanceof Date ? createdAtIso : new Date(createdAtIso);
  const createdMs = created.getTime();
  if (Number.isNaN(createdMs)) return false;
  const ageMs = now.getTime() - createdMs;
  const holdMs = HOLD_HOURS * 60 * 60 * 1000;
  return ageMs <= holdMs;
}
