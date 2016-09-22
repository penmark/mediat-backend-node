module.exports = {
  mongoUrl: 'mongodb://localhost/media',
  amqpUrl: 'amqp://localhost',
  port: process.env.PORT || 3000,
  host: '::1',
  production: process.env.NODE_ENV === 'production',
  numworkers: process.env.WORKERS || 1,
  numservers: process.env.SERVERS || 1,
  uploadDir: process.env.UPLOAD_DIR || '/tmp',
  transcodeDir: process.env.TRANSCODE_DIR || '/tmp/transcode',
  ingest: process.env.INGEST || 'ingest',
  exchange: 'mediat'
}
