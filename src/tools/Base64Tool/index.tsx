import React from 'react';
import { Base64UI } from './ui';
import { processBase64 } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function Base64Tool() {
  const { run, isLoading, data, error } = useToolRunner(processBase64, 'Base64Tool');
  
  return <Base64UI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
