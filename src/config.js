module.exports = {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost/media',
  amqpUrl: process.env.AMQP_URL || 'amqp://localhost',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '::1',
  production: process.env.NODE_ENV === 'production',
  numworkers: process.env.WORKERS || 1,
  numservers: process.env.SERVERS || 1,
  uploadDir: process.env.UPLOAD_DIR || '/tmp',
  transcodeDir: process.env.TRANSCODE_DIR || '/tmp/transcode',
  ingest: process.env.INGEST || 'ingest',
  exchange: 'mediat'
}
