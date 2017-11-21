module.exports = {
    default: function (req, res) {
      res.view('homepage', {host: req.host});
    },
    ping: (req, res) => res.json(),
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
};

