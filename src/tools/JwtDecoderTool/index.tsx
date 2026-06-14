import React from 'react';
import { JwtDecoderUI } from './ui';
import { decodeJwt } from './logic';
import { useToolRunner } from '../../hooks/useToolRunner';

export default function JwtDecoderTool() {
  const { run, isLoading, data, error } = useToolRunner(decodeJwt, 'JwtDecoderTool');
  
  return <JwtDecoderUI runTool={run} isLoading={isLoading} data={data} error={error} />;
}
