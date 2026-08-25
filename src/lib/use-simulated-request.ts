import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Prototype helpers that emulate the timing of real network calls so every
 * flow can show loading / success / failure UI before a backend exists.
 */
export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface RunOptions {
  /** Force a failure for this run (used by the prototype's failure triggers). */
  fail?: boolean;
  /** Message shown in the error state. */
  failMessage?: string;
  /** Override the default latency for this run. */
  delay?: number;
}

export function useSimulatedRequest(defaultDelay = 1400) {
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const run = useCallback(
    (options: RunOptions = {}) => {
      if (timer.current) clearTimeout(timer.current);
      setError(null);
      setStatus("loading");
      timer.current = setTimeout(() => {
        if (options.fail) {
          setError(options.failMessage ?? "We couldn't complete this request. Please try again.");
          setStatus("error");
        } else {
          setStatus("success");
        }
      }, options.delay ?? defaultDelay);
    },
    [defaultDelay],
  );

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    status,
    error,
    run,
    reset,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  } as const;
}

/** Simple seconds countdown used for OTP resend timers. */
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const restart = useCallback(
    (next = initialSeconds) => setSeconds(next),
    [initialSeconds],
  );

  return { seconds, restart, isFinished: seconds <= 0 } as const;
}

export function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
