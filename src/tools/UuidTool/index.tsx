import React from 'react';
import { UuidToolUI } from './ui';
import { generateUuids, generateUuidsLocal } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function UuidTool() {
  const { run, isLoading, data, error } = useToolRunner(generateUuids, 'UuidTool');
  
  return <UuidToolUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
