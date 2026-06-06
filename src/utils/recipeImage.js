import apiClient from '../api/client';

const normalizeSlashes = (value) => value.replace(/\\/g, '/');

const getApiOrigin = () => {
  try {
    return new URL(apiClient.defaults.baseURL).origin;
  } catch {
    return (apiClient.defaults.baseURL || '').replace(/\/+$/, '');
  }
};

const joinUrl = (base, path) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

const ensureHttpsWhenPossible = (value, apiOrigin) => {
  if (!value.startsWith('http://')) return value;
  if (apiOrigin.startsWith('https://')) {
    return value.replace(/^http:\/\//i, 'https://');
  }
  return value;
};

const encodePathSafely = (value) => {
  try {
    return encodeURI(value);
  } catch {
    return value;
  }
};

export const normalizeRecipeImageUrl = (value) => {
  if (!value || typeof value !== 'string') return value;

  const apiOrigin = getApiOrigin();
  const normalized = normalizeSlashes(value.trim());

  if (!normalized) return normalized;

  const uploadsIndex = normalized.toLowerCase().indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    const uploadsPath = normalized.slice(uploadsIndex);
    return encodePathSafely(joinUrl(apiOrigin, uploadsPath));
  }

  if (/^https?:\/\//i.test(normalized)) {
    const withoutLocalhost = normalized.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      apiOrigin,
    );
    return encodePathSafely(ensureHttpsWhenPossible(withoutLocalhost, apiOrigin));
  }

  if (normalized.startsWith('uploads/')) {
    return encodePathSafely(joinUrl(apiOrigin, normalized));
  }

  if (normalized.startsWith('/')) {
    return encodePathSafely(joinUrl(apiOrigin, normalized));
  }

  if (/^[^/]+\.(png|jpe?g|webp|gif)$/i.test(normalized)) {
    return encodePathSafely(joinUrl(apiOrigin, `/uploads/recipes/${normalized}`));
  }

  return encodePathSafely(normalized);
};

export const getRecipeImageUrl = (recipe) =>
  normalizeRecipeImageUrl(recipe?.photo ?? recipe?.image_url);