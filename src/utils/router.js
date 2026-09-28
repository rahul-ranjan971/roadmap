import { useState, useEffect, useCallback } from 'react';

export function normalizePath(pathname = (typeof window !== 'undefined' ? window.location.pathname : '/')) {
  let path = pathname || '/';
  if (path.startsWith('/roadmap')) {
    path = path.slice('/roadmap'.length) || '/';
  }
  // Strip trailing slashes except for root
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path || '/';
}

export function getCurrentPath() {
  if (typeof window === 'undefined') return '/';
  return normalizePath(window.location.pathname);
}

export function navigate(path, { replace = false } = {}) {
  if (typeof window === 'undefined') return;
  const base = window.location.pathname.startsWith('/roadmap') ? '/roadmap' : '';
  const target = `${base}${path}`.replace(/\/+/g, '/');
  if (replace) {
    window.history.replaceState({}, '', target);
  } else {
    window.history.pushState({}, '', target);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePath() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => {
      setPath(getCurrentPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goTo = useCallback((targetPath, options) => {
    navigate(targetPath, options);
  }, []);

  return [path, goTo];
}
