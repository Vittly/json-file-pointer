'use strict';

const JSON_PATH_SEPARATOR_RE = /\.|(\[\d+\])/,
    JSON_PATH_INDEX_RE = /^\[(\d+)\]$/;

/**
 * Returns parsed path in json
 *
 * @param {String} jsonPath
 *
 * @returns {Array.<String|Number>}
 */
module.exports = jsonPath =>
    jsonPath
        .split(JSON_PATH_SEPARATOR_RE)
        .filter(Boolean)
        .map(token => {
            const indexMatch = token.match(JSON_PATH_INDEX_RE);

            return indexMatch ? Number(indexMatch[1]) : token;
        });
