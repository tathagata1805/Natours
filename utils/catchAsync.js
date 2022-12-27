// GLOBAL ASYNC FUNCTION TRY-CATCH HANDLER

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
