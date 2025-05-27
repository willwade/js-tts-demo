'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function WasmTest() {
  const [wasmExists, setWasmExists] = useState<boolean | null>(null);
  const [wasmContent, setWasmContent] = useState<string | null>(null);
  
  const checkWasm = async () => {
    try {
      const response = await fetch('/sherpaonnx-wasm/piper_en_US_amy.js');
      setWasmExists(response.ok);
      
      if (response.ok) {
        const content = await response.text();
        setWasmContent(content.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error('Error checking WebAssembly file:', error);
      setWasmExists(false);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>WebAssembly Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkWasm}>Check WebAssembly File</Button>
        
        {wasmExists === null && (
          <p className="mt-2">Click the button to check if the WebAssembly file exists.</p>
        )}
        
        {wasmExists === true && (
          <div className="mt-2">
            <p className="text-green-500">WebAssembly file exists!</p>
            <p className="text-sm mt-2">Content preview:</p>
            <pre className="text-xs mt-1 p-2 bg-gray-100 rounded">{wasmContent}</pre>
          </div>
        )}
        
        {wasmExists === false && (
          <p className="mt-2 text-red-500">WebAssembly file does not exist!</p>
        )}
      </CardContent>
    </Card>
  );
}
