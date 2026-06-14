import React from 'react';
import { RegexTesterUI } from './ui';
import { testRegex } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function RegexTesterTool() {
  const { run, isLoading, data, error } = useToolRunner(testRegex, 'RegexTesterTool');
  
  return <RegexTesterUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
