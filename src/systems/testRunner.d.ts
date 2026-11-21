export interface TestResult {
  phase: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface TestRunnerOutput {
  results: TestResult[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  summary: string;
}

export function runTests(
  code: string,
  mission: unknown
): Promise<TestRunnerOutput>;
