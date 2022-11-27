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

export type BuildResponse = {
  resourceId: string;
}

export type SingleTestIORequest = {
  resourceId: string;
  input: string;
  output: string;
}

export type BuildResult = BuildFail | BuildSuccess;
