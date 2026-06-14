import React from 'react';
import { HashGeneratorUI } from './ui';
import { generateHashes } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function HashGeneratorTool() {
  const { run, isLoading, data, error } = useToolRunner(generateHashes, 'HashGeneratorTool');
  
  return <HashGeneratorUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
