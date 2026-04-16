import { nanoid } from 'nanoid';

export function generatePeerId() {
  return nanoid(10);
}
