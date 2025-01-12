import RandomAccessStorage from 'random-access-storage';

import { fs, FsReady } from '@/app/shared/zen-fs';

export function createLevelRandomAccessFileSystem() {
  const DatabaseOpened = FsReady

  function createFile(name: string) {
    // replace / with escape character
    name = name.replace(/\//g, '$');
    name = "/" + name;

    let fd = 0;
    const ras = new RandomAccessStorage({
      createAlways: true,     
      open: function (req) {
        DatabaseOpened.then(() => {
          const next = () => {
            fs.open(name, 'a+', function (err, res) {
              if (err) return req.callback(err)
              fd = res
              req.callback(null)
            })
          }
          next()
        })        
      },
      stat: function (req) {
        fs.stat(name, function (err, stat) {
          if (err) return req.callback(err)
          req.callback(null, { size: stat.size })
        })
      },
      write (req) {
        let data = req.data
        if (data.buffer) {
          data = Buffer.from(data)
        }
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
        if (req.size === Infinity) return this.truncate(req)
        const { offset, size } = req
        fs.unlink(name, function (err) {
          if (err) return req.callback(err)
          req.callback(null)
        })
      },    
      truncate: function (req) {
        fs.ftruncate(fd, req.offset, function (err) {
          if (err) return req.callback(err)
          req.callback(null)
        })
      },
      close: function (req) {
        if (!fd) return req.callback(null)
          fs.close(fd, err => req.callback(err))
      }
    })      
    return ras;
  }
  return {
    DatabaseOpened,
    fs,
    createFile
  }
}