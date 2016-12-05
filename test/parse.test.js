'use strict';

const jsonParse = require('../lib/json-parser');

describe('jsonParse', () => {
    it('should parse array', () => {
        const ARRAY_JSON = [
                '([',
                '    "foo",',
                '    {',
                '        bar: "baz"',
                '    }',
                '])'
            ].join('\n');

        assert.containSubset(jsonParse(ARRAY_JSON), {
            type: 'ArrayExpression',
            elements: [
                {
                    type: 'Literal',
                    value: 'foo',
                    loc: {
                        start: {
                            line: 2,
                            column: 5
                        }
                    }
                },
                {
                    type: 'ObjectExpression',
                    loc: {
                        start: {
                            line: 3,
                            column: 5
                        }
                    },
                    properties: [
                        {
                            key: {
                                type: 'Identifier',
                                name: 'bar'
                            },
                            value: {
                                type: 'Literal',
                                value: 'baz',
                                loc: {
                                    start: {
                                        line: 4,
                                        column: 14
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        });
    });

    it('should parse object', () => {
        const OBJECT_JSON = [
            'module.exports = {',
            '    foo: "bar",',
            '    "baz": [',
            '        "test"',
            '    ]',
            '}'
        ].join('\n');

        assert.containSubset(jsonParse(OBJECT_JSON), {
            type: 'ObjectExpression',
            properties: [
                {
                    key: {
                        type: 'Identifier',
                        name: 'foo'
                    },
                    value: {
                        type: 'Literal',
                        value: 'bar',
                        loc: {
                            start: {
                                line: 2,
                                column: 10
                            }
                        }
                    }
                },
                {
                    key: {
                        type: 'Literal',
                        value: 'baz'
                    },
                    value: {
                        type: 'ArrayExpression',
                        loc: {
                            start: {
                                line: 3,
                                column: 12
                            }
                        },
                        elements: [
                            {
                                type: 'Literal',
                                value: 'test',
                                loc: {
                                    start: {
                                        line: 4,
                                        column: 9
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        });
    });
});
