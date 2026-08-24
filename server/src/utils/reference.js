import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export function generateBookingReference() {
  return `SHR-${nanoid()}`;
}
