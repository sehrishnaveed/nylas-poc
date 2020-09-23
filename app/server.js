const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const Nylas = require('nylas');
const fetch = require('node-fetch');

const { logInfo } = require('./logger');
const localStorageHelper = require('./localStorageHelper');
const { setAccounts, getAccounts, removeAccounts, removeAccount } = localStorageHelper;

// Enable dotenv
dotenv.config();

// Setup
const { ORIGIN, PORT, CLIENT_ID, CLIENT_SECRET, NYLAS_API_URL } = process.env;

// Setup Express
const app = express();
app.set("view engine", "ejs");
app.set("views", process.cwd() + "/app/templates");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/"));

Nylas.config({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
});

async function generateAccessToken(code) {
    const url = `${NYLAS_API_URL}/oauth/token`;
    const payload = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code
    };

    try {
        let account = await fetch(url, {
            method: 'post',
            body:    JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });

        account = await account.json();
        if (account.account_id) {
            setAccounts(account);
            return;
        }
        logInfo('Failure! generateAccessToken() >> Access token not received!', context);
    }
    catch(err) {
        const context = {
            payload,
            err,
        };
        logInfo('Error! generateAccessToken() >> Exception Detail', context);
    }
}

app.get('/generateAccessToken', async (req, res) => {
    const result = generateAccessToken(req.query.code);
    res.send(result);
});

app.get('/getAuthUrl', async (req, res) => {
    const response = {
        authUrl: '',
        error: '',
    };

    const options = {
        redirectURI: ORIGIN,
        response_type: 'token',
    };

    try {
        // Redirect your user to the auth_url
        response.authUrl  = Nylas.urlForAuthentication(options);
    }
    catch (err) {
        response.error = err;

        const context = {
            options,
            err,
        };
        logInfo('Error! getAuthUrl() >> Exception Detail', context);
    }
    res.send(response);
});

app.get('/getUpdatedUrl', async (req, res) => {
    try {
        const accountId = req.query.accountId;
        const url = process.env.ORIGIN + '?accountId=' +accountId;
        return res.send({url});
    }
    catch(err) {
        logInfo('Error! getUpdatedUrl() >> Exception Detail', err);
        return res.status(400).send({error: err});
    }
});

app.get('/removeAccount', async (req, res) => {
    try {
        const accountId = req.query.accountId;
        removeAccount(accountId);
        res.send({status: 'account removed successfully'});
    }
    catch(err) {
        logInfo('Error! removeAccount() >> Exception Detail', err);
        return res.status(400).send({error: err});
    }
});


// Route: home
app.get("/", async (req, res) => {

    try {
        // Extract the "code" from the page's query string:
        const codeFromQuery = req.query.code;
        const accountId = req.query.accountId;
        let reRender = false;

        if (codeFromQuery) {
            await generateAccessToken(codeFromQuery);
            reRender = true
        }

        const accounts = getAccounts();
        const totalAccount = accounts ? Object.keys(accounts) : 0;

        const passedParams = {
            connectedAccounts: accounts,
            reRender,
        };
        return res.render("schedulerEditor", passedParams);
    }
    catch(err) {
        logInfo('Error! on loading home page >> Exception Detail', err);
    }
});


app.listen(PORT);
console.log(`serving on ${ORIGIN}`);


