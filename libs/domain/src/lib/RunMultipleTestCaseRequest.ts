type TestCaseRequest = {
   input: string;
   output: string;
   resourceId: string;
}

export type RunMultipleTestCaseRequest = TestCaseRequest[]
