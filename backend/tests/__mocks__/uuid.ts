let counter = 0;

export function v4(): string {
  counter++;
  return `mock-uuid-${counter}`;
}

export function v1(): string {
  counter++;
  return `mock-uuid-v1-${counter}`;
}

export const NIL = '00000000-0000-0000-0000-000000000000';
export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

export default { v4, v1, NIL, MAX };
