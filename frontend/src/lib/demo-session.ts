const STORAGE_KEY = 'taskflow.demoSessionId';

export function getStoredSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeSessionId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* localStorage indisponível (modo privado): segue sem persistir */
  }
}

export function clearStoredSessionId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
