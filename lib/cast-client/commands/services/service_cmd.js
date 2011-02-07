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

var sys = require('sys');
var path = require('path');

var http = require('util/http');

var sprintf = require('extern/sprintf').sprintf;

exports.build_command = function(mod, action, action_ptense) {
  var action_capped = action.charAt(0).toUpperCase() + action.slice(1);

  mod.exports.config = {
    'short_description': sprintf('%s a service', action_capped),
    'long_description': sprintf('%s a service on the specified remote', action_capped),
    'required_arguments': [
      ['name', sprintf('The name of the service to %s', action)]
    ],
    'optional_arguments': [],
    'uses_global_options': ['remote']
  };

  mod.exports.handle_command = function(args) {
    var action_path = path.join('/', 'services', args.name, action, '/');
    http.get_response(args.remote, action_path, 'PUT', true, function(error, response) {
      if (error) {
        error = error;
        return sys.puts('Error: ' + error.message);
      }

      if (response.status_code !== 200) {
        console.log(response);
        return sys.puts(sprintf('HTTP Error, status code: %d', response.status_code));
      }

      sys.puts(sprintf('Service \'%s\' %s.', args.name, action_ptense));
    });
  };
};