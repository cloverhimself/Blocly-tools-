import { useState, useCallback } from 'react';
import { ToolResponse, ToolExecutionState } from '../types/tool';

export function useToolRunner<TInput, TOutput>(
  toolExecutionFn: (input: TInput) => Promise<TOutput> | TOutput,
  toolName?: string
) {
  const [state, setState] = useState<ToolExecutionState<TOutput>>({
    status: 'idle',
    result: null,
  });

  const run = useCallback(
    async (input: TInput) => {
      setState((prev) => ({ ...prev, status: 'running' }));
      const startTime = performance.now();

      try {
        const data = await Promise.resolve(toolExecutionFn(input));
        const duration = performance.now() - startTime;

        const response: ToolResponse<TOutput> = {
          success: true,
          data,
          meta: { duration, toolName },
        };

        setState({ status: 'success', result: response });
        return response;
      } catch (error: any) {
        const duration = performance.now() - startTime;
        const response: ToolResponse<TOutput> = {
          success: false,
          error: error.message || 'An unexpected error occurred during execution.',
          meta: { duration, toolName },
        };

        setState({ status: 'error', result: response });
        return response;
      }
    },
    [toolExecutionFn, toolName]
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', result: null });
  }, []);

  return {
    run,
    reset,
    state,
    isLoading: state.status === 'running',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    data: state.result?.data,
    error: state.result?.error,
  };
}
