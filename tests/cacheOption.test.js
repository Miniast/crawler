/*jshint expr:true */
'use strict';

import Crawler from '../dist/index.js';
import { expect } from 'chai';
import nock from 'nock';

var c;
var scope;
var httpTarget = 'http://target.com';

describe('Cache features tests', function () {
    describe('Skip Duplicate active', function () {
        beforeEach(function () {
            scope = nock('http://target.com');
        });
        afterEach(function () {
            c = {};
        });

        it('should not skip one single url', function (done) {
            var call = scope.get('/').reply(200);
            c = new Crawler({
                jQuery: false,
                skipDuplicates: true,
                callback: function (error, result) {
                    expect(error).to.be.null;
                    expect(result.statusCode).to.equal(200);
                    expect(call.isDone()).to.be.true;
                    done();
                },
            });

            c.queue(httpTarget);
        });

        it('should notify the callback when an error occurs and "retries" is disabled', function (done) {
            var koScope = scope.get('/').replyWithError('too bad');
            c = new Crawler({
                jQuery: false,
                skipDuplicates: true,
                retries: 0,
                callback: function (error) {
                    expect(error).to.exist;
                    expect(koScope.isDone()).to.be.true;
                    done();
                },
            });

            c.queue(httpTarget);
        });

        it('should retry and notify the callback when an error occurs and "retries" is enabled', function (done) {
            var koScope = scope.get('/').replyWithError('too bad').persist();

            c = new Crawler({
                jQuery: false,
                skipDuplicates: true,
                retries: 1,
                retryInterval: 10,
                callback: function (error) {
                    expect(error).to.exist;
                    expect(koScope.isDone()).to.be.true;
                    scope.persist(false);
                    done();
                },
            });

            c.queue(httpTarget);
        });

        //it('should skip previous crawled urls', function (done) {});
    });
});

