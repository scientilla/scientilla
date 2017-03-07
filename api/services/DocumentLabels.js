// DocumentLabels.js - in api/services

"use strict";

module.exports = {
    DUPLICATE: 'duplicate?',
    DISCARDED: 'discarded',
    UVERIFYING: 'unverifying',
    addLabel: function (document, label) {
        if (!document.labels)
            document.labels = [];

        if (!document.labels.includes(label))
            document.labels.push(label);
    }
};