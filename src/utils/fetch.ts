export async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeout: number = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort();
    console.log(`Request timed out for URL: ${resource}`);
  }, timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
