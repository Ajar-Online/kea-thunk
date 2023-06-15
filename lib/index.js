exports.__esModule = true;

const _reduxThunk = require('redux-thunk');

const _reduxThunk2 = _interopRequireDefault(_reduxThunk);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function createRealThunks(input, output, dispatch, getState) {
  const getProps =
    arguments.length > 4 && arguments[4] !== undefined
      ? arguments[4]
      : function() {};

  const actions = {};

  Object.keys(output.actions).forEach(actionKey => {
    actions[actionKey] = function() {
      let _output$actions;

      return dispatch(
        (_output$actions = output.actions)[actionKey].apply(
          _output$actions,
          arguments
        )
      );
    };
    actions[actionKey].toString = output.actions[actionKey].toString;
  });

  const get = function get(key) {
    return key
      ? output.selectors[key](getState(), getProps())
      : output.selector(getState(), getProps());
  };
  const fetch = function fetch() {
    const results = {};

    const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    for (let i = 0; i < keys.length; i++) {
      results[keys[i]] = get(keys[i]);
    }

    return results;
  };

  return input.thunks(
    Object.assign({}, output, {
      actions,
      dispatch,
      getState,
      get,
      fetch
    })
  );
}

const _injectToClass = function _injectToClass(Klass, input, output) {
  if (Klass.prototype._injectedKeaThunk) {
    console.error(
      `[KEA] Error! Already injected kea thunk into component "${(Klass &&
        Klass.name) ||
        Klass}"`
    );
  }
  Klass.prototype._injectedKeaThunk = true;

  const originalComponentWillMount = Klass.prototype.componentWillMount;
  Klass.prototype.componentWillMount = function() {
    const _this = this;

    // this === component instance
    let realThunks = void 0;
    const thunkKeys = Object.keys(input.thunks(output));
    const thunkFunctions = {};

    thunkKeys.forEach(thunkKey => {
      thunkFunctions[thunkKey] = function() {
        for (
          var _len = arguments.length, args = Array(_len), _key = 0;
          _key < _len;
          _key++
        ) {
          args[_key] = arguments[_key];
        }

        return function(dispatch, getState) {
          let _realThunks;

          if (!realThunks) {
            realThunks = createRealThunks(
              input,
              output,
              dispatch,
              getState,
              () => _this.props
            );
          }
          return (_realThunks = realThunks)[thunkKey].apply(_realThunks, args);
        };
      };
    });
    output.created.actions = Object.assign(
      {},
      output.created.actions,
      thunkFunctions
    );
    output.actions = Object.assign({}, output.actions, thunkFunctions);

    originalComponentWillMount && originalComponentWillMount.bind(this)();
  };
};

exports.default = {
  name: 'thunk',

  // plugin must be used globally
  global: true,
  local: false,

  beforeReduxStore: function beforeReduxStore(options) {
    options.middleware.push(_reduxThunk2.default);
  },

  isActive: function isActive(input) {
    return !!input.thunks;
  },

  afterCreateSingleton: function afterCreateSingleton(input, output) {
    if (output.activePlugins.thunk) {
      let realThunks = void 0;
      const thunkKeys = Object.keys(input.thunks(output));
      const thunkFunctions = {};

      thunkKeys.forEach(thunkKey => {
        thunkFunctions[thunkKey] = function() {
          for (
            var _len2 = arguments.length, args = Array(_len2), _key2 = 0;
            _key2 < _len2;
            _key2++
          ) {
            args[_key2] = arguments[_key2];
          }

          return function(dispatch, getState) {
            let _realThunks2;

            if (!realThunks) {
              realThunks = createRealThunks(input, output, dispatch, getState);
            }
            return (_realThunks2 = realThunks)[thunkKey].apply(
              _realThunks2,
              args
            );
          };
        };
      });

      output.created.actions = Object.assign(
        {},
        output.created.actions,
        thunkFunctions
      );
      output.actions = Object.assign({}, output.actions, thunkFunctions);
    }
  },

  injectToClass: function injectToClass(input, output, Klass) {
    if (output.activePlugins.thunk) {
      _injectToClass(Klass, input, output);
    }
  },

  injectToConnectedClass: function injectToConnectedClass(
    input,
    output,
    KonnektedKlass
  ) {
    if (output.activePlugins.thunk) {
      _injectToClass(KonnektedKlass, input, output);
    }
  }
  // injectToConnectedClass
};
