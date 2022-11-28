// @flow
import * as React from 'react';
import {UserTestCase} from "@online-judge/domain";

type Props = {
 userTestCase: UserTestCase,
 testCaseCount: number;
};

export const UserTestCaseView = ({userTestCase, testCaseCount}: Props) => {

  const {
    userName,
    testSuccesses,
    testFails,
    caseFails,
    caseSuccesses,
    buildSuccesses,
    buildFails
  } = userTestCase;

  const failTestCount = [
    ...new Set(testFails.map((fail) => fail.caseName)),
    ...new Set(buildFails.map((fail) => fail.caseName)),
    ...new Set(caseFails.map((fail) => fail.caseName))
  ].length;

  return (
    <div>
      {userName} 결과
      <br/>
      TestCase 유무 결과
      <br/>
      케이스가 없음: {caseFails.map((fail) => fail.caseName).join(' ')}
      <br/>
      Build 결과
      빌드 실패:
      <br/>
      {buildFails.map((fail) => {
        return <>
          {fail.caseName} 실패
          <br/>
          {fail.caseName} 실패원인: {fail.reason}
        </>
      })}
      <br/>
      Test 결과
      <br/>
      통과한 테스트 갯수: {(testCaseCount - failTestCount)} / {testCaseCount}
      <br/>
      실패한 테스트들
      <br/>
      {testFails.map((fail) => {
        return <>
          <br/>
          {fail.caseName} 실패
          <br/>
          {fail.caseName} 실패원인: {fail.reason}
        </>
      })}
      <br/>
    </div>
  );
};
