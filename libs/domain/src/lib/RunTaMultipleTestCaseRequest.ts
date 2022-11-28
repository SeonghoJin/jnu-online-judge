type IO = {
  input: string;
  output: string;
  id: string;
}

export type TestCase = {
  name: string;
  io: IO[];
}

export type RunTaMultipleTestCaseRequest = {
  userName: string;
  folderName: string;
  testCases: TestCase[];
}
