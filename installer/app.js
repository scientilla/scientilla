require('dotenv').config({ path: 'installer/.env' })
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const open = require('open')
const { spawn } = require('child_process')
const exec  = require('child_process').exec
const pg = require('pg')
const app = express()
let server

app.engine('ejs', require('ejs-locals'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(fileUpload())

const configFolder = './config'
const basicConfigurationFile = './config/scientilla.js'
const defaultBasicConfigurationFile = './installer/defaults/scientilla.js'

const localConfigurationFile = './config/local.js'
const defaultLocalConfigurationFile = './installer/defaults/local.js'

const customizationsConfigurationFile = './config/customizations.js'
const defaultCustomizationsConfigurationFile = './installer/defaults/customizations.js'

const connectorsConfigurationFile = './config/connectors.js'
const defaultConnectorsConfigurationFile = './installer/defaults/connectors.js'

const prefixBasic = 'module.exports.scientilla = '
const prefixLocal = 'module.exports.connections = '
const prefixConnectors = 'module.exports.connectors = '

/*
 * Define the steps of the installer
 */
const steps = {
    basicConfiguration: {
        done: false
    },
    localConfiguration: {
        done: false
    },
    externalConnectors: {
        done: false
    },
    database: {
        ok: false
    }
}

/*
 * scientilla object with start function
 */
const scientilla = {
    start: (launch = false) => {
        console.log('Stopping installer listen to port :' + process.env.WEB_APPLICATION_PORT)

        // Stop listen to port by closing server
        if (server) {
            server.close()
        }

        console.log('Starting Scientilla on port :' + process.env.WEB_APPLICATION_PORT)

        // Execute sails lift command
        const application = spawn('node', ['./node_modules/.bin/sails', 'lift'])

        application.stdout.on('data', (data) => {
            console.log(`${data}`)
        })

        application.stderr.on('data', (data) => {
            console.log(`${data}`)
        })

        application.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            delete(application)
            setTimeout(scientilla.start, 2000)
        })
    }
}

app.all('*', function (req, res, next) {
    var xForwardedFor = (req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '')
    var ip = xForwardedFor || req.connection.remoteAddress

    if (ip === process.env.ALLOWED_IP || ip === '::ffff:' + process.env.ALLOWED_IP) {
        next()
    } else {
        console.log('Tried to access the installer with IP: ' + ip)
        res.render('pages/not-allowed')
    }
})

app.get('/', async (req, res) => {
    await checkSteps()

    // Go to the correct step
    if (steps.basicConfiguration.done) {
        if (steps.localConfiguration.done) {
            if (steps.externalConnectors.done) {
                if (steps.database.ok) {
                    res.redirect('/application')
                } else {
                    res.redirect('/database')
                }
            } else {
                res.redirect('/external-connectors')
            }
        } else {
            res.redirect('/local-configuration')
        }
    } else {
        res.redirect('/basic-configuration')
    }
})

app.get('/basic-configuration/:reset?', async (req, res) => {

    const reset = req.params.reset
    let configuration

    if (reset === 'reset') {
        if (fs.existsSync(defaultBasicConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(defaultBasicConfigurationFile).toString().replace(prefixBasic, ''))
        } else {
            throw new Error('No default basic configuration file found!')
        }
    } else {
        if (fs.existsSync(basicConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(basicConfigurationFile).toString().replace(prefixBasic, ''))
        } else {
            if (fs.existsSync(defaultBasicConfigurationFile)) {
                configuration = JSON.parse(fs.readFileSync(defaultBasicConfigurationFile).toString().replace(prefixBasic, ''))
            } else {
                throw new Error('No default basic configuration file found!')
            }
        }
    }

    res.render('pages/basic-configuration', {configuration: configuration, steps: await checkSteps()})
})

app.post('/basic-configuration', (req, res) => {

    let configuration

    if (fs.existsSync(basicConfigurationFile)) {
        configuration = JSON.parse(fs.readFileSync(basicConfigurationFile).toString().replace(prefixBasic, ''))
    } else {
        if (fs.existsSync(defaultBasicConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(defaultBasicConfigurationFile).toString().replace(prefixBasic, ''))
        } else {
            throw new Error('No default basic configuration file found!')
        }
    }

    configuration.institute.name = req.body['institute-name']
    configuration.institute.slug = req.body['institute-slug']
    configuration.institute.shortname = req.body['institute-shortname']
    configuration.institute.country = req.body['institute-country']
    configuration.institute.city = req.body['institute-city']
    configuration.institute.scopusId = req.body['institute-scopus-id']

    configuration.ldap.connection.url = req.body['ldap-connection-url']
    configuration.ldap.connection.bindDn = req.body['ldap-connection-bind-dn']
    configuration.ldap.connection.bindCredentials = req.body['ldap-connection-bind-credentials']
    configuration.ldap.connection.searchBase = req.body['ldap-connection-search-base']
    configuration.ldap.connection.searchFilter = req.body['ldap-connection-search-filter']
    configuration.ldap.connection.cache = req.body['ldap-connection-cache'] === 'on' ? true : false
    configuration.ldap.domain = req.body['ldap-domain']

    configuration.mainInstituteImport.userImportUrl = req.body['main-institute-import-user-import-url']
    configuration.mainInstituteImport.usersCreationCondition.attribute = req.body['main-institute-import-users-creation-condition-attribute']
    configuration.mainInstituteImport.usersCreationCondition.value = req.body['main-institute-import-users-creation-condition-value'] === 'on' ? true : false
    configuration.mainInstituteImport.officialGroupsImportUrl = req.body['main-institute-import-official-groups-import-url']

    configuration.crons = JSON.parse(req.body['crons'])

    configuration.registerEnabled = req.body['registration'] === 'on' ? true : false
    configuration.maxUserFavorite = req.body['max-user-favorite']
    configuration.maxGroupFavorite = req.body['max-group-favorite']

    fs.writeFileSync(basicConfigurationFile, prefixBasic + JSON.stringify(configuration, null, 4))
    res.redirect('/')
})

app.get('/local-configuration/:reset?', async (req, res) => {

    const reset = req.params.reset
    let configuration

    if (reset === 'reset') {
        if (fs.existsSync(defaultLocalConfigurationFile) && fs.statSync(defaultLocalConfigurationFile).size !== 0) {
            configuration = JSON.parse(fs.readFileSync(defaultLocalConfigurationFile).toString().replace(prefixLocal, ''))
            configuration.production.password = process.env.DATABASE_PASSWORD
            configuration.development.password = process.env.DATABASE_PASSWORD
        } else {
            throw new Error('No default local configuration file found!')
        }
    } else {
        if (fs.existsSync(localConfigurationFile) && fs.statSync(localConfigurationFile).size !== 0) {
            configuration = JSON.parse(fs.readFileSync(localConfigurationFile).toString().replace(prefixLocal, ''))
        } else {
            if (fs.existsSync(defaultLocalConfigurationFile) && fs.statSync(defaultLocalConfigurationFile).size !== 0) {
                configuration = JSON.parse(fs.readFileSync(defaultLocalConfigurationFile).toString().replace(prefixLocal, ''))
                configuration.production.password = process.env.DATABASE_PASSWORD
                configuration.development.password = process.env.DATABASE_PASSWORD
            } else {
                throw new Error('No default local configuration file found!')
            }
        }
    }

    res.render('pages/local-configuration', {configuration: configuration, steps: await checkSteps()})
})

app.post('/local-configuration', (req, res) => {

    let configuration

    if (fs.existsSync(localConfigurationFile)) {
        configuration = JSON.parse(fs.readFileSync(localConfigurationFile).toString().replace(prefixLocal, ''))
    } else {
        if (fs.existsSync(defaultBasicConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(defaultLocalConfigurationFile).toString().replace(prefixLocal, ''))
        } else {
            throw new Error('No default local configuration file found!')
        }
    }

    configuration.production.adapter = req.body['production-adapter']
    configuration.production.host = req.body['production-host']
    configuration.production.user = req.body['production-user']
    configuration.production.password = req.body['production-password']
    configuration.production.database = req.body['production-database']

    configuration.development.adapter = req.body['development-adapter']
    configuration.development.host = req.body['development-host']
    configuration.development.user = req.body['development-user']
    configuration.development.password = req.body['development-password']
    configuration.development.database = req.body['development-database']

    fs.writeFileSync(localConfigurationFile, prefixLocal + JSON.stringify(configuration, null, 4))
    res.redirect('/')
})

app.get('/external-connectors/:reset?', async (req, res) => {

    const reset = req.params.reset
    let configuration

    if (reset === 'reset') {
        if (fs.existsSync(defaultConnectorsConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(defaultConnectorsConfigurationFile).toString().replace(prefixConnectors, ''))
        } else {
            throw new Error('No default basic configuration file found!')
        }
    } else {
        if (fs.existsSync(connectorsConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(connectorsConfigurationFile).toString().replace(prefixConnectors, ''))
        } else {
            if (fs.existsSync(defaultConnectorsConfigurationFile)) {
                configuration = JSON.parse(fs.readFileSync(defaultConnectorsConfigurationFile).toString().replace(prefixConnectors, ''))
            } else {
                throw new Error('No default basic configuration file found!')
            }
        }
    }

    res.render('pages/external-connectors', {configuration: configuration, steps: await checkSteps()})
})

app.post('/external-connectors', (req, res) => {

    let configuration

    if (fs.existsSync(connectorsConfigurationFile)) {
        configuration = JSON.parse(fs.readFileSync(connectorsConfigurationFile).toString().replace(prefixConnectors, ''))
    } else {
        if (fs.existsSync(defaultConnectorsConfigurationFile)) {
            configuration = JSON.parse(fs.readFileSync(defaultConnectorsConfigurationFile).toString().replace(prefixConnectors, ''))
        } else {
            throw new Error('No default connectors configuration file found!')
        }
    }

    configuration.publications.active = req.body['external-connectors-publications-active'] === 'on' ? true : false
    configuration.elsevier.active = req.body['external-connectors-elsevier-active'] === 'on' ? true : false
    configuration.elsevier.scopus.url = req.body['external-connectors-elsevier-scopus-url']
    configuration.elsevier.scopus.apiKey = req.body['external-connectors-elsevier-scopus-api-key']
    configuration.elsevier.scopus.token = req.body['external-connectors-elsevier-scopus-token']
    configuration.elsevier.scival.url = req.body['external-connectors-elsevier-scival-url']
    configuration.elsevier.scival.clientKey = req.body['external-connectors-elsevier-scival-client-key']

    fs.writeFileSync(connectorsConfigurationFile, prefixConnectors + JSON.stringify(configuration, null, 4))
    res.redirect('/')
})

app.get('/database',async (req, res) => {
    res.render('pages/database', {steps: await checkSteps()})
})

app.post('/database', (req, res) => {
    if (req.files === null || Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.')
    }

    const file = req.files['database-file']

    if (file.name.endsWith('.dump') || file.name.endsWith('.sql')) {
        const today = new Date()
        const dd = String(today.getDate()).padStart(2, '0')
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const yyyy = today.getFullYear()
        const h = today.getHours()
        const m = today.getMinutes()
        const s = today.getSeconds()

        const date = mm + dd + yyyy + h + m + s
        const path = 'installer/uploads/' + date + file.name

        // Move file to the server
        file.mv(path, async (err) => {
            if (err) {
                return res.status(500).send(err)
            }

            if (file.name.endsWith('.sql')) {
                try {
                    const sql = fs.readFileSync(path).toString()
                    const pgClient = new pg.Client(getConnectionConfig())
                    pgClient.connect()
                    const result = await pgClient.query(sql)
                    await pgClient.end()
                    res.send(JSON.stringify({
                        type: 'sql',
                        steps: await checkSteps(),
                        message: 'SQL query is been executed!',
                        result: result
                    }))
                }
                catch (error) {
                    res.status(400).send(error.toString())
                }

            } else {
                const restore = new Promise(async (resolve, reject) => {
                    try {
                        const cmd = `pg_restore --dbname=${getConnectionConfig(false)} --format=c -j2 --clean --if-exists "${path}"`
                        await runCommand(cmd)
                        resolve('Restoring the database is done!')
                    }
                    catch (error) {
                        console.log( error)
                        reject(error)
                    }
                })

                restore.then(async (value) => {
                    res.send(JSON.stringify({
                        type: 'dump',
                        steps: await checkSteps(),
                        message: value
                    }))
                }, (error) => {
                    res.status(400).send(error)
                })
            }
        })
    } else {
        return res.status(400).send('We only support .sql or .dump files')
    }
})

app.post('/application/start', (req, res) => {
    res.send(process.env.WEB_APPLICATION_URL + ':' + process.env.WEB_APPLICATION_PORT)
    scientilla.start()
})

app.get('/application', async (req, res) => {
    await checkSteps()

    if (steps.basicConfiguration.done) {
        if (steps.database.ok) {
            // Only when previous steps are done
            res.render('pages/application', {steps: steps})
        } else {
            res.redirect('/database')
        }
    } else {
        res.redirect('/basic-configuration')
    }
})

function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        const taskObj = exec(cmd)

        taskObj.stderr.on('data', data => {
            reject(data)
        })

        taskObj.on('close', code => {
            resolve(code)
        })
    })
}

function getConnectionConfig(object = true) {

    if (fs.existsSync(localConfigurationFile)) {
        let configuration
        try {
            configuration = JSON.parse(fs.readFileSync(localConfigurationFile).toString().replace(prefixLocal, ''))
        } catch(e) {
            console.log(e)
        }
        let user,
            password,
            address,
            name
        const port = process.env.DATABASE_PORT

        switch (process.env.ENVIRONMENT) {
            case 'development':
                user = configuration.development.user
                password = configuration.development.password
                address = configuration.development.host
                name = configuration.development.database
                break
            case 'production':
                user = configuration.production.user
                password = configuration.production.password
                address = configuration.production.host
                name = configuration.production.database
                break
            case 'staging':
                user = configuration.production.user
                password = configuration.production.password
                address = configuration.production.host
                name = configuration.production.database
                break
            default:
                break
        }

        if (object) {
            return {
                user: user,
                host:address,
                password: password,
                database: name
            }
        } else {
            return `postgresql://${user}:${password}@${address}:${port}/${name}`
        }
    }

    return false
}

/*
 * Function to check the process of the steps
 */
async function checkSteps() {
    // Check if basic configuration file exists
    if (fs.existsSync(basicConfigurationFile)) {
        steps.basicConfiguration.done = true
    } else {
        steps.basicConfiguration.done = false
    }

    // Check if local configuration file exists
    if (fs.existsSync(localConfigurationFile)) {
        steps.localConfiguration.done = true
    } else {
        steps.localConfiguration.done = false
    }

    // Check if connectors configuration file exists
    if (fs.existsSync(connectorsConfigurationFile)) {
        steps.externalConnectors.done = true
    } else {
        steps.externalConnectors.done = false
    }

    // Check if database has all tables
    steps.database.ok = await checkDatabase()

    return steps
}

async function checkDatabase() {
    try{
        let missingTables = []
        const path = 'installer/defaults/database-test.sql'
        const sql = fs.readFileSync(path).toString()
        const pgClient = new pg.Client(getConnectionConfig())

        pgClient.connect()
        const result = await pgClient.query(sql)
        await pgClient.end()

        Object.keys(result.rows[0]).forEach(function(key,index) {
            if (!result.rows[0][key]) {
                missingTables.push(key)
            }
        })

        if (missingTables.length > 0) {
            console.log('Missing tables: ' + missingTables.join(', '))
            return false
        }

        return true
    } catch(err) {
        console.log(err);

        return false
    }
}

/*
 * Start Installer
 *
 * Let the application listen to associated port
 */
function startInstaller() {
    server = app.listen(1337, () => {
        console.log(`Scientilla Installer listening on port ${process.env.WEB_APPLICATION_PORT}!`)
    })
}

function copyFile (file, dir2) {
    const f = path.basename(file)
    const source = fs.createReadStream(file)
    const dest = fs.createWriteStream(path.resolve(dir2, f))

    source.pipe(dest)
    //source.on('end', function() { console.log('Successfully copied') })
    source.on('error', function(err) { console.log(err) })
}

/*
 * Initialize function
 *
 * Start Scientilla or installer if more configuration is needed or if it's been forced
 */
async function initialize() {
    let forced = false

    // Check if local configuration exists and is empty
    if (!fs.existsSync(localConfigurationFile) || fs.statSync(localConfigurationFile).size === 0)  {
        const localJs = {
            development:{
                "adapter": "sails-postgresql",
                "host": process.env.DATABASE_HOST,
                "user": process.env.DATABASE_USER,
                "password": process.env.DATABASE_PASSWORD,
                "database": process.env.DATABASE_NAME
            },
            production:{
                "adapter": "sails-postgresql",
                "host": process.env.DATABASE_HOST,
                "user": process.env.DATABASE_USER,
                "password": process.env.DATABASE_PASSWORD,
                "database": process.env.DATABASE_NAME
            },
            test:{
                "adapter": "sails-postgresql",
                "host": "db-test",
                "user": "scientilla",
                "password": "scientillapassword",
                "database": "scientillatest"
            }
        }
        fs.writeFileSync(localConfigurationFile, prefixLocal + JSON.stringify(localJs, null, 4))
    }

    // Check if basic configuration exists and is empty
    if (fs.existsSync(basicConfigurationFile)) {
        const stats = fs.statSync(basicConfigurationFile)

        if (stats.size == 0) {
            copyFile(defaultBasicConfigurationFile, configFolder)
        }
    }

    // Check if customizations configuration exists and is empty
    if (fs.existsSync(customizationsConfigurationFile)) {
        const stats = fs.statSync(customizationsConfigurationFile)

        if (stats.size == 0) {
            copyFile(defaultCustomizationsConfigurationFile, configFolder)
        }
    }

    // Check if connectors configuration exists and is empty
    if (fs.existsSync(connectorsConfigurationFile)) {
        const stats = fs.statSync(connectorsConfigurationFile)

        if (stats.size == 0) {
            copyFile(defaultConnectorsConfigurationFile, configFolder)
        }
    }

    // Check if the forced flag is been added to the command
    process.argv.forEach(function (val) {
        if (val === 'force') {
            forced = true
        }
    })

    if (!forced) {
        await checkSteps()
        if (steps.basicConfiguration.done && steps.database.ok) {
            // Call start function of scientilla with launch flag = true
            scientilla.start(true)
        } else {
            startInstaller()
        }
    } else {
        console.log('Installer forced!')
        // If the installer is been forced to start even if the configuration is complete.
        startInstaller()
    }
}

initialize()