# mediat-backend-node [![Dependency Status](https://david-dm.org/penmark/mediat-backend-node.svg?style=flat-square)](https://david-dm.org/penmark/mediat-backend-node) [![devDependency Status](https://david-dm.org/penmark/mediat-backend-node/dev-status.svg?style=flat-square)](https://david-dm.org/penmark/mediat-backend-node#info=devDependencies)

RESTful backend for [Mediat](https://github.com/penmark/mediat-frontend) using express, mongodb, rabbitmq.

## Installation
External dependencies: ffmpeg for transcoding and [ingest](https://github.com/penmark/ingest) for ingesting media files.
Environment; see [config.js](/src/config.js). Preferrably add environment to .env file for [foreman](https://github.com/strongloop/node-foreman).

```bash
apt install ffmpeg rabbitmq-server mongodb-org-server
npm install
npm start dev
```
