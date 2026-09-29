import * as path from 'path'
import * as fss from 'node:fs'
import * as fs from 'node:fs/promises'
import kleur from 'kleur'

class VirtualContext {
  _cwd: string
  root: VirtualDirectory

  constructor(cwd: string, root?: VirtualDirectory) {
    this._cwd = cwd || process.cwd()
    this.root = root
  }

  get cwd() {
    return this._cwd
  }

  set cwd(cwd: string) {
    this._cwd = cwd
  }

  ls (dir?: string) {}

  cd (dir: string) {
    return this.root.cd(dir)
  }

  pwd () {}

  mkdir (dir: string) {}

  touch (file: string) {}

  rm (file: string) {}

  rmdir (dir: string) {}

  mv (src: string, dest: string) {}

  cp (src: string, dest: string) {}

  cat (file: string) {}

  head (file: string) {}

  tail (file: string) {}

  ln (src: string, dest: string) {}

  find (dir: string) {}

  grep (pattern: string, file: string) {}

  sed (pattern: string, replacement: string, file: string) {}

  chmod (mode: string, file: string) {}

  chown (owner: string, file: string) {}

  chgrp (group: string, file: string) {}

  stat (file: string) {}
}

export class VirtualDirectory {
  _path: string
  _name: string
  private flags = {
    virtual: true,
    ignored: false,
    parsed: false,
    readable: true,
    writable: true,
  }

  _files: { [key: string]: VirtualFile } = {}
  _dirs: { [key: string]: VirtualDirectory } = {}
  _stats: fss.Stats

  private root: VirtualDirectory
  private parent: VirtualDirectory
  private context: VirtualContext

  private ignore: string[] = ['node_modules', '.git', '.vscode', 'dist', 'build', 'out', 'coverage', 'test', 'tests', 'tmp', 'temp']

  constructor(dir: string, root?: VirtualDirectory, parent?: VirtualDirectory) {
    // console.log(`VirtualDirectory '${dir}'`)
    // if (!dir) throw new Error('Directory path is required')
    this._path = dir
    this._name = path.basename(dir)
    this.root = root || this
    this.parent = parent
    if (parent) this.context = parent.context

    let context: VirtualDirectory = this

    if (!root) {
      // console.log(`No root directory specified for ${dir}`)
      // this.root = this
      const rootDir = this.getRootDir()
      this.context = new VirtualContext(dir, this)
      this._path = rootDir
      this._name = path.basename(rootDir)
      const parts = dir.split(path.sep)
      // console.log(parts)
      parts.shift()
      // console.log(parts)
      parts.forEach(part => {
        const parse = part === parts[parts.length - 1]
        context = context.getDir(part, { ifNotExist: 'create', parse })
        // console.log(context)
      })
      // context.parse()
    }

    // Check if directory exists
    if (fss.existsSync(dir)) {
      this.flags.virtual = false
      this._stats = fss.statSync(dir)
      // this.flags.readable = fss.accessSync(dir, fss.constants.R_OK)
      // this.flags.writable = fss.accessSync(dir, fss.constants.W_OK)
      try {
        fss.accessSync(dir, fss.constants.R_OK)
        this.flags.readable = true
      } catch (err) {
        this.flags.readable = false
      }
      try {
        fss.accessSync(dir, fss.constants.W_OK)
        this.flags.writable = true
      } catch (err) {
        this.flags.writable = false
      }
    }
    return context
  }

  parse () {
    // console.log(`Parsing directory ${this._path}`)
    // console.log(this)
    if (this.flags.virtual) return
    if (this.ignore.includes(this._name)) {
      this.flags.ignored = true
      return
    }
    // console.log(`+Parsing directory ${this._path}`)
    const files = fss.readdirSync(this._path)
    // console.log(files)
    files.forEach(file => {
      const stats = fss.statSync(path.join(this._path, file))
      if (stats.isDirectory()) {
        this.createDir(file)
      } else {
        this.addFile(file)
      }
      // stats.isSymbolicLink()
    })
    this.flags.parsed = true
  }

  get path() {
    return this._path
  }

  getVDir (dir) {
    // console.log(`Getting directory ${dir}`)
    // console.log({
    //   dir,
    //   isAbsolute: path.isAbsolute(dir),
    //   newDir: path.isAbsolute(dir) ? dir : path.join(this._path, dir),
    // })
    if (!path.isAbsolute(dir)) dir = path.join(this._path, dir)
    // let parts = dir.split(path.sep)
    let parts = dir === this.getRootDir() ? [dir] : dir.split(path.sep)
    // console.log(parts)
    parts.shift()
    let current = this.root
    // console.log(current)
    parts.forEach(part => {
      current = current.getDir(part)
    })
    return current
  }

  getDir(dir: string, {
    ifNotExist = 'throw',
    parse = true
  }: {
    ifNotExist?: 'throw' | 'create' | 'ignore',
    parse?: boolean
  
  } = {}) {
    // console.log({
    //   dir,
    //   root: this.getRootDir(),
    // })
    const vdir = this._dirs[dir]
    // console.log({
    //   dir,
    //   vdir,
    //   ifNotExist,
    //   _dirs: this._dirs,
    // })
    if (!vdir) {
      if (ifNotExist === 'throw') throw new Error(`Directory ${dir} does not exist`)
      if (ifNotExist === 'create') return this.createDir(dir, { parse })
      // return null
      throw new Error(`Directory ${dir} does not exist`)
    }
    return vdir
  }

  createDir(dir: string, {
    ifNotExist = 'throw',
    parse = true
  }: {
    ifNotExist?: 'throw' | 'create' | 'ignore',
    parse?: boolean
  } = {}) {
    if (!dir) throw new Error('Directory path is required')
    if (dir.includes(path.sep)) throw new Error(`Directory path cannot contain path separators: ${dir}`)
    // console.log(`Creating directory ${dir}`)
    // console.log(this.root)
    const vdir = new VirtualDirectory(path.join(this._path, dir), this.root, this)
    if (parse) vdir.parse()
    this._dirs[dir] = vdir
    // console.log(vdir)
    // return new VirtualDirectory(dir, this.root)
    return vdir
  }

  addFile(file: string) {
    if (!file) throw new Error('File path is required')
    if (file.includes(path.sep)) throw new Error(`File path cannot contain path separators: ${file}`)
    const vfile = new VirtualFile(path.join(this._path, file), this)
    // this._files[file] = vfile
    return vfile
  }

  cd (dir: string, {
    ifNotExist = 'throw'
  } = {}) {
    if (!dir) throw new Error('Directory path is required')
    if (!path.isAbsolute(dir)) dir = path.join(this._path, dir)
    const vdir = this.getVDir(dir)
    if (!vdir) {
      if (ifNotExist === 'throw') throw new Error(`Directory ${dir} does not exist`)
      if (ifNotExist === 'create') return this.createDir(dir)
      // return null
      throw new Error(`Directory ${dir} does not exist`)
    }
    this.context.cwd = vdir._path
    return vdir
  }

  getRootDir = () => path.parse(this._path).root

  output (dir?: string | VirtualDirectory, level = 0) {
    // if (!dir) dir = this
    // if (typeof dir === 'string') dir = this.getVDir(dir)
    // console.log(`Directory: ${dir._path} ${dir._virtual ? '(virtual)' : ''}`)
    // const vdir = this.getVDir(dir)
    const vdir = typeof dir === 'string' ? this.getVDir(dir) : (dir || this)
    const spaces = '  '.repeat(level)
    const tags = []
    if (vdir.flags.virtual) tags.push('virtual')
    if (vdir.flags.ignored) tags.push('ignored')
    // if (vdir.flags.parsed) tags.push('parsed')
    if (!vdir.flags.readable) tags.push('unreadable')
    if (!vdir.flags.writable) tags.push('unwritable')
    const name = kleur.yellow(vdir._name)
    const tagStr = tags.length ? kleur.gray(`[${tags.join(', ')}]`) : ''
    console.log(`${spaces}${name}/ ${tagStr}`)
    // console.log(vdir._stats)
    // console.log(`${spaces}${vdir._name}/ ${vdir.flags.virtual ? '(virtual)' : ''}`)
    // console.log(vdir)
    let current = vdir
    Object.entries(vdir._dirs).forEach(([dir, vdir]) => {
      const spaces = '  '.repeat(level)
      // console.log(`${spaces}${vdir._path}/ ${vdir._virtual ? '(virtual)' : ''}`)
      this.output(vdir, level + 1)
    })
    Object.entries(vdir._files).forEach(([file, vfile]) => {
      const spaces = '  '.repeat(level + 1)
      const tags = []
      if (vfile.flags.virtual) tags.push('virtual')
      if (!vfile.flags.readable) tags.push('unreadable')
      if (!vfile.flags.writable) tags.push('unwritable')
      const name = kleur.green(file)
      const tagStr = tags.length ? kleur.gray(`[${tags.join(', ')}]`) : ''
      console.log(`${spaces}${name} (${vfile._size} bytes) ${tagStr}`)
      // console.log(vfile._stats)
      // console.log(`${spaces}${file} (${vfile._size} bytes) ${vfile._virtual ? '(virtual)' : ''}`)
    })
  }
}

class VirtualFile {
  private parent: VirtualDirectory
  // _virtual: boolean = true
  _path: string
  _name: string
  _contents: string = ''
  _size: number = 0
  _stats: fss.Stats

  flags = {
    virtual: true,
    readable: true,
    writable: true,
  }

  constructor(file: string, parent: VirtualDirectory) {
    this.parent = parent
    this._path = file
    this._name = path.basename(file)

    parent._files[this._name] = this
    
    if (fss.existsSync(file)) {
      this.flags.virtual = false
      this._stats = fss.statSync(file)
      this._size = this._stats.size
      this.contents = fss.readFileSync(file, { encoding: 'utf8' })
      try {
        fss.accessSync(file, fss.constants.R_OK)
        this.flags.readable = true
      } catch (err) {
        this.flags.readable = false
      }
      try {
        fss.accessSync(file, fss.constants.W_OK)
        this.flags.writable = true
      } catch (err) {
        this.flags.writable = false
      }
    }
  }

  get contents() {
    return this._contents
  }

  set contents(contents: string) {
    if (!this.flags.writable) throw new Error(`File ${this._path} is not writable`)
    this._contents = contents
    this._size = contents.length
  }
}