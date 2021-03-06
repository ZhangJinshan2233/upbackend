const assert = require('assert')
class ApplicationError extends Error {
  constructor(message, options = {}) {
    assert(typeof message === 'string');
    assert(typeof options === 'object');
    assert(options !== null);
    super(message);

    // Attach relevant information to the error instance
    // (e.g., the username).
    for (const [key, value] of Object.entries(options)) {
      this[key] = value;
    }
  }

  get name() {
    return this.constructor.name
  }
}

class UserFacingError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, options);
  }
}

module.exports = {
  UserFacingError
}