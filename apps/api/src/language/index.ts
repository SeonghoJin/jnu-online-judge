import {Cpp} from "./Cpp";
import {CompileRequest} from "../../../../libs/domain/src/lib/CompileRequest";

export class LanguageAPI {

  private cpp: Cpp;
  constructor() {
    this.cpp = new Cpp();
  }

  compile = (request: CompileRequest) => {
    if(request.compiler === 'cpp') {
      return this.cpp.
    }
  }

}
