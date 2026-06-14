import React from 'react';
import { UrlEncoderUI } from './ui';
import { processUrl } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function UrlEncoderTool() {
  const { run, isLoading, data, error } = useToolRunner(processUrl, 'UrlEncoderTool');
  
  return <UrlEncoderUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
