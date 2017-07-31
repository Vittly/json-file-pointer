'use strict';

const acorn = require('acorn');

/**
 * Prepare ast:
 *   - shift column by 1
 *   - throw if non literal found
 *
 * @param {Ast} ast
 */
function deepPrepare(ast) {
    const location = ast.loc;

    ++location.start.column;

    delete location.end;

    switch (ast.type) {
        case 'ObjectExpression':
            ast.properties.forEach(property => {
                deepPrepare(property.value);
            });
            break;

        case 'ArrayExpression':
            ast.elements.forEach(deepPrepare);
            break;

        case 'Literal':
            break;

        default:
            throw new Error(`Unexpected node type: ${ast.type}`);
    }
}

/**
 * Converts:
 *   - 'exports.foo = {}' to '{ foo: {} }'
 *   - 'module.exports = {}' to '{}'
 *   - others to undefined
 *
 * @param {Ast} leftAst
 * @param {Ast} rightAst
 *
 * @returns {Ast|undefined}
 */
function processExports(leftAst, rightAst) {
    if (leftAst.type === 'MemberExpression') {
        const leftObject = leftAst.object,
            leftProperty = leftAst.property;

        if (leftObject.type === 'Identifier' && leftProperty.type === 'Identifier') {
            if (leftObject.name === 'module' && leftProperty.name === 'exports') {
                return rightAst;
            }

            if (leftObject.name === 'exports') {
                return {
                    type: 'ObjectExpression',
                    loc: leftObject.loc,
                    properties: [{
                        key: leftProperty,
                        value: rightAst
                    }]
                };
            }
        }
    }
}

/**
 * Returns AST of stringified js expression
 *
 * @param {String} jsExpression
 *
 * @returns {Ast}
 */
module.exports = jsExpression => {
    let ast;

    try {
        // getting last expression
        ast = acorn.parse(jsExpression, { locations: true }).body.pop();
    } catch (e) {
        return;
    }

    // skipping expression wraps
    if (ast.type === 'ExpressionStatement') {
        ast = ast.expression;
    }

    // processing module.exports/exports
    if (ast.type === 'AssignmentExpression') {
        ast = processExports(ast.left, ast.right);
    }

    try {
        deepPrepare(ast);
    } catch (e) {
        return;
    }

    return ast;
};

/**
 * @typedef {Object} Ast
 *
 * @property {String} type=ArrayExpression|ObjectExpression|Literal|Identifier|MemberExpression|AssignmentExpression|ExpressionStatement
 *
 * @property {Ast[]} [elements] - for array
 * @property {AstProperty[]} [properties] - for object
 * @property {String|Number|Boolean} [value] - for literal
 * @property {String} [name] - for identifier
 * @property {Ast} [expression] - for expression
 *
 * @property {Ast} [object] - left part of member expr
 * @property {Ast} [property] - right part of member expr
 *
 * @property {Ast} [left] - left part of assignment
 * @property {Ast} [right] - right part of assignment
 *
 * @property {Object} loc - location in file
 * @property {AstLocation} loc.start - starting point
 */

/**
 * @typedef {Object} AstProperty
 *
 * @property {Ast} key
 * @property {Ast} value
 */

/**
 * @typedef {Object} AstLocation
 *
 * @property {Number} line - 1-based line number
 * @property {Number} column - 1-based column number
 */
