/**
 * @file avatars.ts
 * Available avatar emoji options for player profiles
 */

export const avatars: readonly string[] = [
  '🧙‍♂️',
  '⚔️',
  '🛡️',
  '🧝',
  '🤖',
  '🐉',
  '👨‍🚀',
  '👑',
  '🧛',
  '🧟',
  '🦸‍♂️',
  '🦊',
] as const;

export type Avatar = (typeof avatars)[number];

/**
 * Validate if a string is a valid avatar
 */
export function isValidAvatar(avatar: string): avatar is Avatar {
  return avatars.includes(avatar as Avatar);
}
