export type UserTestCase = {
  userName: string;
  caseSuccesses: {
    caseName: string;
    info: string;
  }[];
  caseFails: {
    caseName: string;
    reason: string;
  }[];
  buildSuccesses: {
    caseName: string;
    info: string;
  }[];
  buildFails: {
    caseName: string;
    reason: string;
  }[];
  testSuccesses: {
    caseName: string;
    info: string;
  }[];
  testFails: {
    caseName: string;
    reason: string;
  }[];
}

export type RunTaMultipleTestCaseResponse = UserTestCase
