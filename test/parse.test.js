'use strict';

const acorn = require('acorn'),
    jsonParse = require('../lib/json-parser');

describe('jsonParse', () => {
    function smallestLocation() {
        return { start: { line: 1, column: 0 }, end: 'to-remove' };
    }

    function stubExpression(items) {
        sinon.stub(acorn, 'parse', () => ({ body: [].concat(items) }));
    }

    afterEach(() => {
        acorn.parse.restore();
    });

    it('should parse array skipping expression', () => {
        stubExpression({
            type: 'ExpressionStatement',
            expression: {
                type: 'ArrayExpression',
                elements: [{
                    type: 'Literal',
                    value: 'foo',
                    loc: smallestLocation()

                }],
                loc: smallestLocation()
            }
        });

        assert.containSubset(jsonParse(), {
            type: 'ArrayExpression',
            elements: [{
                type: 'Literal',
                value: 'foo'
            }]
        });
    });

    it('should parse object skipping expression', () => {
        stubExpression({
            type: 'ExpressionStatement',
            expression: {
                type: 'ObjectExpression',
                properties: [{
                    key: {
                        type: 'Literal',
                        value: 'foo',
                        loc: smallestLocation()
                    },
                    value: {
                        type: 'Literal',
                        value: 'bar',
                        loc: smallestLocation()
                    },
                    loc: smallestLocation()

                }],
                loc: smallestLocation()
            }
        });

        assert.containSubset(jsonParse(), {
            type: 'ObjectExpression',
            properties: [{
                key: {
                    type: 'Literal',
                    value: 'foo'
                },
                value: {
                    type: 'Literal',
                    value: 'bar'
                }
            }]
        });
    });

    it('should return nodes with 1-based column', () => {
        stubExpression({
            type: 'ExpressionStatement',
            expression: {
                type: 'ArrayExpression',
                elements: [{
                    type: 'Literal',
                    value: 100500,
                    loc: smallestLocation()

                }],
                loc: smallestLocation()
            }
        });

        assert.containSubset(jsonParse(), {
            elements: [{
                loc: { start: { column: 1 } }
            }],
            loc: { start: { column: 1 } }
        });
    });

    it('should return last expression', () => {
        stubExpression([
            {
                type: 'ExpressionStatement',
                expression: {
                    type: 'ArrayExpression',
                    elements: [],
                    loc: smallestLocation()
                }
            },
            {
                type: 'ExpressionStatement',
                expression: {
                    type: 'ObjectExpression',
                    properties: [],
                    loc: smallestLocation()
                }
            }
        ]);

        assert.containSubset(jsonParse(), {
            type: 'ObjectExpression'
        });
    });

    it('should return undefined if non literal found', () => {
        stubExpression({
            type: 'ExpressionStatement',
            expression: {
                type: 'ArrayExpression',
                elements: [{
                    type: 'Identifier',
                    name: 'variable',
                    loc: smallestLocation()

                }],
                loc: smallestLocation()
            }
        });

        assert.isUndefined(jsonParse());
    });

    it('should parse module.exports', () => {
        stubExpression({
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                left: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: 'module'
                    },
                    property: {
                        type: 'Identifier',
                        name: 'exports'
                    }
                },
                right: {
                    type: 'ArrayExpression',
                    elements: [{
                        type: 'Literal',
                        value: 'foo',
                        loc: smallestLocation()
                    }],
                    loc: smallestLocation()
                }
            }
        });

        assert.containSubset(jsonParse(), {
            type: 'ArrayExpression',
            elements: [{
                type: 'Literal',
                value: 'foo'
            }]
        });
    });

    it('should parse exports', () => {
        stubExpression({
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                left: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: 'exports',
                        loc: smallestLocation()
                    },
                    property: {
                        type: 'Identifier',
                        name: 'foo',
                        loc: smallestLocation()
                    }
                },
                right: {
                    type: 'ArrayExpression',
                    elements: [{
                        type: 'Literal',
                        value: 'bar',
                        loc: smallestLocation()
                    }],
                    loc: smallestLocation()
                }
            }
        });

        assert.containSubset(jsonParse(), {
            type: 'ObjectExpression',
            properties: [{
                key: {
                    type: 'Identifier',
                    name: 'foo'
                },
                value: {
                    type: 'ArrayExpression',
                    elements: [{
                        type: 'Literal',
                        value: 'bar'
                    }]
                }
            }]
        });
    });
});
