module.exports = {
  run: function (assertEqual) {

    var b = 2;

    assertEqual(fn(), 3);

    function fn() {
      var a = 1;
      a += b;

      return a;
    }

  }
};
