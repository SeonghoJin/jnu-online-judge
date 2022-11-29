// @flow
import * as React from 'react';
import {UserSingleTestCase, UserTestCase} from "@online-judge/domain";

type Props = {
 userSingleTestCase: UserSingleTestCase,
};

export const UserSingleTestCaseView = ({userSingleTestCase}: Props) => {

  const {
    userName, testResult, buildResult
  } = userSingleTestCase;

  const buildResultView = () => {
    if(buildResult?.status == 'success'){
      return <>빌드 성공</>
    }

    if(buildResult?.status === 'fail') {
      return <>
        빌드 실패
        <br/>
        {buildResult?.reason?.toString() ?? ''}
      </>
    }

    return '';
  }

  return (
    <div>
      {userName} 결과
      <br/>
      Build 결과
      <br/>
        {buildResultView()}
      <br/>
      Test 결과
      <br/>
      <br/>
      실패한 테스트들
      <br/>
      {testResult?.map((test, index) => {
        if(test.status === 'fail') {
          return <>
            <br/>
            {index + 1} 테스트 실패
            <br/>
            {test.reason}
            <br/>
          </>
        }
        return <></>
      })}
      <br/>
    </div>
  );
};
