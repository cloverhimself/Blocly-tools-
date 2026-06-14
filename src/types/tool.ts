export interface ToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    duration?: number;
    toolName?: string;
    [key: string]: any;
  };
}

export interface ToolExecutionState<T = any> {
  status: 'idle' | 'running' | 'success' | 'error';
  result: ToolResponse<T> | null;
}
