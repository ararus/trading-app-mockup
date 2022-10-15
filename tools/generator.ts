import * as fs from "fs";
import * as path from "path";
import * as xml2js from "xml2js";

interface FieldDef {
  name: string;
  fieldType: string;
}

interface DtoDef {
  name: string;
  fields: FieldDef[];
}

interface ParamDef {
  name: string;
  type: string;
}

interface ServiceFunctionDef {
  name: string;
  params: ParamDef[];
  returnType: string;
}

interface ServiceDef {
  name: string;
  functions: ServiceFunctionDef[];
}

interface ModuleDef {
  name: string;
  dtos: DtoDef[];
  services: ServiceDef[];
}

function parseFuncParam(data: any) {
  const param: ParamDef = {
    name: data.$.name,
    type: data.type[0].trim(),
  };
  return param;
}

function parseFunction(data: any) {
  const funcDef: ServiceFunctionDef = {
    name: data.$.name,
    params: data.parameters
      ? data.parameters[0].parameter.map((d) => parseFuncParam(d))
      : [],
    returnType: data.returnType[0].trim(),
  };
  return funcDef;
}

function parseField(data: any) {
  const field: FieldDef = {
    name: data.$.name,
    fieldType: data.type[0].trim(),
  };
  return field;
}

function parseDto(data: any) {
  const fields: FieldDef[] = data.fields[0].field.map((d) => parseField(d));
  const dto: DtoDef = {
    name: data.$.name,
    fields,
  };
  return dto;
}

function parseService(data: any) {
  const service: ServiceDef = {
    name: data.$.name,
    functions: data.functions[0].function.map((d) => parseFunction(d)),
  };
  return service;
}

function parseModule(data: any) {
  const dtos = data.dtos[0].dto.map((d) => parseDto(d));
  const services = data.services[0].service.map((d) => parseService(d));

  const moduleDef: ModuleDef = {
    name: data.$.name,
    dtos,
    services,
  };
  return moduleDef;
}

async function parse(source: string): Promise<ModuleDef> {
  const parser = new xml2js.Parser();
  const result = new Promise<ModuleDef>((resolve, reject) => {
    parser.parseString(source, (err, data) => {
      const moduleDef = parseModule(data.module);
      resolve(moduleDef);
    });
  });
  return result;
}

function formatFuncParams(params: ParamDef[]) {
  const ts: string[] = [];
  for (let p of params) {
    ts.push(`${p.name}: ${p.type}`);
  }
  return ts.join(", ");
}

function generateImports() {
  const ts: string[] = [`import {Observable} from "rxjs";`];
  return ts.join("\n");
}

function generateService(service: ServiceDef) {
  const ts: string[] = [];

  const interfaceName = `I${service.name}`;

  ts.push(`export interface ${interfaceName} {`);
  for (let funcDef of service.functions) {
    const functionName = funcDef.name;
    const returnType = funcDef.returnType;

    ts.push(
      `\t${functionName}: (${formatFuncParams(
        funcDef.params
      )}) => Observable<${returnType}>;`
    );
  }
  ts.push(`}`);
  return ts.join("\n");
}

function generateDto(dto: DtoDef) {
  const ts: string[] = [];
  const interfaceName = `${dto.name}`;
  ts.push(`export interface ${interfaceName} {`);
  for (let f of dto.fields) {
    const fieldName = f.name;
    const fieldType = f.fieldType.trim();
    ts.push(`\t${fieldName}: ${fieldType};`);
  }
  ts.push(`}`);
  return ts.join("\n");
}

function generateServerSideStubs(module: ModuleDef) {
  const outputFolder = path.join(__dirname, "../server/src/generated");

  const ts: string[] = [];

  ts.push(generateImports());
  ts.push(``);

  for (let d of module.dtos) {
    ts.push(generateDto(d));
  }
  ts.push(``);

  for (let s of module.services) {
    ts.push(generateService(s));
  }
  ts.push(``);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }
  const outputFileName = path.join(outputFolder, `${module.name}.ts`);
  fs.writeFileSync(outputFileName, ts.join("\n"));
  // console.log(ts.join("\n"));
}

function generateClientSideApi(service: ServiceDef) {
  const ts: string[] = [];

  const className = `${service.name}`;
  ts.push(`export class ${className} {`);
  ts.push(`\tprivate readonly _ws: any;`);
  ts.push(`\tconstructor(url: string) {`);
  ts.push(`\t\tthis._ws = webSocket(url);`);
  ts.push(`\t}`);
  for (let f of service.functions) {
    const functionName = f.name;
    const returnType = f.returnType;
    ts.push(
      `\tpublic ${functionName} = (${formatFuncParams(
        f.params
      )}): Observable<${returnType}> => {`
    );
    const key =
      f.params.length > 0
        ? [f.name, ...f.params.map((p) => `\${${p.name}}`)].join(`_`)
        : `${f.name}`;
    const params =
      f.params.length > 0
        ? `[${f.params.map((p) => `${p.name}`).join(`, `)}]`
        : `undefined`;
    ts.push(
      `\t\treturn requestStream(this._ws, "${functionName}", \`${key}\`, ${params});`
    );
    ts.push(`\t};`);
  }
  ts.push(`}`);
  return ts.join(`\n`);
}

function generateClientSideStubs(module: ModuleDef) {
  const outputFolder = path.join(__dirname, "../web-client/src/api/generated");
  const ts: string[] = [];

  ts.push(`import { webSocket } from "rxjs/webSocket";`);
  ts.push(`import { Observable } from "rxjs";`);
  ts.push(`import { requestStream } from "../utils";`);
  ts.push(``);

  for (let d of module.dtos) {
    ts.push(generateDto(d));
  }
  ts.push(``);

  for (let s of module.services) {
    ts.push(generateClientSideApi(s));
  }
  ts.push(``);
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }
  const outputFileName = path.join(outputFolder, `${module.name}.ts`);
  fs.writeFileSync(outputFileName, ts.join(`\n`));
}

async function main() {
  const sourceFileName = path.join(__dirname, "source/example.xml");

  const source = fs.readFileSync(sourceFileName).toString();
  const result = await parse(source);

  generateServerSideStubs(result);
  generateClientSideStubs(result);
}

main();
