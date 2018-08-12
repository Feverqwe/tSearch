import _escapeRegExp from 'lodash.escaperegexp';
import getPortSchemes from "./getPortSchemes";

const required = require('requires-port');

const getScheme = scheme => {
  if (!scheme || scheme === '*:') {
    return '[^:]+:\/\/';
  }
  return _escapeRegExp(scheme.toLowerCase()) + '\/\/';
};

const getPort = (port, scheme) => {
  if (!port) {
    return '(?::\\\d+)?';
  }
  if (scheme && !required(port, scheme)) {
    return '';
  }
  return _escapeRegExp(':' + port);
};

const hostnameToRePatten = (scheme, hostname, port) => {
  return '^' + getScheme(scheme) + _escapeRegExp(hostname.toLowerCase()).replace(/\\\*\\\./g, '.+\\.') + getPort(port, scheme) + '$';
};

const normalizePattern = pattern => {
  const m1 = /^((?:[^:]+:\/\/)?[^\/]+)/.exec(pattern);
  if (m1) {
    return m1[1];
  } else {
    return pattern;
  }
};

const urlPatternToStrRe = function (pattern) {
  const result = [];

  pattern = normalizePattern(pattern);

  const m = /^(?:([^:]+:)\/\/)?(?:(.+):([0-9]+)|(.+))$/.exec(pattern);
  if (m) {
    const scheme = m[1];
    const hostnameOrIpLiteral = m[2] || m[4];
    const port = m[3];
    const schemes = [scheme, ...getPortSchemes(port)];
    schemes.forEach(scheme => {
      let hostname = hostnameOrIpLiteral;
      if (/^\./.test(hostname)) {
        hostname = '*' + hostname;
      }
      const hostnameList = [hostname];
      if (/^\*\./.test(hostname)) {
        hostnameList.push(hostname.substr(2));
      }
      hostnameList.forEach(hostname => {
        result.push(hostnameToRePatten(scheme, hostname, port));
      });
    });
  } else {
    throw new Error('Invalid url-pattern');
  }
  return result;
};

export default urlPatternToStrRe;