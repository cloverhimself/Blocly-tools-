import React from 'react';
import { CompressAudioUI } from './ui';
import { compressAudio } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function CompressAudioTool() {
  const { run, isLoading, data, error, reset } = useToolRunner(compressAudio, 'CompressAudioTool');
  
  return <CompressAudioUI runTool={run} isLoading={isLoading} data={data} error={error} reset={reset} />;
}
