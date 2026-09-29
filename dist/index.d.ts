import * as fss from 'node:fs';

interface PandaFactoryInterface {
    clone: (obj: any) => PandaFactory;
    render: (str: string, data?: any) => string;
    path: (dir: string, data?: any) => string;
    ensurePath: (dir: string) => void;
    fileExists: (file: string) => Promise<boolean>;
    list: (dir: string, opts?: any) => Promise<string[]>;
    readFile: (file: string) => Promise<string>;
    writeFile: (file: string, output: string | Buffer, opts?: WriteFileOptions) => Promise<void>;
    readJsonFile: (file: string) => Promise<any>;
    writeJsonFile: (file: string, data: any, opts?: WriteFileOptions) => Promise<void>;
    isGlob: (str: string) => boolean;
    isDir: (str: string) => boolean;
    isFile: (str: string) => boolean;
    openBrowser: (url: string) => void;
    runCommand: (cmd: string, opts?: any) => Promise<void>;
}
interface WriteFileOptions {
    ifExists?: 'skip' | 'overwrite' | 'throw';
    ifNotExists?: 'skip' | 'create' | 'throw';
    encoding?: BufferEncoding;
}
type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";

declare class PandaFactory implements PandaFactoryInterface {
    protected __clone: boolean;
    mod: {
        kebabCase: (v: any) => any;
        dashCase: (v: any) => any;
        titleCase: (v: any) => any;
        camelCase: (v: any) => any;
        pascalCase: (v: any) => any;
        snakeCase: (v: any) => any;
        envCase: (v: any) => any;
        dotCase: (v: any) => any;
        pathCase: (v: any) => any;
        namespaceCase: (v: any) => any;
        sentenceCase: (v: any) => any;
        lowerCase: (v: any) => any;
        upperCase: (v: any) => any;
    };
    data: {};
    constructor(cfg?: any);
    clone(cfg: any): PandaFactory;
    render(str: string, data?: {}): string;
    path(dir: string, data?: any): string;
    ensurePath(dir: string): string;
    fileExists(file: string): Promise<boolean>;
    list(dir: string, opts?: {}): Promise<string[]>;
    readFile(file: string): Promise<string>;
    /**
     * Write contents to a file
     *
     * @param file                file to write to
     * @param output              contents to write to file
     * @param opts
     * @param opts.force          flag to forcefully write to the file even if the file already exists
     * @param opts.skipIfExists   flag to skip the file if it exists
     * @param opts.encoding       encoding of file
     * @returns
     */
    writeFile(file: string, output: string, { ifExists, ifNotExists, encoding, }?: {
        ifExists?: 'skip' | 'overwrite' | 'throw';
        ifNotExists?: 'skip' | 'create' | 'throw';
        encoding?: BufferEncoding | string;
    }): Promise<void>;
    readJsonFile(file: string, { ifNotExists, }?: {
        ifNotExists?: 'skip' | 'create' | 'throw';
    }): Promise<any>;
    writeJsonFile(file: any, json: any, { ifExists, spaces, }?: {
        ifExists?: 'skip' | 'overwrite' | 'throw';
        spaces?: number;
    }): Promise<void>;
    stringifyObject(obj: any, { spaces, }?: {
        spaces?: number;
    }): string;
    isGlob: (str: any) => boolean;
    isDir: (dir: any) => boolean;
    isFile: (file: any) => boolean;
    openBrowser(url: any): void;
    /**
     * Runs a command
     *
     * @param {String} cmd              command to run
     * @param {Object} opts             options
     * @param {boolean} opts.stream     stream output
     * @returns
     */
    runCommand(cmd: any, { stream }?: {
        stream?: boolean;
    }): Promise<any>;
}
declare const Factory: PandaFactory;

declare class VirtualDirectory {
    _path: string;
    _name: string;
    private flags;
    _files: {
        [key: string]: VirtualFile;
    };
    _dirs: {
        [key: string]: VirtualDirectory;
    };
    _stats: fss.Stats;
    private root;
    private parent;
    private context;
    private ignore;
    constructor(dir: string, root?: VirtualDirectory, parent?: VirtualDirectory);
    parse(): void;
    get path(): string;
    getVDir(dir: any): VirtualDirectory;
    getDir(dir: string, { ifNotExist, parse }?: {
        ifNotExist?: 'throw' | 'create' | 'ignore';
        parse?: boolean;
    }): VirtualDirectory;
    createDir(dir: string, { ifNotExist, parse }?: {
        ifNotExist?: 'throw' | 'create' | 'ignore';
        parse?: boolean;
    }): VirtualDirectory;
    addFile(file: string): VirtualFile;
    cd(dir: string, { ifNotExist }?: {
        ifNotExist?: string;
    }): VirtualDirectory;
    getRootDir: () => string;
    output(dir?: string | VirtualDirectory, level?: number): void;
}
declare class VirtualFile {
    private parent;
    _path: string;
    _name: string;
    _contents: string;
    _size: number;
    _stats: fss.Stats;
    flags: {
        virtual: boolean;
        readable: boolean;
        writable: boolean;
    };
    constructor(file: string, parent: VirtualDirectory);
    get contents(): string;
    set contents(contents: string);
}

export { Factory, PandaFactory, VirtualDirectory };
