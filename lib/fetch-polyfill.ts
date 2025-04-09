// This file provides a polyfill for fetch in environments where it's not available
// or when using libraries that expect a specific version of fetch

// Node-fetch v3 is ESM only, so we need to use dynamic import
import('node-fetch').then(({ default: nodeFetch }) => {
  // Check if fetch is already defined globally
  if (typeof global.fetch !== 'function') {
    // @ts-ignore - Assign node-fetch to global fetch
    global.fetch = nodeFetch;
    // @ts-ignore - Assign Headers, Request, Response to global
    global.Headers = nodeFetch.Headers;
    // @ts-ignore
    global.Request = nodeFetch.Request;
    // @ts-ignore
    global.Response = nodeFetch.Response;
  }
}).catch(err => {
  console.error('Failed to load node-fetch:', err);
});

// Export a dummy function to avoid TypeScript errors
export default function setupFetchPolyfill() {
  // This function is just a placeholder
  return true;
}
