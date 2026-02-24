function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeEnv(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

export function getAppBaseUrl(): string {
  const configured = normalizeEnv(import.meta.env.VITE_APP_URL);
  if (configured) {
    return stripTrailingSlash(configured);
  }

  return stripTrailingSlash(window.location.origin);
}

export function appUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}
