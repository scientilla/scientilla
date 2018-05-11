module.exports.autoreload = {
    active: true,
    usePolling: false,
    overrideMigrateSetting: false,
    dirs: [
        "api/models",
        "api/controllers",
        "api/services",
        "api/policies",
        "api/responses",
        "api/blueprints",
        "api/lib",
        "api/hooks",
        "config/locales"
    ]
};