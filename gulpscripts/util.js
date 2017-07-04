const gutil = require('gulp-util');
const Readable = require('readable-stream/readable');

class FileObjectEmitter extends Readable {
  constructor(options) {
    super(Object.assign(options || {}, { objectMode: true }));
    this._fileDefs = options.files.slice() || [];
    this._fileFactory = options.factory || this._defaultFileFactory;
  }

  _defaultFileFactory(entry) {
    return new gutil.File(entry);
  }

  _read() {
    if (!this._fileDefs.length) {
      this.push(null);
      return;
    }

    const nextDef = this._fileDefs.shift();
    const nextFile = this._fileFactory(nextDef);

    this.push(nextFile);
  }
}

Object.assign(exports, {
  FileObjectEmitter,
});
