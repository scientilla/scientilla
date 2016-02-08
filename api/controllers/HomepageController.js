module.exports = {
    default: function (req, res) {
      res.view('homepage', {host: req.host});
    }
};

