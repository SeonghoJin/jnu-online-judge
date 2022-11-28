import { Fail, Success } from './domain';

type TestCaseSuccessResponse = Success
type TestCaseFailResponse = Fail

export type RunMultipleTestCaseResponse = {
  successes: TestCaseSuccessResponse[];
  fails: TestCaseFailResponse[]
}
