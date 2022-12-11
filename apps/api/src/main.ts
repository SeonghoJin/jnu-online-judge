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
  BuildResult,
  Fail, FailOrSuccess,
  RunTaMultipleTestCaseRequest, RunTaSingleTestCaseRequest, RunTaSingleTestCaseResponse,
  Success,
  TestCase, UserTestCase
} from "@online-judge/domain";
import {mkdir, readdir, rename, writeFile, stat} from 'fs/promises';
import {makeTry} from "make-try";
import {promisify} from "util";
import {exec} from "child_process";
import {formatTestCase} from "./ util/formatTestCase";
import {api} from "@online-judge/domain";
export const moveFile = rename;
import * as AdmZip from 'adm-zip';
import { RunMultipleTestCaseRequest } from '@online-judge/domain';
import { RunMultipleTestCaseResponse } from '@online-judge/domain';
import * as asyncify from 'express-asyncify'
import {Express} from "express";

export const run = makeTry(promisify(exec));

const rootPath = process.cwd();
const app = asyncify(express()) as Express;

app.use(express.json());
app.use('*', cors());
app.use(morgan('combined'));
app.use(fileUpload({
  tempFileDir: '/upload/'
}));

app.get('/error', async () => {
  throw new Error("hello world");
})

app.get('/ok', async (req, res) => {
  res.sendStatus(200);
})

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
  if (ext === 'cpp') {
    return true;
  }

  if (ext === 'c') {
    return true;
  }

  if (ext === 'hpp') {
    return true;
  }

  return false;
}

const buildCpp = async (folderPath: string): Promise<BuildResult> => {
  const files = await readdir(folderPath);

  const compiler = 'g++';
  const buildTargetName = `${folderPath}/build`;
  const args = `-o ${buildTargetName} -std=c++20`;

  const buildingFiles = files.filter(file => validateCpp(file))
    .map(file => {
      return `${folderPath}/${file}`;
    });

  const command = `${compiler} ${args} ${buildingFiles.join(' ')}`;

  const result = await run(command);

  if (result.hasError) {
    return {
      status: 'fail',
      path: folderPath,
      reason: (result.err as { stderr: string }).stderr,
    }
  }

  return {
    status: 'success',
    path: folderPath
  };
}

const buildCpps = async (folderPaths: string[]) => {
  return await Promise.all(folderPaths.map(folderPath => buildCpp(folderPath)));
}

app.post("/" + api.테스트하나업로드, async (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const files = (() => {
    if (Array.isArray(req.files.file)) {
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

  if (build.status === 'fail') {
    res.status(200).send({
      reason: build.status
    });
    return;
  }

  if (build.status === 'success') {
    res.status(201).send({
      resourceId
    });
  }
});

app.post(`/${api.빌드여러개}`, async (req, res) => {
  const {folderNames} = req.body;

  const folderPaths = folderNames.map((folderName) => `${rootPath}/static/${folderName}`) as string[];

  const buildResults = await buildCpps(folderPaths);

  const fails = buildResults.filter(({status}) => status === 'fail')
    .map((result) => ({
      ...result,
      path: undefined,
      resourceId: result.path.split('/').at(-1)
    }));

  const successes = buildResults.filter(({status}) => status === 'success')
    .map((result) => ({
      resourceId: result.path.split('/').at(-1)
    }));

  res.status(200).send({
    fails,
    successes
  });
})

app.post("/" + api.테스트여러개업로드, async (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file as UploadedFile;
  const resourceId = Date.now();
  const uploadFolderPath = `${rootPath}/static/${resourceId}`;

  if ("data" in file) {
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
      moveFolderInfos.map(({oldPath, newPath}) =>
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

const runTestCase = async (params: {
  exeFile: string;
  input: string;
  output: string;
  resourceId: string;
}): Promise<FailOrSuccess> => {
  const writeInputFilePath = `${params.exeFile}--input-${Date.now()}`;
  await writeFile(writeInputFilePath, params.input);
  const result = await run(`${params.exeFile} < ${writeInputFilePath}`);
  console.log(`${params.exeFile}`, 'command result', result);

  if (result.hasError || result?.result.stderr !== '') {
    return {
      status: 'fail',
      reason: result?.result?.stderr?.toString() + '\n' + result?.err ?? ''
    };
  }

  const target = formatTestCase(result.result.stdout.toString());
  const answer = formatTestCase(params.output);

  if (target === answer) {
    return {
      status: 'success',
      info: `${params.resourceId} success`,
      target,
      answer,
    };
  }

  return {
    status: 'fail',
    reason: `not match path=${params.resourceId} \n\ntarget=${target}\nanswer=${answer}`
  };
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

app.post('/' + api.테스트여러개, async (req, res) => {
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
  const extractPath = `${rootPath}/static/${resourceId}${zipFileName}`;

  zipFile.extractAllTo(extractPath);

  const inner = await readdir(extractPath);

  if (inner.length === 1) {
    if ((await stat(extractPath)).isDirectory()) {
      return `${extractPath}/${inner[0]}`
    }
  }

  return extractPath;
}

export const checkTestCasesUserAssignment = async (params: { userTestCasesFolderPath: string, testCases: TestCase[] }) => {
  const testCasePaths = await readdir(params.userTestCasesFolderPath);
  console.log('check test case')
  console.log(params.userTestCasesFolderPath, testCasePaths);

  return params.testCases.map(testCase => testCase.name).map(testCaseName => {
    if (testCasePaths.includes(testCaseName)) {
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

app.post('/' + api.TA테스트하나유저하나, async (req, res) => {
  const {folderName, ios, userName} = req.body as RunTaSingleTestCaseRequest;
  const userAssignmentPath = `${rootPath}/static/${folderName}`;

  const {err, hasError, result: extractPath} = await makeTry(unzipUserAssignment)(userAssignmentPath);

  if (hasError) {
    const response: RunTaSingleTestCaseResponse = {
      userName,
      buildResult: {
        status: 'fail',
        reason: err as string
      }
    }

    return res.status(200).send(response);
  }

  const buildResult = await buildCpp(extractPath);

  if (buildResult.status === 'fail') {
    const response: RunTaSingleTestCaseResponse = {
      userName,
      buildResult
    };

    return res.status(200).send(response);
  }

  const buildPath = `${buildResult.path}/build`;

  const runResult = await runTestCases({
    exeFile: buildPath,
    ios
  });

  const response: RunTaSingleTestCaseResponse = {
    userName,
    buildResult,
    testResult: runResult
  }

  return res.status(200).send(response);
})

app.post('/' + api.TA테스트여러개유저하나, async (req, res) => {
  const {userName, folderName, testCases} = req.body as RunTaMultipleTestCaseRequest;

  console.log(userName + 'start');

  const userAssignmentPath = `${rootPath}/static/${folderName}`;
  console.log(userName, userAssignmentPath);
  const testCasesFolderPath = await unzipUserAssignment(userAssignmentPath);
  console.log(userName, testCasesFolderPath);
  const testCaseResult = await checkTestCasesUserAssignment({
    userTestCasesFolderPath: testCasesFolderPath, testCases
  });
  console.log(userName, 'testCaseResult', testCaseResult);
  const userTestCaseResponse: UserTestCase = {
    userName,
    caseFails: [],
    caseSuccesses: [],
    buildSuccesses: [],
    buildFails: [],
    testSuccesses: [],
    testFails: []
  };

  testCaseResult.forEach(({status, caseName}) => {
    if (status === 'success') {
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
  console.log(userName, 'buildResult', buildResult);

  buildResult.forEach((res) => {
    if (res.status === 'success') {
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
  console.log(userName, 'test start')
  const testResults = await Promise.all(buildResult.filter((build) => build.status === 'success')
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
  console.log(userName, 'test end');
  testResults.forEach(testResult => {
    const {caseName, results} = testResult;

    results.forEach(result => {
      if (result.status === 'success') {
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
  });
  console.log(userName, 'testResult', testResults)

  res.status(200).send(userTestCaseResponse);
})

app.post('/' + api.TA테스트여러개업로드, async (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file as UploadedFile;
  const resourceId = Date.now();
  const uploadFolderPath = `${rootPath}/static/${resourceId}`;

  if ("data" in file) {
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
      moveFolderInfos.map(({oldPath, newPath}) =>
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

