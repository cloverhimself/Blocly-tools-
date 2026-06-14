import { SqlFormatterInput, SqlFormatterOutput } from './types';
import { format } from "sql-formatter";

export function formatSql(input: SqlFormatterInput): SqlFormatterOutput {
  if (!input.sql.trim()) {
    return '';
  }

  try {
    return format(input.sql, { language: input.dialect as any, keywordCase: "upper" });
  } catch (err: any) {
    throw new Error(err.message || 'Invalid SQL syntax');
  }
}
