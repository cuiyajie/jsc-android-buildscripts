module.exports = {
  run: function (assertEqual) {

    var obj = {
      value: 42,
      fn: function () {
        return () => arguments[0];
      }
    };

    var fn = obj.fn(1);
    assertEqual(fn(), 1);

  }
};
