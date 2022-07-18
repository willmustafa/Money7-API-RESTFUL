const changeNullToZero = (object) => {
  Object.keys(object).forEach((prop) => {
    if (object[prop] === null) object[prop] = 0;
  });
  return object;
};

module.exports = {
  changeNullToZero,
};
