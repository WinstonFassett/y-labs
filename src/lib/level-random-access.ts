import RandomAccessStorage from 'random-access-storage';
import type { AbstractSublevel, AbstractLevel } from 'abstract-level';
import createFilesystem from 'level-filesystem';
// import createFilesystem from 'level-fs'



export function createLevelRandomAccessFileSystem(db: AbstractLevel<any, string, Buffer>) {
  const fs = createFilesystem(db);
  let ready = false
  const DatabaseOpened = Promise.resolve()
  // db.open().then(() => {
  //   console.log('DATABASE IS READY')
  //   ready = true
  // })
  console.log('new LevelRandomAccessFileSystem', { db, fs });
  function createFile(name: string) {
    name = "/" + name;
    // replace / with escape character
    name = name.replace(/\//g, '\\');
    console.log('createFile', name);
    let fd = 0;
    const ras = new RandomAccessStorage({
      // open: function (req) {
      //   // called once automatically before the first read call
      //   fs.open(path, 'r', function (err, res) {
      //     if (err) return req.callback(err);
      //     fd = res;
      //     req.callback(null);
      //   })
      // },
      // read: function (req) {
      //   const buf = Buffer.allocUnsafe(req.size);
      //   fs.read(fd, buf, 0, buf.length, req.offset, function (err, read) {
      //     if (err) return req.callback(err);
      //     if (read < buf.length) return req.callback(new Error('Could not read'));
      //     req.callback(null, buf);
      //   })
      // },
      // write: function (req) {
      //   const { offset, data } = req;
      //   fs.write(fd, data, 0, data.length, offset, function (err) {
      //     if (err) return req.callback(err);
      //     req.callback(null);
      //   });
      // },
      // del: function (req) {
      //   const { offset, size } = req;
      //   fs.ftruncate(fd, offset, size, function (err) {
      //     if (err) return req.callback(err);
      //     req.callback(null);
      //   });
      // },
      // close: function (req) {
      //   if (!fd) return req.callback(null);
      //   fs.close(fd, err => req.callback(err));
      // }
      createAlways: true,
      // exists: function (req) {
      //   console.log('exists', name,
      //     `fs.stat(name, function (err, stat) {`, req)
      //   fs.stat(name, function (err, stat) {
      //     if (err) return req.callback(null, false)
      //     req.callback(null, true)
      //   }
      //   )
      // },
      open: function (req) {
        // called once automatically before the first read call
        console.log(name, `fs.open(name, 'r', function (err, res) {`, req)
        DatabaseOpened.then(() => {
          console.log('opening', name)
          // fs.open(name, 'r', function (err, res) {
          //   console.log('opened', name, { err, res })
          //   if (err) return req.callback(err)
          //   fd = res
          //   req.callback(null)
          // })
          // we actually need to touch or create the file here

          const next = () => {
            fs.open(name, 'w+', function (err, res) {
              console.log('opened', name, { err, res })
              if (err) return req.callback(err)
              fd = res
              req.callback(null)
            })
          }

          // // how can we ensure that the full path exists? fs.mkdir?
          // const dirPath = name.split('/').slice(0, -1).join('/')
          // console.log({ dirPath})
          
          // if (dirPath) {
          //   console.log('ensuring dir', dirPath)
          //   fs.mkdir(dirPath, { recursive: true }, (err) => {
          //     console.log('made dir', dirPath)
          //     if (err) return req.callback(err)
          //     next()          
          //   })
          // } else {
          //   next()
          // }
          next()
          // req.callback(null)
        })        
      },
      stat: function (req) {
        console.log('stat', name, req)
        fs.stat(name, function (err, stat) {
          console.log('stat callback', name, { err, stat })
          if (err) return req.callback(err)
          req.callback(null, { size: stat.size })
        })
      },
      // read: function (req) {
      //   const buf = Buffer.allocUnsafe(req.size)
      //   console.log(name, `fs.read(fd, buf, 0, buf.length, req.offset, function (err, read) {`, req)
      //   fs.read(fd, buf, 0, buf.length, req.offset, function (err, read) {
      //     if (err) return req.callback(err)
      //     if (read < buf.length) return req.callback(new Error('Could not read'))
      //     req.callback(null, buf)
      //   })
      // },
      // write: function (req) {
      //   const { offset, data } = req
      //   console.log(name, `fs.write(fd, data, 0, data.length, offset, function (err) {`, req)
      //   fs.write(fd, data, 0, data.length, offset, function (err) {
      //     if (err) return req.callback(err)
      //     req.callback(null)
      //   })
      // },
      write (req) {
        let data = req.data
        // is it uint8array?
        if (data.buffer) {
          // data = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
          data = Buffer.from(data)
          // does that work?
          // 
        }
        // how can we ensure that the full path exists?

        fs.write(fd, data, 0, req.size, req.offset, onwrite)
    
        function onwrite (err, wrote) {
          if (err) return req.callback(err)
    
          req.size -= wrote
          req.offset += wrote
    
          if (!req.size) return req.callback(null)
          fs.write(fd, data, data.length - req.size, req.size, req.offset, onwrite)
        }
      },
      read: function (req) {
        const buf = Buffer.allocUnsafe(req.size)
        fs.read(fd, buf, 0, buf.length, req.offset, function (err, read) {
          if (err) return req.callback(err)
          if (read < buf.length) return req.callback(new Error('Could not read'))
          req.callback(null, buf)
        })
      },
      del: function (req) {
        if (req.size === Infinity) return this.truncate(req) // TODO: remove this when all callsites use truncate
        const { offset, size } = req
        console.log('delete', name, { offset, size })
        // fs.ftruncate(fd, offset, size, function (err) {
        //   if (err) return req.callback(err)
        //   req.callback(null)
        // })
        fs.unlink(name, function (err) {
          if (err) return req.callback(err)
          req.callback(null)
        })
      },    
      truncate: function (req) {
        console.log('truncate', name, req)
        fs.ftruncate(fd, req.offset, function (err) {
          if (err) return req.callback(err)
          req.callback(null)
        })
      },
      // read (req) {
      //   const self = this
      //   const data = req.data || this._alloc(req.size)
    
      //   if (!req.size) return process.nextTick(readEmpty, req)
      //   fs.read(fd, data, 0, req.size, req.offset, onread)
    
      //   function onread (err, read) {
      //     if (err) return req.callback(err)
      //     if (!read) return req.callback(createReadError(self.filename, req.offset, req.size))
    
      //     req.size -= read
      //     req.offset += read
    
      //     // what if it is expecting a uint8array?
      //     // if 

      //     if (!req.size) return req.callback(null, data)
      //     fs.read(fd, data, data.length - req.size, req.size, req.offset, onread)
      //   }
      // },      
      close: function (req) {
        if (!fd) return req.callback(null)
        console.log(name, `fs.close(fd, err => req.callback(err))`, req)
          fs.close(fd, err => req.callback(err))
      }
    })      
    console.log('new LevelRandomAccessFile', { path: name, ras });
    return ras;
  }
  return {
    DatabaseOpened,
    fs,
    createFile
  }
}
function createLockError (path) {
  const err = new Error('ELOCKED: File is locked')
  err.code = 'ELOCKED'
  err.path = path
  return err
}

function createReadError (path, offset, size) {
  const err = new Error('EPARTIALREAD: Could not satisfy length')
  err.code = 'EPARTIALREAD'
  err.path = path
  err.offset = offset
  err.size = size
  return err
}
type BaseDatabase = AbstractLevel<any, string, Buffer>;

// class LevelRandomAccessFileV1 extends RandomAccessStorage {
//   private db: AbstractSublevel<
//     AbstractLevel<any, string, Buffer>
//     , string, string, Buffer>;

//   constructor(db: AbstractLevel, path: string) {
//     super();
//     this.db = db.sublevel(path, { valueEncoding: 'binary' });
//   }

//   _open(req: any): void {
//     req.callback(null);
//   }

//   _read(req: any): void {
//     const { offset, size } = req;
//     const buffer = Buffer.alloc(size);

//     this.db.get(offset, (err, data) => {
//       if (err) return req.callback(err);
//       if (data.length < size) return req.callback(new Error('Not enough data available'));
//       req.callback(null, data.slice(0, size));
//     });
//   }

//   _write(req: any): void {
//     const { offset, data } = req;

//     this.db.put(offset, data, (err) => {
//       if (err) return req.callback(err);
//       req.callback(null);
//     });
//   }

//   _del(req: any): void {
//     const { offset, size } = req;

//     this.db.del(offset, (err) => {
//       if (err) return req.callback(err);
//       req.callback(null);
//     });
//   }

//   _close(req: any): void {
//     req.callback(null);
//   }
// }

// class LevelRandomAccessStore {
//   private db: AbstractLevel;

//   constructor(db: AbstractLevel) {
//     this.db = db;
//   }

//   createFile(path: string): LevelRandomAccessFile {
//     if (!path) throw new Error('Path is required');
//     return new LevelRandomAccessFile(this.db, path);
//   }
// }

// export { LevelRandomAccessStore };


// class LevelRandomAccessFileSystem {
//   constructor (fs: FS) {
//     this.fs = fs;
//   }
//   createFile(path) {

//   }
// }

/*
Example (CJS)

const RandomAccessStorage = require('random-access-storage')
const fs = require('fs')

const file = fileReader('index.js')

file.read(0, 10, (err, buf) => console.log('0-10: ' + buf.toString()))
file.read(40, 15, (err, buf) => console.log('40-55: ' + buf.toString()))
file.close()

function fileReader (name) {
  let fd = 0
  return new RandomAccessStorage({
    open: function (req) {
      // called once automatically before the first read call
      fs.open(name, 'r', function (err, res) {
        if (err) return req.callback(err)
        fd = res
        req.callback(null)
      })
    },
    read: function (req) {
      const buf = Buffer.allocUnsafe(req.size)
      fs.read(fd, buf, 0, buf.length, req.offset, function (err, read) {
        if (err) return req.callback(err)
        if (read < buf.length) return req.callback(new Error('Could not read'))
        req.callback(null, buf)
      })
    },
    close: function (req) {
      if (!fd) return req.callback(null)
      fs.close(fd, err => req.callback(err))
    }
  })
}


*/

