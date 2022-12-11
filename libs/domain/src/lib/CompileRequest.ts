export type SupportCompiler = 'cpp' | 'hello';
export type SupportCppVersion = '11' | '14' | '17';

export type CppCompileRequest = {
  compiler: 'cpp',
  version: SupportCppVersion;
}

export type CompileRequest =
    CppCompileRequest;
