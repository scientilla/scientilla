module.exports = {
    default: function (req, res) {
      res.view('homepage', {host: req.host});
    },
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
};

