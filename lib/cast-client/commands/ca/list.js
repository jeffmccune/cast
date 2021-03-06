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

var sprintf = require('sprintf').sprintf;

var http = require('util/http');
var terminal = require('util/terminal');

var config = {
  shortDescription: 'Print a list of pending Certificate Signing Requests',
  longDescription: 'Print a list of Certificate Signing Requests that are ' +
      'currently pending (or specify --all to list all requests) on the ' +
      'specified remote.',
  requiredArguments: [],
  optionalArguments: [],
  options: [
    {
      names: ['--all', '-a'],
      dest: 'listAll',
      action: 'store_true',
      desc: 'List CSRs, even if they are already signed.'
    }
  ],
  usesGlobalOptions: ['remote']
};

function handleCommand(args) {
  http.getApiResponse(args.remote, '1.0', '/ca/', 'GET', null, true,
                      function(err, response) {
    if (err) {
      sys.puts('Error: ' + err.message);
      return;
    }

    if (response.statusCode !== 200) {
      if (response.body.message) {
        sys.puts('Error: ' + response.body.message);
      }
      else {
        sys.puts('Error: invalid response');
      }
      return;
    }

    var requests = response.body;
    var headingDesc;

    if (!args.listAll) {
      requests = requests.filter(function(request) {
        return !request.signed;
      });
      headingDesc = 'unsigned';
    } else {
      headingDesc = 'all';
    }

    sys.puts(sprintf('Certificate Signing Requests (%s): \n', headingDesc));
    terminal.printTable([
      {
        title: 'Hostname',
        valueProperty: 'hostname',
        paddingRight: 50
      },
      {
        title: 'Status',
        valueProperty: 'status',
        paddingRight: 25
      }
    ], requests, 'No CSRs');
  });
}

exports.config = config;
exports.handleCommand = handleCommand;
