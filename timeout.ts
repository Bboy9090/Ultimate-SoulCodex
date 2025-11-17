/**
 * Utility for running async operations with timeout and timing
 */

// Configurable timeout values (milliseconds)
export const TIMEOUT_VALUES = {
  LIGHTWEIGHT_CALC: 3000,      // 3s for lightweight HTTP calculators
  HEAVY_CALC: 5000,             // 5s for heavy external aggregations
  SABIAN_SYMBOLS: 4000,         // 4s for Sabian Symbols
  GEMINI_BIOGRAPHY: 8000,       // 8s for Gemini biography
  GEMINI_DAILY_GUIDANCE: 5000,  // 5s for Gemini daily guidance
  REQUEST_TOTAL: 15000,         // 15s overall request limit
} as const;

interface TimingResult<T> {
  result: T;
  duration: number;
  timedOut: boolean;
}

/**
 * Run an async function with a timeout and automatic timing/logging
 * @param label Label for logging (e.g., "Gemini Biography")
 * @param timeoutMs Timeout in milliseconds
 * @param fn Async function to execute
 * @param fallback Fallback value to return on timeout
 * @returns Promise that resolves with result or fallback
 */
export async function runWithTimeoutAndTiming<T>(
  label: string,
  timeoutMs: number,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  const startTime = Date.now();
  let timerId: NodeJS.Timeout | null = null;
  let timedOut = false;
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        timedOut = true;
        reject(new Error(`Timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    const result = await Promise.race([fn(), timeoutPromise]);
    const duration = Date.now() - startTime;
    
    console.log(`[${label}] ✓ Completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (timedOut || (error instanceof Error && error.message.includes('Timeout'))) {
      console.warn(`[${label}] ⚠ Timeout after ${duration}ms - using fallback`);
    } else {
      console.error(`[${label}] ✗ Error after ${duration}ms:`, error);
    }
    
    return fallback;
  } finally {
    // Always clear the timeout to prevent unhandled rejection
    if (timerId !== null) {
      clearTimeout(timerId);
    }
  }
}

/**
 * Run multiple async operations in parallel with individual timeouts
 * @param operations Array of {label, timeoutMs, fn, fallback} objects
 * @returns Promise that resolves with array of results
 */
export async function runMultipleWithTimeouts<T>(
  operations: Array<{
    label: string;
    timeoutMs: number;
    fn: () => Promise<T>;
    fallback: T;
  }>
): Promise<T[]> {
  return Promise.all(
    operations.map(op => 
      runWithTimeoutAndTiming(op.label, op.timeoutMs, op.fn, op.fallback)
    )
  );
}

/**
 * Wrap an entire request handler with a timeout watchdog
 * @param handler Request handler function
 * @param timeoutMs Overall timeout for the request
 * @returns Wrapped handler with timeout protection
 */
export function withRequestTimeout<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  timeoutMs: number
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    let completed = false;
    
    // Set up timeout watchdog
    const watchdog = setTimeout(() => {
      if (!completed) {
        const duration = Date.now() - startTime;
        console.error(`[Request Watchdog] Request exceeded ${timeoutMs}ms timeout (${duration}ms elapsed)`);
      }
    }, timeoutMs);
    
    try {
      const result = await handler(...args);
      completed = true;
      clearTimeout(watchdog);
      return result;
    } catch (error) {
      completed = true;
      clearTimeout(watchdog);
      throw error;
    }
  }) as T;
}
