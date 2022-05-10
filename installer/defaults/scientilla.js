module.exports.scientilla = {
    "ldap": {
        "connection": {
            "url": "",
            "bindDn": "",
            "bindCredentials": "",
            "searchBase": "",
            "searchFilter": "",
            "cache": true
        },
        "domain": ""
    },
    "externalConnectors": {
        "elsevier": {
            "scopus": {
                "url": "https://api.elsevier.com",
                "apiKey": "",
                "token": ""
            },
            "scival": {
                "url": "http://sais.scivalcontent.com",
                "clientKey": ""
            }
        },
        "openaire": {
            "url": "http://api.openaire.eu/search/publications"
        }
    },
    "researchItems": {
        "external": {
            "project_competitive": {
                "origin": "",
                "request": {
                    "url": "",
                    "headers": {
                        "username": "",
                        "password": ""
                    }
                }
            },
            "project_industrial": {
                "origin": "",
                "requestUsers": {
                    "url": ""
                },
                "requestGroups": {
                    "url": ""
                }
            },
            "patent": {
                "origin": "",
                "request": {
                    "url": ""
                }
            }
        }
    },
    "institute": {
        "name": "Istituto Italiano di Tecnologia",
        "slug": "istituto-italiano-di-tecnologia",
        "shortname": "IIT",
        "country": "Italy",
        "city": "Genoa",
        "scopusId": ""
    },
    "matrix": {
        "url": "http://matrix.iit.it/api/matrix"
    },
    "crons": [
        {
            "name": "daily",
            "enabled": true,
            "time": "0 0 1 * * *",
            "jobs": [
                {
                    "fn": "Backup.makeBackup",
                    "params": []
                },
                {
                    "fn": "Backup.autoDelete",
                    "params": []
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:external:all"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:external:metadata"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run'",
                    "params": [
                        "cleaner:accessLogs"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "cleaner:logFiles"
                    ]
                },
                {
                    "fn": "Status.disable",
                    "params": []
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:synchronize:scopus"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:clean:sources"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:clean:institutes"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:clean:copies"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:matrix"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:users"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:expired"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:update-profile-groups"
                    ]
                },
                {
                    "fn": "Status.enable",
                    "params": []
                }
            ]
        },
        {
            "name": "monitor",
            "enabled": true,
            "time": "0 0 * * * *",
            "jobs": [
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "monitor"
                    ]
                }
            ]
        }
    ],
    "registerEnabled": true,
    "maxUserFavorite": "5",
    "maxGroupFavorite": "5",
    "logs": {
        "accessLogRetentionDays": "30",
        "logFilesRetentionDays": "180"
    }
};
