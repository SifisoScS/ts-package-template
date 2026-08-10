/**
 * Placeholder entry point. Replace this file with your package's real API.
 *
 * It exists so the toolchain has something to compile, lint, type-check and
 * cover from the first commit — a template whose checks are vacuous teaches you
 * nothing about whether they work.
 */

/**
 * Greets someone by name.
 * @param name - The name to greet. Must not be blank.
 * @returns A greeting.
 * @throws {Error} If name is blank.
 */
export function greet(name: string): string {
  if (name.trim() === '') {
    throw new Error('Invalid name: must not be blank.');
  }

  return `Hello, ${name}!`;
}
