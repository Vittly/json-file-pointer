'use strict';

const acorn = require('acorn');

/**
 * Shift by 1 column line in nested AST locations
 *
 * @param {Ast} ast
 *
 * @returns {Ast}
 */
function shiftLocation(ast) {
    const location = ast.loc;

    ++location.start.column;

    delete location.end;

    switch (ast.type) {
        case 'ObjectExpression':
            ast.properties.forEach(property => {
                shiftLocation(property.value);
            });
            break;

        case 'ArrayExpression':
            ast.elements.forEach(shiftLocation);
            break;
    }

    return ast;
}

/**
 * Returns AST of stringified js expression
 *
 * @param {String} jsExpression
 *
 * @returns {Ast}
 */
module.exports = jsExpression => {
    // getting last expression
    let ast = acorn.parse(jsExpression, { locations: true }).body.pop();

    // skipping expression wraps
    while (ast.type === 'ExpressionStatement') {
        ast = ast.expression;
    }

    // skipping module.exports and others
    if (ast.type === 'AssignmentExpression') {
        ast = ast.right;
    }

    return shiftLocation(ast);
};

/**
 * @typedef {Object} Ast
 *
 * @property {String} type=ArrayExpression|ObjectExpression|Literal
 *
 * @property {Ast[]} [elements] - for array
 * @property {AstProperty[]} [properties] - for object
 * @property {String|Number|Boolean} [value] - for literal
 *
 * @property {Object} loc - location in file
 * @property {AstLocation} loc.start - starting point
 */

/**
 * @typedef {Object} AstProperty
 *
 * @property {Object} key
 * @property {String} key.type=Literal|Identifier
 * @property {String} key.name
 *
 * @property {Ast} value
 */

/**
 * @typedef {Object} AstLocation
 *
 * @property {Number} line - 1-based line number
 * @property {Number} column - 1-based column number
 */
