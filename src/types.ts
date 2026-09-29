import { PandaFactory } from './factory'

export interface PandaFactoryInterface {
  clone: (obj: any) => PandaFactory
  render: (str: string, data?: any) => string
  path: (dir: string, data?: any) => string
  ensurePath: (dir: string) => void
  fileExists: (file: string) => Promise<boolean>
  list: (dir: string, opts?: any) => Promise<string[]>
  readFile: (file: string) => Promise<string>
  writeFile: (file: string, output: string | Buffer, opts?: WriteFileOptions) => Promise<void>
  readJsonFile: (file: string) => Promise<any>
  writeJsonFile: (file: string, data: any, opts?: WriteFileOptions) => Promise<void>
  isGlob: (str: string) => boolean
  isDir: (str: string) => boolean
  isFile: (str: string) => boolean
  // isJson: (str: string) => boolean
  openBrowser: (url: string) => void
  runCommand: (cmd: string, opts?: any) => Promise<void>
}

export interface WriteFileOptions {
  ifExists?: 'skip' | 'overwrite' | 'throw'
  ifNotExists?: 'skip' | 'create' | 'throw'
  encoding?: BufferEncoding
}

export type BufferEncoding =
  | "ascii"
  | "utf8"
  | "utf-8"
  | "utf16le"
  | "ucs2"
  | "ucs-2"
  | "base64"
  | "latin1"
  | "binary"
  | "hex"