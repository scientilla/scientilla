module.exports = {
    default: function (req, res) {
            console.log(sails.getHost());
      res.view('homepage', {host: req.host});
    }
};

