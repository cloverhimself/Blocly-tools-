import React from 'react';
import { TimestampConverterUI } from './ui';
import { convertTimestamp } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function TimestampConverterTool() {
  const { run, isLoading, data, error } = useToolRunner(convertTimestamp, 'TimestampConverterTool');
  
  return <TimestampConverterUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
