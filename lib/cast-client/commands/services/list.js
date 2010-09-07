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

var sprintf = require('extern/sprintf').sprintf;

var http = require('util/http');
var terminal = require('util/terminal');

var config = {
  'short_description': 'Print a list of available services',
  'long_description': 'Print a list of available services.',
  'required_arguments' : [],
  'optional_arguments': [],
  'switches': []
};

function handle_command(args) {
  // @TODO: Use remotes
  http.get_response('http://127.0.0.1:8010/services/', function(error, response) {
    if (error) {
      sys.puts(sprintf('Error: ', error.message));
    }

    var services = JSON.parse(response);

    sys.puts('Available services: \n');
    terminal.print_table([{'title': 'Name', 'value_property': 'name', 'padding_right': 30},
                          {'title': 'Enabled', 'value_property': 'enabled', 'padding_right': 20},
                          {'title': 'Status', 'value_property': 'status', 'format_function': format_status}],
                          services,
                          'No services available')
  });
}

var format_status = function(value) {
  if (!value) {
    return 'service is disabled';
  }

  return sprintf('pid: %s, state: %s', value.pid, value.state);
}

exports.config = config;
exports.handle_command = handle_command;