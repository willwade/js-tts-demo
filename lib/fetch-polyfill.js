/**
 * This file provides a polyfill for fetch in Node.js environments
 */

// Import node-fetch v2 (CommonJS compatible)
const nodeFetch = require('node-fetch');

// Check if we're in a Node.js environment
if (typeof window === 'undefined') {
  // Check if fetch is already defined globally
  if (typeof global.fetch !== 'function') {
    console.log('Setting up fetch polyfill for Node.js environment');
    
    // Assign node-fetch to global fetch
    global.fetch = nodeFetch;
    
    // Assign Headers, Request, Response to global
    global.Headers = nodeFetch.Headers;
    global.Request = nodeFetch.Request;
    global.Response = nodeFetch.Response;
    
    console.log('Fetch polyfill installed successfully');
  }
}

// Export the fetch function
module.exports = nodeFetch;
