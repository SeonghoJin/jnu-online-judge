import { FailOrSuccess } from './domain';

export type UserSingleTestCase = {
  userName: string;
  buildResult?: FailOrSuccess;
  testResult?: FailOrSuccess[];
}

export type RunTaSingleTestCaseResponse = UserSingleTestCase;
