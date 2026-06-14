import React from 'react';
import { SqlFormatterUI } from './ui';
import { formatSql } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function SqlFormatterTool() {
  const { run, isLoading, data, error } = useToolRunner(formatSql, 'SqlFormatterTool');
  
  return <SqlFormatterUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
