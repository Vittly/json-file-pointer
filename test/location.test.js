'use strict';

const filePointer = require('../index');

describe('getLocationOf', () => {
    afterEach(() => {
        filePointer._jsonPathParse.restore();
        filePointer._jsonParse.restore();
    });

    describe('array', () => {
        beforeEach(() => {
            sinon.stub(filePointer, '_jsonPathParse');
            sinon.stub(filePointer, '_jsonParse', () => ({
                type: 'ArrayExpression',
                elements: [
                    {
                        type: 'Literal',
                        value: 'foo',
                        loc: {
                            start: '@foo'
                        }
                    },
                    {
                        type: 'ObjectExpression',
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
                                        start: '@baz'
                                    }
                                }
                            }
                        ]
                    }
                ]
            }));
        });

        it('should succeed on correct index', () => {
            assert.strictEqual(filePointer.getLocationOf('test', [0]), '@foo');
        });

        it('should succeed on long path', () => {
            assert.strictEqual(filePointer.getLocationOf('test', [1, 'bar']), '@baz');
        });

        it('should fail on wrong index', () => {
            assert.throws(() => {
                filePointer.getLocationOf('test', [2]);
            });
        });

        it('should fail on wrong property', () => {
            assert.throws(() => {
                filePointer.getLocationOf('test', ['wrong']);
            });
        });
    });

    describe('object', () => {
        beforeEach(() => {
            sinon.stub(filePointer, '_jsonPathParse');
            sinon.stub(filePointer, '_jsonParse', () => ({
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
                                start: '@bar'
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
                                start: '@baz'
                            },
                            elements: [
                                {
                                    type: 'Literal',
                                    value: 'test',
                                    loc: {
                                        start: '@test'
                                    }
                                }
                            ]
                        }
                    }
                ]
            }));
        });

        it('should succeed on correct identifier property', () => {
            assert.strictEqual(filePointer.getLocationOf('test', ['foo']), '@bar');
        });

        it('should succeed on correct literal property', () => {
            assert.strictEqual(filePointer.getLocationOf('test', ['baz']), '@baz');
        });

        it('should succeed on long path', () => {
            assert.strictEqual(filePointer.getLocationOf('test', ['baz', 0]), '@test');
        });

        it('should fail on wrong property', () => {
            assert.throws(() => {
                filePointer.getLocationOf('test', ['wrong']);
            });
        });

        it('should fail on wrong index', () => {
            assert.throws(() => {
                filePointer.getLocationOf('test', [0]);
            });
        });
    });

    describe('using plain path', () => {
        beforeEach(() => {
            sinon.stub(filePointer, '_jsonPathParse').returns([]);
            sinon.stub(filePointer, '_jsonParse').returns({ loc: { start: '@test' } });
        });

        it('should parse path string', () => {
            filePointer.getLocationOf('json', 'string.path[0]');

            assert(filePointer._jsonPathParse.called);
            assert(filePointer._jsonPathParse.calledWith('string.path[0]'));
        });
    });
});
