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
import {BuildResult} from "@online-judge/domain";
import {mkdir, readdir} from 'fs/promises';
import {makeTry} from "make-try";
import {promisify} from "util";
import {exec} from "child_process";
export const run = makeTry(promisify(exec));

const app = express();
const rootPath = process.cwd();

app.use(express.json());
app.use('*', cors());
app.use(morgan('combined'));
app.use(fileUpload({
  tempFileDir : '/upload/'
}));

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
      reason: result.err as string
    }
  }

  return {
    result: 'success',
    path: folderPath
  };
}


app.post('/upload', async (req, res) => {

  if(!req.files || Object.keys(req.files).length === 0){
    return res.status(400).send('No files were uploaded.');
  }

  const files = req.files.file as UploadedFile[];
  const resourceId = Date.now();
  const uploadFolderPath = `${rootPath}/static/${resourceId}`;

  try {
    await mkdir(uploadFolderPath);
  } catch (err) {
    res.status(500).send(err);
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
    res.status(400).send(build.reason);
    return;
  }

  if(build.result === 'success'){
    res.status(201).send({
      resourceId
    });
  }
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/test/single', async (req, res) => {

  const {input, output, resourceId} = req.body;
  const exeFile = `${rootPath}/static/${resourceId}/build`;

  const result = await run(`${exeFile} ${input}`);

  console.log(result.result);


  res.sendStatus(200);
})

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
