const cp = require('child_process')
const util = require('../util')
const EventEmitter = require('events')
const Promise = require('bluebird')

function probe(filename) {
  return new Promise((resolve, reject) => {
    cp.execFile('ffprobe', ['-v', 'error', '-show_format',
      '-print_format', 'json', filename], (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr))
      } else {
        resolve(JSON.parse(stdout).format)
      }
    })
  })
}

function transcode(infile, outfile, metadata) {
  const emitter = new EventEmitter()
  Promise.coroutine(function* () {
    const duration = yield probe(infile)
      .then(format => format.duration * 1e6)
      .catch(err => {emitter.emit('error', `failed to probe ${infile}: ${err}`)})
    let command = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y',
      '-progress', '-', '-i', infile, '-codec:v', 'h264',
      '-codec:a', 'aac', '-strict', '-2', outfile]
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        command = command.slice(0, -1)
          .concat(['-metadata', `${key}=${metadata[key]}`])
          .concat(command.slice(-1))
      })
    }
    const ffmpeg = cp.spawn(command[0], command.slice(1))
    ffmpeg.stdout.on('data', data => {
        const outTime = data.toString().split(/\r?\n/)
          .filter(line => line.startsWith('out_time_ms'))
          .map(line => line.split('=')[1])[0]
        emitter.emit('progress', outTime / duration)
    })
    ffmpeg.stderr.on('data', data => {
      emitter.emit('error', data.toString())
    })
    ffmpeg.on('error', err => {
     emitter.emit('error', err)
    })
    ffmpeg.on('exit', (code) => {
      emitter.emit('exit', code)
    })
  })()
  return emitter
}

module.exports = {transcode, probe}

if (require.main === module) {
  console.log('doop')
  const transcoder = transcode(process.argv[2], process.argv[3], process.argv[4])
  transcoder.on('progress', (progress) => console.log('progress:', progress))
  transcoder.on('exit', (code) => console.log('exit code:', code))
  transcoder.on('error', (error) => console.log('error:', error))
}
