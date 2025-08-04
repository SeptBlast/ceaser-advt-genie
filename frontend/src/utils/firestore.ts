/**
 * Firestore utility functions for safe data operations
 * Prevents undefined values that cause Firestore errors
 */

/**
 * Cleans an object by removing undefined values recursively
 * Firestore doesn't accept undefined values, so this ensures compatibility
 *
 * @param data - Object to clean
 * @returns Cleaned object with no undefined values
 */
export const cleanFirestoreData = <T extends Record<string, any>>(
  data: T
): Partial<T> => {
  const cleaned: Partial<T> = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value !== undefined) {
      if (
        value === null ||
        typeof value !== "object" ||
        value instanceof Date
      ) {
        // Primitive values, null, or Date objects - keep as is
        (cleaned as any)[key] = value;
      } else if (Array.isArray(value)) {
        // Arrays - clean each element if it's an object
        (cleaned as any)[key] = value.map((item) =>
          typeof item === "object" && item !== null && !(item instanceof Date)
            ? cleanFirestoreData(item)
            : item
        );
      } else {
        // Nested objects - recursively clean
        (cleaned as any)[key] = cleanFirestoreData(value);
      }
    }
  });

  return cleaned;
};

/**
 * Type-safe wrapper for creating user profiles with Firestore compatibility
 * Ensures all fields are properly typed and cleaned
 */
export const createFirestoreUserProfile = (user: any) => {
  return cleanFirestoreData({
    uid: user.uid || "",
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || null, // Use null instead of undefined
    emailVerified: user.emailVerified || false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    aiModels: {},
    mediaModels: {},
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 8,
      trustedDevices: [],
    },
    preferences: {
      theme: "system" as const,
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        marketing: false,
      },
    },
  });
};

/**
 * Validates that an object doesn't contain undefined values
 * Useful for debugging Firestore data issues
 */
export const validateFirestoreData = (data: any, path = ""): string[] => {
  const errors: string[] = [];

  Object.keys(data).forEach((key) => {
    const value = data[key];
    const currentPath = path ? `${path}.${key}` : key;

    if (value === undefined) {
      errors.push(`Undefined value found at: ${currentPath}`);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Date) &&
      !Array.isArray(value)
    ) {
      errors.push(...validateFirestoreData(value, currentPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (
          typeof item === "object" &&
          item !== null &&
          !(item instanceof Date)
        ) {
          errors.push(
            ...validateFirestoreData(item, `${currentPath}[${index}]`)
          );
        } else if (item === undefined) {
          errors.push(`Undefined value found at: ${currentPath}[${index}]`);
        }
      });
    }
  });

  return errors;
};
