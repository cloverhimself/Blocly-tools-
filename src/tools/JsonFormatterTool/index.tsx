import React from 'react';
import { JsonFormatterUI } from './ui';
import { formatJson } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function JsonFormatterTool() {
  const { run, isLoading, data, error } = useToolRunner(formatJson, 'JsonFormatterTool');
  
  return <JsonFormatterUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
