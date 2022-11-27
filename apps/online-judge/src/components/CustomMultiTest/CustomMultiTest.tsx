// @flow
import * as React from 'react';
import AutoSaveTextArea from "../AutoSaveTextArea";
import {FileInput} from "../FileInput/FileInput";
import {BuildResponse, isBuildSuccessResponse} from "@online-judge/domain";
import {apiService} from "../../service/ApiService";
import {useState} from "react";

export const CustomMultiTest = () => {
  const [buildResult, setBuildResult] = useState<undefined | {status: boolean, reason?: string}>(undefined);
  const [testResult, setTestResult] = useState<undefined | {status: boolean, reason?: string}>(undefined);


  return (
    <>
      "아직 없음여"
      {/*input*/}
      {/*<AutoSaveTextArea*/}
      {/*  saveId={'multi-input'}*/}
      {/*  onError={() => {}}*/}
      {/*  style={{*/}
      {/*    width: 100,*/}
      {/*    height: 100,*/}
      {/*  }}*/}
      {/*/>*/}
      {/*output*/}
      {/*<AutoSaveTextArea*/}
      {/*  saveId={'multi-output'}*/}
      {/*  onError={() => {}}*/}
      {/*  style={{*/}
      {/*    width: 100,*/}
      {/*    height: 100,*/}
      {/*  }}*/}
      {/*/>*/}
      {/*<FileInput*/}
      {/*  uppyId={'multi-cpp-files'}*/}
      {/*  onUploadSuccess={async ({response}) => {*/}
      {/*    const body = response?.body as BuildResponse;*/}

      {/*    if(isBuildSuccessResponse(body)) {*/}
      {/*      setBuildResult({*/}
      {/*        status: true*/}
      {/*      });*/}
      {/*      apiService.runTestCaseWithIO.abort();*/}
      {/*      const { resourceId } = body;*/}

      {/*      const {result} = await apiService.runTestCaseWithIO({*/}
      {/*        resourceId,*/}
      {/*        input: localStorage.getItem('single-input') ?? '',*/}
      {/*        output: localStorage.getItem('single-output') ?? ''*/}
      {/*      });*/}

      {/*      return;*/}
      {/*    }*/}

      {/*    setBuildResult({*/}
      {/*      status: false,*/}
      {/*      reason: body.reason*/}
      {/*    });*/}
      {/*}}/>*/}
    </>
  );
};
