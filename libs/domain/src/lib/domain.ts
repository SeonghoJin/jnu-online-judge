export type ScoreView = 'multi' | 'single' | 'ta-score';
export const ScoreViewNaming: {
  [P in ScoreView] : string;
} = {
  multi: "테스트 여러개",
  single: "테스트 한개",
  "ta-score": "TA 채점"
} as const;

export const isScoreViewType = (value: unknown) : value is ScoreView => {
  if(typeof value !== 'string') {
    return false;
  }

  return value === 'multi' || value === 'single' || value === 'ta-score';
}

export type UploadMultiTestResponse = {
  resources: {
    folderName: string;
    testName: string;
  }[];
}

export type BuildRequest = {
  path: string;
}

export type BuildSuccess = {
  result: 'success',
  path: string;
}

export type BuildFail = {
  result: 'fail'
 reason: string;
 path: string;
}

export type BuildSuccessResponse = {
  resourceId: string;
};

export type BuildFailResponse = {
  reason: string;
};

export type BuildResponse = BuildSuccessResponse | BuildFailResponse;

export const isBuildSuccessResponse = (obj: any): obj is BuildSuccessResponse => {
  if(obj === null){
    return false;
  }

  if(typeof obj === 'object' && obj.resourceId){
      return true;
  }

  return false;
}

export type SingleTestIORequest = {
  resourceId: string;
  input: string;
  output: string;
}

export type SingleTestIOSuccessResponse = Success & {
  answer: string;
  target: string;
}

export type SingleTestIOFailResponse = Fail

export type SingleTestIOResponse = SingleTestIOSuccessResponse | SingleTestIOFailResponse;


export type BuildResult = BuildFail | BuildSuccess;

export type Fail = {
  status: 'fail',
  reason?: string;
}

export type Success = {
  status: 'success'
  info?: string;
}

export type FailOrSuccess = Fail | Success;

export type MultiTestBuildRequest = {
  buildFolderPaths: string[];
}

export type MultiTestBuildResponse = {
  fails: (BuildFail & {
    resourceId: string;
    testCaseName: string;
  })[];
  successes: (BuildSuccess & {
    resourceId: string;
    testCaseName: string;
  })[];
};
