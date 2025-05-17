/**
 * Common utility functions shared across the application
 */

/**
 * Formats a Date object to ISO string without milliseconds
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('.')[0] + 'Z';
};

/**
 * Handles promise rejections in a consistent way
 */
export const handleAsync = <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
  return promise
    .then((data): [null, T] => [null, data])
    .catch((error): [Error, null] => [error, null]);
};
