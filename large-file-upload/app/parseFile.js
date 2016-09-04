export default function parseFile(file, options) {
  let opts       = typeof options === 'undefined' ? {} : options;
  let fileSize   = file.size;
  let chunkSize  = typeof opts['chunk_size'] === 'undefined' ?  64 * 1024 : parseInt(opts['chunk_size']);
  let binary     = typeof opts['binary'] === 'undefined' ? false : opts['binary'] == true;
  let offset     = 0;
  let self       = this; // we need a reference to the current object
  let readBlock  = null;
  let chunkReadCallback = typeof opts['chunk_read_callback'] === 'function' ? opts['chunk_read_callback'] : function() {};
  let chunkErrorCallback = typeof opts['error_callback'] === 'function' ? opts['error_callback'] : function() {};
  let success = typeof opts['success'] === 'function' ? opts['success'] : function() {};

  let onLoadHandler = function(e) {
    let data = new Uint8Array(e.target.result);
    if (e.target.error == null) {
      offset += chunkSize;
      chunkReadCallback(data, offset)
    } else {
      chunkErrorCallback(e.target.error);
      return;
    }

    if (offset >= fileSize) {
      success(file);
      return;
    }
    readBlock(offset, chunkSize, file);
  }

  readBlock = function(_offset, _chunkSize, _file) {
    let r = new FileReader();
    let blob = _file.slice(_offset, _chunkSize + _offset);
    r.onload = onLoadHandler;
    r.readAsArrayBuffer(blob)
  }
  readBlock(offset, chunkSize, file);
}
