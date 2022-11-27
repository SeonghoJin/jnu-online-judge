// @flow
import * as React from 'react';
import {Dashboard} from "@uppy/react";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css'
import {makeTry} from "make-try";
import {BuildResponse} from "@online-judge/domain";
import {apiService} from "../../service/ApiService";

type Props = {

};

const uppyInstance = new Uppy({
  id: 'files',
  restrictions: {
    allowedFileTypes: [
      '.cpp',
      '.h',
      '.hpp',
      '.c'
    ]
  },
}).use(XHRUpload, {
  endpoint: 'http://localhost:3333/upload',
  bundle: true,
  fieldName: 'file',
  formData: true,
});

const runTestCase = makeTry(async (params: {
  resourceId: string;
  input: string;
  output: string;
}) => {
  const result = await apiService.runTestCaseWithIO(params);
  return result;
}, {
  abort: true,
})


uppyInstance.on('upload-success', async (file, response) => {
  const body = response.body as BuildResponse;

  runTestCase.abort();

  const {result, err, hasError} = await runTestCase({
    resourceId: body.resourceId,
    input: '',
    output: ''
  });

  console.log(result);
})

export const FileInput = (props: Props) => {
  // React.useEffect(() => {
    // return () => uppy.close({ reason: 'unmount' })
  // }, [uppy])


  return <Dashboard
    uppy={uppyInstance}
  />
};
