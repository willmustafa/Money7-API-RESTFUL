const changeNullToZero = (object) => {
  Object.keys(object).forEach((prop) => {
    if (object[prop] === null) object[prop] = 0;
  });
  return object;
};

const percentage_from = (gasto, receita) => {
  const resultado = (gasto / receita) * 100;
  return resultado.toFixed(0);
};

module.exports = {
  changeNullToZero,
  percentage_from,
};
