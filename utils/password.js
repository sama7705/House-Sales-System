const crypto = require('crypto');

function hash(password, rounds, callback) {
  const iterations = Math.max(100000, Number(rounds || 10) * 10000);
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
    if (err) {
      return callback(err);
    }
    return callback(null, `pbkdf2$${iterations}$${salt}$${derivedKey.toString('hex')}`);
  });
}

function compare(password, storedHash, callback) {
  const parts = storedHash ? storedHash.split('$') : [];
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return callback(null, false);
  }

  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expected = parts[3];

  crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
    if (err) {
      return callback(err);
    }

    const received = Buffer.from(derivedKey.toString('hex'), 'utf8');
    const known = Buffer.from(expected, 'utf8');
    if (received.length !== known.length) {
      return callback(null, false);
    }

    return callback(null, crypto.timingSafeEqual(received, known));
  });
}

module.exports = { hash, compare };
