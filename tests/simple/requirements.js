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

var req = require('util/requirements');
var assert = require('assert');

// Test compare_versions ver_b < ver_a
(function() {
  var i, version;
  var version_a = '0.2.1';
  var versions_b = [ '0.1.0', '0.1.9', '0.2.0', '0.0.0' ];

  for (i = 0; i < versions_b.length; i++) {
    version = versions_b[i];
    assert.equal(req.compare_versions(version_a, version), false);
  }
})();

// Test compare_versions ver_b >= ver_a
(function() {
  var i, version;
  var version_a = '0.2.1';
  var versions_b = [ '0.2.1', '0.2.2', '0.2.3', '0.2.9', '0.3.0', '1.0.0' ];

  for (i = 0; i < versions_b.length; i++) {
    version = versions_b[i];
    assert.ok(req.compare_versions(version_a, version));
  }
})();

// Test is_defined
(function() {
  var i, item;
  var assert_true = [ '1', ['foo', 'bar'], 1, {}, { 'foo': 'bar'}, true ];
  var assert_false = [ null, undefined, false ];

  for (i = 0; i < assert_true.length; i++) {
    item = assert_true[i];
    assert.ok(req.is_defined(null, item), item + ' is defined');
  }

  for (i = 0; i < assert_false.length; i++) {
    item = assert_false[i];
    assert.equal(req.is_defined(null, item), false);
  }
})();