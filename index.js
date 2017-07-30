'use strict';

/**
 * Make a step in ast
 *
 * @param {Ast|undefined} ast
 * @param {String|Number} step
 *
 * @returns {Ast|undefined}
 */
function stepInto(ast, step) {
    if (typeof ast === 'undefined') return;

    // index step in array
    if (typeof step === 'number' && ast.type === 'ArrayExpression') {
        return ast.elements[step];
    }

    // property step in object
    if (typeof step === 'string' && ast.type === 'ObjectExpression') {
        const itemProperty = ast.properties.find(property => {
            const key = property.key;

            return (key.type === 'Identifier' && key.name === step) ||
                (key.type === 'Literal' && key.value === step);
        });

        return itemProperty && itemProperty.value;
    }
}

module.exports = {
    _jsonParse: require('./lib/json-parser'),
    _jsonPathParse: require('./lib/json-path-parser'),

    /**
     * Returns line/column location of path in json
     *
     * @param {String} jsExpression
     * @param {Array.<String|Number>|String} path - path in json like '["prop1", 1, "prop2"]' or 'prop1[1].prop2'
     *
     * @returns {AstLocation}
     */
    getLocationOf: function(jsExpression, path) {
        const parsedPath = Array.isArray(path) ? path : this._jsonPathParse(path),
            beginAst = this._jsonParse(jsExpression);

        if (typeof beginAst === 'undefined') {
            throw new Error('invalid source');
        }

        const endAst = parsedPath.reduce(stepInto, beginAst);

        if (typeof endAst === 'undefined') {
            throw new Error('unexpected end of path ' + JSON.stringify(path));
        }

        return endAst.loc.start;
    }
};
