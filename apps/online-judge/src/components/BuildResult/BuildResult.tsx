// @flow
import * as React from 'react';
import {useMemo} from "react";
import {FailOrSuccess} from "@online-judge/domain";

type Props = {
  data?: FailOrSuccess | FailOrSuccess[]
};

const formatBuildResult = (data: FailOrSuccess, key: any = 0) => {
  if(data?.status === 'success') {
    return <div key={key}>{`[Build] success`}<br/>정보: {`${data?.info}`} </div>
  }
  return <div key={key}>{`[Build] fail`} <br/>원인: {`${data?.reason ?? ''}`}</div>;
}

export const BuildResult = ({data}: Props) => {

  if(data === undefined){
    return <></>;
  }

  if(!Array.isArray(data)) {
    return formatBuildResult(data);
  }

  return <>{data.map((failOrSuccess, index) => formatBuildResult(failOrSuccess, index))}</>;

  return (
    <div>

    </div>
  );
};
