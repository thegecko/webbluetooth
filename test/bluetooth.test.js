const assert = require('assert');
const bluetooth = require('../').bluetooth

describe('bluetooth module', () => {
    it('should describe basic constants', () => {
        assert.notEqual(bluetooth, undefined, 'bluetooth must not be undefined');
    });
});
