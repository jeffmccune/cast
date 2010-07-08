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

var version = require('util/version');
var rest = require('extern/restler/lib/restler');
var misc = require('util/misc');

var default_options = {
  'user_agent': version.toString(),
}

/* TODO: expose everything */
/* TODO: fixup authentication */
exports.put = function(url, options) {
  var merged = misc.merge(a, options);
  return rest.put(url, merged);
};
