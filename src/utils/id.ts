import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const generateShortId = (id: string): string => id.slice(0, 4);