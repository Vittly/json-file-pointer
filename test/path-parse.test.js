'use strict';

const jsonPathParse = require('../lib/json-path-parser');

describe('jsonPathParse', () => {
    it('should parse path string 1', () => {
        assert.deepEqual(
            jsonPathParse('shouldDeps[0].elems[1].mods'),
            ['shouldDeps', 0, 'elems', 1, 'mods']
        );
    });

    it('should parse path string 2', () => {
        assert.deepEqual(
            jsonPathParse('matrix[0][1].cell.head[5]'),
            ['matrix', 0, 1, 'cell', 'head', 5]
        );
    });
});
