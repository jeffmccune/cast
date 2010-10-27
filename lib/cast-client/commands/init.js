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
var fs = require('fs');
var path = require('path');

var manifest = require('manifest/index');
var manifest_constants = require('manifest/constants');
var term = require('util/terminal');
var constants = require('util/constants');

var async = require('extern/async');
var apptypes = manifest_constants.APPLICATION_TYPES;
var quotedtypes = manifest_constants.APPLICATION_TYPES.map(function(type) {
  return '\'' + type + '\'';
});

/** Configuration options for create subcommand */
exports.config = {
  'short_description': 'Create a simple manifest file',
  'long_description': 'Create a simple manifest file by answering a series of'
                      + ' questions. Optionally specify manifest parameters'
                      + ' from the command line.',
  'required_arguments': [
    ['entry_file', 'The entry file of the application']
  ],
  'optional_arguments': [],
  'options': [
    {
      names: ['--apppath', '-a'],
      dest: 'apppath',
      title: 'path',
      action: 'store',
      desc: 'Path to the root of the application'
    },
    {
      names: ['--name', '-n'],
      dest: 'name',
      action: 'store',
      desc: 'The name of the application.'
    },
    {
      names: ['--type', '-t'],
      dest: 'type',
      action: 'store',
      desc: 'Specify the type of the applicaton. Available types are '
            + quotedtypes.slice(0, -1).join(', ')
            + ' and ' + quotedtypes.slice(-1),
    },
    {
      names: ['--template', '-t'],
      dest: 'templates',
      title: 'file',
      action: 'append',
      desc: 'Specify files that should be rendered as templates during'
            + ' deployment. Use once for each file to be templated.',
    },
    {
      names: ['--datafile', '-d'],
      dest: 'data_files',
      title: 'file',
      action: 'append',
      desc: 'Specify files that may be programatically modified during'
            + ' operation of the application. These will not be replaced'
            + ' during upgrades',
    },
    {
      names: ['--force', '-f'],
      dest: 'force',
      action: 'store_true',
      desc: 'Replace an existing manifest file.'
    }
  ]
};

function make_path_relative(file, root, require_file, cb)
{
  // Make the path absolute and normal
  if (file[0] !== '/') {
    file = path.normalize(path.join(process.cwd(), file));
  }
  else {
    file = path.normalize(file);
  }

  // This will be called shortly to make the path relative to the root
  function relativise() {
    if (file.indexOf(root) !== 0) {
      return cb(new Error(file + " is not within " + root));
    }

    file = file.slice(root.length);
    if (file[0] === '/') {
      file = file.slice(1);
    }

    return cb(null, file);
  }

  // Make sure the file exists, if required
  if (require_file) {
    fs.stat(file, function(err, stats) {
      if (err) {
        return cb(new Error("Unable to read " + file));
      }
      else if(!stats.isFile()) {
        return cb(new Error(file + " is not a file"));
      }
      relativise();
    });
  }
  else {
    relativise();
  }
}

/**
 * Handler for creating a manifest.
 * @param {Object} args Command line options and arguments.
 */
exports.handle_command = function(args)
{
  var apppath = args.apppath || process.cwd();
  if (apppath[0] !== '/') {
    apppath = path.normalize(path.join(process.cwd(), apppath));
  }

  var manifest_path, tmppath, entry_path, templates, data_files;
  var manifest = {};

  manifest_path = path.join(apppath, manifest_constants.MANIFEST_FILENAME);
  tmppath = manifest_path + ".tmp";

  async.waterfall([
    // See if a manifest already exists
    function(callback) {
      fs.stat(manifest_path, function(err, stats) {
        // Errors other than non-existant manifest
        if (err && err.errno !== constants.ENOENT) {
          return callback(new Error("Error at manifest path: " + err.message));
        }
        // The manifest exists but is not a file
        else if (!err && !stats.isFile()) {
          return callback(new Error("Manifest path exists and is not a file"));
        }
        // The manifest exists and no --force
        else if (!err && !args.force) {
          return callback(new Error("Manifest already exists, use --force to overwrite"));
        }
        return callback();
      });
    },

    // Validate the application type
    function(callback) {
      if (args.type && apptypes.indexOf(args.type) < 0) {
        return callback(new Error("Unknown application type specified"));
      }
      else {
        return callback();
      }
    },

    // Validate the application root
    function(callback) {
      fs.stat(apppath, function(err, stats) {
        if (!err && !stats.isDirectory()) {
          err = new Error("Specified application root is not a directory");
        }
        return callback(err);
      });
    },

    // Validate the entry file
    function(callback) {
      make_path_relative(args.entry_file, apppath, true, function(err, file) {
        entry_path = file;
        return callback(err);
      });
    },

    // Validate the template files
    function(callback) {
      templates = [];
      if (!args.templates) {
        return callback();
      }
      async.forEach(args.templates, function(template, callback) {
        // Template files must exist
        make_path_relative(template, apppath, true, function(err, file) {
          templates.push(file);
          return callback(err);
        });
      },
      function(err) {
        return callback(err);
      });
    },

    // Validate the data files
    function(callback) {
      data_files = [];
      if (!args.data_files) {
        return callback();
      }
      async.forEach(args.data_files, function(dfile, callback) {
        // Data files don't necessarily exist
        make_path_relative(dfile, apppath, false, function(err, file) {
          data_files.push(file);
          return callback(err);
        });
      },
      function(err) {
        return callback(err);
      });
    },

    // Get the name of the application, if it wasn't provided
    function(callback) {
      if (args.name) {
        manifest.name = args.name;
        return callback();
      }
      term.prompt('Application Name:', false, false, function(name) {
        manifest.name = name;
        return callback();
      });
    },

    // Get a description of the application
    function(callback) {
      term.prompt('Application Description:', false, false, function(desc) {
        manifest.description = desc;
        return callback();
      });
    },

    // Get the application type
    function(callback) {
      if (args.type) {
        manifest.type = args.type;
        return callback();
      }
      term.prompt('Application Type:', apptypes, apptypes[0], function(type) {
        manifest.type = type;
        return callback();
      });
    },

    // Set the entry_file
    function(callback) {
      manifest.entry_file = entry_path;
      return callback();
    },

    // Store template and data file paths
    function(callback) {
      manifest.template_files = templates;
      manifest.data_files = data_files;
      return callback();
    },

    // Ask about default checks
    function(callback) {
      if (manifest_constants.HEALTH_CHECKS[manifest.type].length != 0) {
        // TODO: It would be nice to give a more user-friendly check description
        var query = "The '" + manifest.type + "' application type specifies"
                    + " following default health checks:\n"
                    + JSON.stringify(manifest_constants.HEALTH_CHECKS[manifest.type], null, 4)
                    + "\nWould you like to enable these checks?";
        term.prompt(query, ['y', 'n'], 'y', function(resp) {
          if (resp === 'y') {
            manifest.health_checks = manifest_constants.HEALTH_CHECKS[manifest.type];
          }
          return callback();
        });
      }
      else {
        return callback();
      }
    },

    // Store the manifest file
    function(callback) {
      var fstream = fs.createWriteStream(tmppath);

      fstream.write(JSON.stringify(manifest, null, 4));
      fstream.end();

      fstream.on('close', function() {
        fs.rename(tmppath, manifest_path, function(err) {
          if (err) {
            err = new Error("Error moving manifest file to permanent location: " + err);
          }
          return callback(err);
        });
      });

      fstream.on('error', function(err) {
        fstream.removeAllListeners('end');
        return callback(new Error('Error writing manifest file: ' + err));
      });
    }
  ],
  function(err) {
    if (err) {
      sys.puts('Error: ' + err.message);

      // Clean up temporary file if it exists
      path.exists(tmppath, function(exists) {
        if (exists) {
          fs.unlink(tmppath, function(err) {
            if (err) {
              sys.puts('Unable to remove temporary file at ' + tmppath);
            }
          });
        }
      });
    }
    else {
      sys.puts('Manifest created');
    }
  });
};