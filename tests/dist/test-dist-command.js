/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require('path');
var assert = require('assert');
var exec = require('child_process').exec;

var sprintf = require('sprintf').sprintf;

var test = require('util/test');
var version = require('util/version');

var cwd = process.cwd();

exports['test_dist_command_works'] = function() {
  var versionString = version.toString().replace('-dev', '');
  var tarballname = sprintf('%s.tar.gz', versionString);
  var tarballPath = path.join(cwd, 'dist', tarballname);
  var tarballMd5SumPath = path.join(cwd, 'dist',
                                    sprintf('%s.md5sum', tarballname));

  // Make sure the distribution tarball doesn't exist
  assert.ok(!test.fileExists(tarballPath));
  exec('scons dist --no-deps', function(err, stdout, stderr) {
    // Make sure the distribution tarball and md5sum file has been created
    assert.ok(test.fileExists(tarballPath));
    assert.ok(test.fileExists(tarballMd5SumPath));
  });
};
