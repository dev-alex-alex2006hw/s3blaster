'use strict'; // eslint-disable-line strict

/*
 * The file contains multiple scenarios for measuring performance of S3
 * specifying on MultiPart Upload (MPU). There are two cases of part size: 5 and
 *  20 MB. There are 3 measurements:
 * 1. Measures upload performance for 1GB files
 * 2. Measures get performance with single request at a time
 * 3. Measures get performance with multiple requests at a time
 */

const runS3Blaster = require('../../lib/s3blaster').runS3Blaster;
const genCmd = require('../../lib/s3blaster').genCmd;

const cmdInit = 'node_modules/.bin/mocha lib/s3blaster.js ';

const params = {
    forksNb: 1,
    bucketsNb: 1,
    bucketPrefix: 'buckets3mpu',
    objectsNb: 100,
    fillObjs: 0,
    sizes: [1],
    unit: 'GB',
    partSizes: 5, // in MB
    objMetadata: 'full',
    requests: 'multi-upload,get',
    proprReqs: [1, 1],       // proportion of requests
    range: ['all', 'all'],
    sendReqRates: ['max', 'max'],
    paralReqs: [1],
    mpuParalReqs: 20,
    schedule: 'each',
    simulDelay: 3,
    nextKey: 'seq',
    observationsNb: 1e6,
    freqShow: 1,
    samplingStep: 1,
    percentiles: [60, 80, 90, 95, 99, 100],
    runTime: 1200,
    dontCleanDB: true,
    ssm: true,
    resConsMonitor: false,
    displaySSM: true,
    liveGlobal: true,
    rate: 1000,
    statsFolder: 'stats',
    output: 'output',
    getAnyKey: true,
    message: 'S3 branch: rel/1.1,\\n' +
             'Sproxyd: tengine',
};

let folder;
if (process.env.FOLDERNAME) {
    folder = `${process.env.FOLDERNAME}`;
} else {
    folder = (new Date()).toDateString().replace(/\s/g, '_');
}

describe('Single connector, single bucket, MPU', function fn() {
    this.timeout(0);

    before(() => {
        params.statsFolder = `${folder}/s3mpu/mpu`;
        params.requests = 'multi-upload';
    });

    it('put 5MB part sizes', done => {
        params.partSizes = 5;
        params.output = 'mpu_5MB_seq';
        params.prefixKey = 'key_obj1GB_part5MB';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });

    it('put 20MB part sizes', done => {
        params.partSizes = 20;
        params.output = 'mpu_20MB_seq';
        params.prefixKey = 'key_obj1GB_part20MB';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });
});

describe('Single connector, single bucket, get', function fn() {
    this.timeout(0);

    before(() => {
        params.statsFolder = `${folder}/s3mpu/get`;
        params.requests = 'get';
    });

    it('get 5MB part sizes', done => {
        params.partSizes = 5;
        params.output = 'get_5MB_seq';
        params.prefixKey = 'key_obj1GB_part5MB';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });

    it('get 20MB part sizes', done => {
        params.partSizes = 20;
        params.output = 'get_20MB_seq';
        params.prefixKey = 'key_obj1GB_part20MB';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });
});

describe('Single connector, single bucket, get mult paralReqs', function fn() {
    this.timeout(0);

    before(() => {
        params.statsFolder = `${folder}/s3mpu/getMultParalReqs`;
        params.paralReqs = [2, 4, 8, 16];
    });

    it('get 5MB part sizes', done => {
        params.partSizes = 5;
        params.output = 'get_5MB_seq';
        params.prefixKey = 'key_obj1GB_part5MB';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });

    it('get 20MB part sizes', done => {
        params.partSizes = 20;
        params.output = 'get_20MB_seq';
        params.prefixKey = 'key_obj1GB_part20MB';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });
});

/*
 * Clean databases
 */
describe('Clean databases of simulation', function fn() {
    this.timeout(0);

    before(() => {
        params.forksNb = 1;
        params.statsFolder = `${folder}/s3mpu/clean`;
        params.paralReqs = [128];
        params.dontCleanDB = false;
        params.schedule = 'each';
        params.fillObjs = 0;
        params.requests = 'delete',
        params.observationsNb = 1;
    });

    it('Clean databases', done => {
        params.output = 'cleanDB_seq';
        const cmd = genCmd(cmdInit, params);
        process.nextTick(runS3Blaster, cmd, done);
    });
});