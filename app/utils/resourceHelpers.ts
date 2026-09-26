/**
 * Shared helpers for reading API responses that may be in either of two shapes.
 *
 * Why this exists:
 * `/api/resources` used to return a bare array. It now returns
 * `{ success: true, data: [...] }`. Several endpoints may or may not have
 * been migrated to this envelope, and it's easy for that to drift again in
 * the future without every frontend call site being updated in lockstep.
 * These helpers make every fetch call defensive to both shapes so a backend
 * envelope change degrades gracefully instead of crashing the page with
 * "TypeError: x is not iterable".
 *
 * Resources also used to store a comma-separated `keywords` string and now
 * store a `tags: string[]` array on at least some endpoints. getResourceTags
 * reads whichever is present.
 */

/** Unwraps a list response: accepts a bare array or { data: [...] }. */
export function unwrapList<T = any>(json: any): T[] {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
}

/** Unwraps a single-object response: accepts a bare object or { data: {...} }. */
export function unwrapObject<T = any>(json: any): T | null {
  if (!json) return null;
  if (
    typeof json === "object" &&
    !Array.isArray(json) &&
    "data" in json &&
    json.data &&
    typeof json.data === "object" &&
    !Array.isArray(json.data)
  ) {
    return json.data as T;
  }
  return json as T;
}

/**
 * Returns a resource's tags as a string array, whether the resource has a
 * `tags` array (new shape) or a `keywords` comma-separated string (old shape).
 */
export function getResourceTags(resource: {
  tags?: string[] | null;
  keywords?: string | null;
}): string[] {
  if (Array.isArray(resource?.tags)) {
    return resource.tags.filter(Boolean);
  }
  if (typeof resource?.keywords === "string") {
    return resource.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}
