module.exports = {
  run: function (assertEqual) {

    function fn() {
      var name = 'foo';
      var ret = {
        'bizz buzz': function () {
          return 1;
        },
        name: name
      };
      ret[name] = 'bar';
      ret[name + 'foo'] = 'foo';
      return ret;
    }

    assertEqual(fn().foofoo, 'foo');

  }
};
