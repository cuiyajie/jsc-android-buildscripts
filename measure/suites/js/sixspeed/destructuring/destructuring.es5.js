module.exports = {
  run: function (assertEqual) {

    var data = {
      a: 'foo',
      b: { c: 'd' },
      arr: [1, 2, 3]
    };

    function fn() {
      var a = data.a,
        b = data.b.c,
        c = data.arr[1];
      return c;
    }

    assertEqual(fn(), 2);
  }
};
