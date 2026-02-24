function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getAppBaseUrl(): string {
  const configured = import.meta.env.VITE_APP_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  return stripTrailingSlash(window.location.origin);
}

export function appUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}
