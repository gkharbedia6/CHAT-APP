import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...input: ClassValue[]) {
  return twMerge(clsx(...input));
}

export function chatHrefConstructor(idOne: string, idTwo: string) {
  const sorderIds = [idOne, idTwo].sort();
  return `${sorderIds[0]}--${sorderIds[1]}`;
}

export function toPusherKey(key: string) {
  return key.replace(/:/g, '__');
}
