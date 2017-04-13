/* jshint strict: false, sub: true */
/* global print */
'use strict';

// //////////////////////////////////////////////////////////////////////////////
// / DISCLAIMER
// /
// / Copyright 2016 ArangoDB GmbH, Cologne, Germany
// / Copyright 2014 triagens GmbH, Cologne, Germany
// /
// / Licensed under the Apache License, Version 2.0 (the "License")
// / you may not use this file except in compliance with the License.
// / You may obtain a copy of the License at
// /
// /     http://www.apache.org/licenses/LICENSE-2.0
// /
// / Unless required by applicable law or agreed to in writing, software
// / distributed under the License is distributed on an "AS IS" BASIS,
// / WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// / See the License for the specific language governing permissions and
// / limitations under the License.
// /
// / Copyright holder is ArangoDB GmbH, Cologne, Germany
// /
// / @author Manuel Baesler
// //////////////////////////////////////////////////////////////////////////////

const functionsDocumentation = {
  'ldap': 'ldap tests',
};
const optionsDocumentation = [
  '   - `ldapUrl : testing authentication and authentication_paramaters will be skipped.'
];

const pu = require('@arangodb/process-utils');
const tu = require('@arangodb/test-utils');
const request = require('@arangodb/request');
const arango = require("@arangodb").arango;
const fs = require('fs');
const yaml = require('js-yaml');

// const BLUE = require('internal').COLORS.COLOR_BLUE;
const CYAN = require('internal').COLORS.COLOR_CYAN;
// const GREEN = require('internal').COLORS.COLOR_GREEN;
const RED = require('internal').COLORS.COLOR_RED;
const RESET = require('internal').COLORS.COLOR_RESET;
// const YELLOW = require('internal').COLORS.COLOR_YELLOW;

const download = require('internal').download;



// //////////////////////////////////////////////////////////////////////////////
// / @brief TEST: ldap
// //////////////////////////////////////////////////////////////////////////////

function ldap(options) {

  print(`DAP FQDN is: ${options.ldapUrl} ${options.caCertFilePath}`);
  const results = {};
  const tests = [{
    name: 'ldapBasicLDAP',
    conf: {
      'server.authentication': true,
      'server.authentication-system-only':false,
      'ldap.enabled':true,
      'ldap.server':options.ldapUrl,
      'ldap.port': 3890,
      'ldap.prefix': 'uid=',
      'ldap.suffix':',dc=example,dc=com',
      'ldap.search-filter': 'objectClass=simpleSecurityObject',
      'ldap.search-attribute': 'uid',
      'ldap.permissions-attribute-name': 'description'
    },
    user: {
      name: 'fermi',
      pass: 'password'
    },
    result:{
      statusCode: 200
    }
  },
  {
    name: 'ldapBindSearchAuth',
    conf: {
      'server.authentication': true,
      'server.authentication-system-only':false,
      'ldap.enabled':true,
      'ldap.server':options.ldapUrl,
      'ldap.port': 3890,
      'ldap.basedn':'dc=example,dc=com',
      'ldap.search-filter': 'objectClass=simpleSecurityObject',
      'ldap.search-attribute': 'uid',
      'ldap.binddn': 'cn=admin,dc=example,dc=com',
      'ldap.bindpasswd': 'hallo',
      'ldap.permissions-attribute-name': 'description'
    },
    user: {
      name: 'albert',
      pass: 'password'
    },
    result:{
      statusCode: 200
    }
  },
  {
    name: 'ldapBindSearchAuthWrongUser',
    conf: {
      'server.authentication': true,
      'server.authentication-system-only':false,
      'ldap.enabled':true,
      'ldap.server':options.ldapUrl,
      'ldap.port': 3890,
      'ldap.basedn':'dc=example,dc=com',
      'ldap.search-filter': 'objectClass=simpleSecurityObject',
      'ldap.search-attribute': 'uid',
      'ldap.binddn': 'cn=admin,dc=example,dc=com',
      'ldap.bindpasswd': 'hallo',
      'ldap.permissions-attribute-name': 'description'
    },
    user: {
      name: 'werner',
      pass: 'password'
    },
    result:{
      statusCode: 500
    }
  },
  {
    name: 'ldapUrlBindSearchAuth',
    conf: {
      'server.authentication': true,
      'server.authentication-system-only':false,
      'ldap.enabled':true,
      'ldap.url':`ldap://${options.ldapUrl}:3890/dc=example,dc=com?uid?sub`,
      'ldap.search-filter': 'objectClass=simpleSecurityObject',
      'ldap.binddn': 'cn=admin,dc=example,dc=com',
      'ldap.bindpasswd': 'hallo',
      'ldap.permissions-attribute-name': 'description'
    },
    user: {
      name: 'fermi',
      pass: 'password'
    },
    result: {
      statusCode: 200
    }
  },
  {
    name: 'ldapUrlBindSearchTlsAuth',
    conf: {
      'server.authentication': true,
      'server.authentication-system-only':false,
      'ldap.enabled':true,
      'ldap.url':`ldap://${options.ldapUrl}:3890/dc=example,dc=com?uid?sub`,
      'ldap.search-filter': 'objectClass=simpleSecurityObject',
      'ldap.binddn': 'cn=admin,dc=example,dc=com',
      'ldap.bindpasswd': 'hallo',
      'ldap.permissions-attribute-name': 'description',
      'ldap.tls': true,
      'ldap.tls-cacert-file': options.caCertFilePath,
      'ldap.tls-cert-check-strategy': 'hard'

    },
    user: {
      name: 'fermi',
      pass: 'password'
    },
    result: {
      statusCode: 200
    }
  }];

  if (options.skipLdap === true) {
    print('skipping LDAP tests!');
    return {
      ldap: {
        status: true,
        skipped: true
      }
    };
  } // if

  if (options.cluster) {
    print('skipping LDAP tests on cluster!');
    return {
      ldap: {
        status: true,
        skipped: true
      }
    };
  }

  print(CYAN + 'LDAP tests...' + RESET);

  for(const t of tests) {
    const adbInstance = pu.startInstance('tcp', options, t.conf, 'ldap');
    const res = request.post({
      url:`${adbInstance.arangods[0].url}/_open/auth`,
      body: JSON.stringify({username: t.user.name, password: t.user.pass})
    });

    results[t.name] = { status: t.result.statusCode == res.statusCode };

    pu.shutdownInstance(adbInstance, options);
  }

  print(results);
  return results;
}

exports.setup = function(testFns, defaultFns, opts, fnDocs, optionsDoc) {
  testFns['ldap'] = ldap;
  defaultFns.push('ldap');
  opts['ldapUrl'] = '127.0.0.1';
  opts['caCertFilePath'] = '~/ca_cert.pem';

  for (var attrname in functionsDocumentation) { fnDocs[attrname] = functionsDocumentation[attrname]; }
  for (var i = 0; i < optionsDocumentation.length; i++) { optionsDoc.push(optionsDocumentation[i]); }
}
