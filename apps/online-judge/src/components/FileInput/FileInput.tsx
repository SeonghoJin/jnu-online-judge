// @flow
import * as React from 'react';
import {Dashboard} from "@uppy/react";
import Uppy, {FailedUppyFile, UploadedUppyFile} from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css'
import {useEffect, useMemo} from "react";

type Props = {
  onUploadSuccess: (response: FailedUppyFile<Record<string, unknown>, Record<string, unknown>> | UploadedUppyFile<Record<string, unknown>, Record<string, unknown>>) => void;
  uppyId: string;
  uploadUrl: string;
  allowedFileTypes: string[]
};

export const FileInput = ({onUploadSuccess, uppyId, uploadUrl, allowedFileTypes}: Props) => {

  const uppyInstance = useMemo(() => {
    return new Uppy({
      id: uppyId,
      restrictions: {
        allowedFileTypes: allowedFileTypes
      },
    }).use(XHRUpload, {
      endpoint: `http://localhost:3333/${uploadUrl}`,
      bundle: true,
      fieldName: 'file',
      formData: true,
    });
  }, [allowedFileTypes, uploadUrl, uppyId])

  useEffect(() => {
    uppyInstance.on('complete', (result) => {
      if(result.failed.length > 0){
        onUploadSuccess(result.failed[0]);
        return;
      }

      onUploadSuccess(result.successful[0])
    })

    return () => {
      uppyInstance.off('complete', () => {});
    }
  }, [onUploadSuccess, uppyInstance]);


  return <Dashboard
    uppy={uppyInstance}
  />
};
