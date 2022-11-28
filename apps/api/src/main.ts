/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import * as fileUpload from 'express-fileupload';
import * as morgan from 'morgan';
import {UploadedFile} from "express-fileupload";
import {
  BuildFail,
  BuildResult,
  BuildSuccess,
  Fail, FailOrSuccess,
  RunTaMultipleTestCaseRequest,
  Success,
  TestCase, UserTestCase
} from "@online-judge/domain";
import {mkdir, readdir, rename} from 'fs/promises';
import {makeTry} from "make-try";
import {promisify} from "util";
import {exec} from "child_process";
import {formatTestCase} from "./ util/formatTestCase";
import {api} from "@online-judge/domain";
export const moveFile = rename;
import * as AdmZip from 'adm-zip';
import { RunMultipleTestCaseRequest } from '@online-judge/domain';
import { RunMultipleTestCaseResponse } from '@online-judge/domain';
export const run = makeTry(promisify(exec));

const app = express();
const rootPath = process.cwd();

app.use(express.json());
app.use('*', cors());
app.use(morgan('combined'));
app.use(fileUpload({
  tempFileDir : '/upload/'
}));

export const isAssignSubmissionFile = (filename: string) => {
  return filename.includes('_assignsubmission_file_');
}

export const extractHangul = (value: string) => {
  return value.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/gi, "");
}

export const removeHangul = (value: string) => {
  return value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
}

const validateCpp = (filename: string) => {
  const ext = filename.split('.').at(-1) ?? '';
  if(ext === 'cpp'){
    return true;
  }

  if(ext === 'c'){
    return true;
  }

  if(ext === 'hpp') {
    return true;
  }

  return false;
}

const buildCpp = async (folderPath: string): Promise<BuildResult> => {
  const files = await readdir(folderPath);

  const compiler = 'g++';
  const buildTargetName = `${folderPath}/build`;
  const args = `-o ${buildTargetName} -std=c++14`;

  const buildingFiles = files.filter(file => validateCpp(file))
    .map(file => {
      return `${folderPath}/${file}`;
    });

  const command = `${compiler} ${args} ${buildingFiles.join(' ')}`;

  const result = await run(command);

  if(result.hasError) {
    return {
      result: 'fail',
      path: folderPath,
      reason: (result.err as {stderr: string}).stderr,
    }
  }

  return {
    result: 'success',
    path: folderPath
  };
}

const buildCpps = async (folderPaths: string[]) => {
  return await Promise.all(folderPaths.map(folderPath => buildCpp(folderPath)));
}

app.post("/"+api.테스트하나업로드, async (req, res) => {

  if(!req.files || Object.keys(req.files).length === 0){
    return res.status(400).send('No files were uploaded.');
  }

  const files = (() => {
    if(Array.isArray(req.files.file)) {
      return req.files.file;
    }

    return [req.files.file];
  })() as UploadedFile[];

  const resourceId = Date.now();
  const uploadFolderPath = `${rootPath}/static/${resourceId}`;

  try {
    await mkdir(uploadFolderPath);
  } catch (err) {
    res.status(200).send(err);
  }

  await Promise.all(files.map(async file => {
    try {
      await file.mv(`${uploadFolderPath}/${file.name}`);
    } catch (err) {
      return res.status(500).send(err);
    }
  }));

  const build = await buildCpp(uploadFolderPath);

  if(build.result === 'fail'){
    res.status(200).send({
      reason: build.reason
    });
    return;
  }

  if(build.result === 'success'){
    res.status(201).send({
      resourceId
    });
  }
});

app.post(`/${api.빌드여러개}`, async (req, res) => {
  const { folderNames } = req.body;

  const folderPaths = folderNames.map((folderName) => `${rootPath}/static/${folderName}`) as string[];

  const buildResults = await buildCpps(folderPaths);

  const fails = buildResults.filter(({result}) => result === 'fail')
    .map((result) => ({
      ...result,
      path: undefined,
      resourceId: result.path.split('/').at(-1)
    }));

  const successes = buildResults.filter(({result}) => result === 'success')
    .map((result) => ({
      resourceId: result.path.split('/').at(-1)
    }));

  res.status(200).send({
    fails,
    successes
  });
})

app.post("/"+api.테스트여러개업로드, async (req, res) => {

  if(!req.files || Object.keys(req.files).length === 0){
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file as UploadedFile;
  const resourceId = Date.now();
  const uploadFolderPath = `${rootPath}/static/${resourceId}`;

  if("data" in file) {
    const zipFile = new AdmZip(file.data);
    zipFile.extractAllTo(uploadFolderPath, true);
    const testCaseFolderPaths = await readdir(uploadFolderPath);

    const resources = testCaseFolderPaths.map((testCaseFolderPath) => {
      return {
        folderName: `${resourceId}${testCaseFolderPath}`,
        testName: testCaseFolderPath
      };
    });

    const moveFolderInfos = testCaseFolderPaths.map((path) => ({
      oldPath: `${uploadFolderPath}/${path}`,
      newPath: `${rootPath}/static/${resourceId}${path}`
    }));

    await Promise.all(
      moveFolderInfos.map(({ oldPath, newPath}) =>
      moveFile(oldPath, newPath)
    ));

    return res.status(200).send({
      resources
    });
  }

  res.status(200).send({
    reason: 'upload fail'
  });

});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const runTestCases = async (params: {
  exeFile: string;
  ios: {
    input: string;
    output: string;
  }[];
}) => {
  return await Promise.all(params.ios.map(io => runTestCase({
    exeFile: params.exeFile,
    input: io.input,
    output: io.output,
    resourceId: ''
  })));
}

const runTestCase = async (params : {
  exeFile: string;
  input: string;
  output: string;
  resourceId: string;
}) => {

  const result = await run(`${params.exeFile} ${params.input} << EOF`);

  if(result.hasError || result?.result.stderr !== ''){
    return {
      status: 'fail',
      reason: result?.result.stderr ?? ''
    } as const;
  }

  const target = formatTestCase(result.result.stdout.toString());
  const answer = formatTestCase(params.output);

  if(target === answer) {
    return {
      status: 'success',
      info: `${params.resourceId} success`,
      target,
      answer,
    } as const;
  }

  return {
    status : 'fail',
    reason: `not match path=${params.resourceId} \n\ntarget=${target}\nanswer=${answer}`
  } as const;
}

app.post('/' + api.테스트하나, async (req, res) => {

  const {input, output, resourceId} = req.body;
  const exeFile = `${rootPath}/static/${resourceId}/build`;
  const testCaseResult = await runTestCase({
    resourceId,
    input,
    output,
    exeFile
  });

  res.status(200).send(testCaseResult);
})

app.post('/' +api.테스트여러개, async (req, res) => {
  const requests = req.body as RunMultipleTestCaseRequest;

  const testResult = await Promise.all(requests.map(request => runTestCase({
    input: request.input,
    output: request.output,
    exeFile: `${rootPath}/static/${request.resourceId}/build`,
    resourceId: request.resourceId,
  })));

  const response: RunMultipleTestCaseResponse = {
    successes: testResult.filter((test) => test.status === 'success') as Success[],
    fails: testResult.filter((test) => test.status === 'fail') as Fail[]
  }

  res.status(200).send(response);
});

export const unzipUserAssignment = async (userAssignmentFolderPath: string) => {
  const [zipFileName] = await readdir(userAssignmentFolderPath);
  const zipFile = new AdmZip(`${userAssignmentFolderPath}/${zipFileName}`);

  const resourceId = Date.now();
  const extractPath = `${rootPath}/static/${resourceId}${zipFileName}` ;

  zipFile.extractAllTo(extractPath);

  return extractPath;
}

export const checkTestCasesUserAssignment = async (params: {userTestCasesFolderPath: string, testCases: TestCase[]})=> {
  const testCasePaths = await readdir(params.userTestCasesFolderPath);

  return params.testCases.map(testCase => testCase.name).map(testCaseName => {
    if(testCasePaths.includes(testCaseName))  {
      return {
        status: 'success',
        caseName: testCaseName,
      } as const;
    }

    return {
      status: 'fail',
      caseName: testCaseName
    } as const;
  });
}

app.post('/' + api.TA테스트여러개유저하나, async (req, res) => {
  const {userName, folderName, testCases} = req.body as RunTaMultipleTestCaseRequest;

  const userAssignmentPath = `${rootPath}/static/${folderName}`;
  const testCasesFolderPath = await unzipUserAssignment(userAssignmentPath);

  const testCaseResult = await checkTestCasesUserAssignment({
    userTestCasesFolderPath: testCasesFolderPath, testCases
  });

  const userTestCaseResponse: UserTestCase = {
    userName,
    caseFails: [],
    caseSuccesses: [],
    buildSuccesses: [],
    buildFails: [],
    testSuccesses: [],
    testFails: []
  };

  testCaseResult.forEach(({status, caseName})=> {
    if(status === 'success') {
      userTestCaseResponse.caseSuccesses.push({
        caseName,
        info: ''
      });
      return;
    }

    userTestCaseResponse.caseFails.push({
      caseName,
      reason: 'empty'
    });
  });

  const buildPaths = testCaseResult.filter((testCase) => testCase.status === 'success')
    .map(testCase => {
      return `${testCasesFolderPath}/${testCase.caseName}`
    })

  const buildResult = await buildCpps(buildPaths);

  buildResult.forEach((res)=> {
    if(res.result === 'success') {
      userTestCaseResponse.buildSuccesses.push({
        caseName: res.path.split('/').at(-1),
        info: ''
      });
      return;
    }

    userTestCaseResponse.buildFails.push({
      caseName: res.path.split('/').at(-1),
      reason: res.reason
    });
  })

  console.log('buildResult', buildResult);

  const testResults = await Promise.all(buildResult.filter((build) => build.result === 'success')
    .map(build => {
      const caseName = build.path.split('/').at(-1);
      return {
        path: `${build.path}/build`,
        caseName,
        ios: testCases.find((testCase) => testCase.name === caseName).io
      }
    }).map(async testCase => {
      const results = await runTestCases({
        exeFile: testCase.path,
        ios: testCase.ios
      });

      return {
        caseName: testCase.caseName,
        results
      };
    }));

  testResults.forEach(testResult => {
    const {caseName, results} = testResult;

    results.forEach(result => {
      if(result.status === 'success'){
        userTestCaseResponse.testSuccesses.push({
          caseName,
          info: ''
        });
        return;
      }

      userTestCaseResponse.testFails.push({
        caseName,
        reason: result.reason as unknown as string,
      })
    })
  })

  res.status(200).send(userTestCaseResponse);
})

app.post('/' + api.TA테스트여러개업로드, async (req, res) => {

  if(!req.files || Object.keys(req.files).length === 0){
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file as UploadedFile;
  const resourceId = Date.now();
  const uploadFolderPath = `${rootPath}/static/${resourceId}`;

  if("data" in file) {
    const zipFile = new AdmZip(file.data);
    zipFile.extractAllTo(uploadFolderPath, true);
    const testCaseFolderPaths = (await readdir(uploadFolderPath)).filter(isAssignSubmissionFile);

    const resources = testCaseFolderPaths.map((testCaseFolderPath) => {
      return {
        folderName: `${resourceId}${testCaseFolderPath}`,
        userName: extractHangul(testCaseFolderPath)
      };
    });

    const moveFolderInfos = testCaseFolderPaths.map((path) => ({
      oldPath: `${uploadFolderPath}/${path}`,
      newPath: `${rootPath}/static/${resourceId}${path}`
    }));

    await Promise.all(
      moveFolderInfos.map(({ oldPath, newPath}) =>
        moveFile(oldPath, newPath)
      ));

    return res.status(200).send({
      resources
    });
  }

  res.status(200).send({
    reason: 'upload fail'
  });

})

const port = process.env.port || 3333;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
