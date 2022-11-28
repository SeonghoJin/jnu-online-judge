import {HttpService, httpService} from "./HttpService";
import {makeTry} from "make-try";
import {
  api,
  MultiTestBuildRequest,
  MultiTestBuildResponse,
  SingleTestIORequest,
  SingleTestIOResponse
} from "@online-judge/domain";
import {RunMultipleTestCaseRequest} from "../../../../libs/domain/src/lib/RunMultipleTestCaseRequest";
import {RunMultipleTestCaseResponse} from "../../../../libs/domain/src/lib/RunMultipleTestCaseResponse";

export class ApiService {
  private httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  runTestCaseWithIO = makeTry(async (params: SingleTestIORequest) => {
    return await this.httpService.post<SingleTestIOResponse>('http://localhost:3333/test/single', {
      input: params.input,
      output: params.output,
      resourceId: params.resourceId
    });
  }, {
    abort: true
  })

  buildMultiTestCase = async (params: MultiTestBuildRequest) => {
    return await this.httpService.post<MultiTestBuildResponse>(`http://localhost:3333/${api.빌드여러개}`, {
      folderNames: params.buildFolderPaths
    });
  }

  runMultiTestCase = async (params: RunMultipleTestCaseRequest) => {
    return await this.httpService.post<RunMultipleTestCaseResponse>(`http://localhost:3333/${api.테스트여러개}`, params);
  }
}

export const apiService = new ApiService(httpService);

