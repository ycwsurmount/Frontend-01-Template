// let mod = require("../src/add.js")
// var assert = require('assert');

// 改用import语法
import { add } from "../src/add.js"
var assert = require('assert');

describe('add', function() {
  it('should return 3 when add(1, 2)', function() {
    assert.equal(add(1, 2), 3);
  });
});