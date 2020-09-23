const { logInfo } = require('./logger');

let localStorage;
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

function setAccounts(account) {
    try {
        const accounts = JSON.parse(localStorage.getItem('accounts')) || {};
        accounts[account.account_id] = account;
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
    catch(err) {
        const errorMessage = 'Error! setAccounts()';
        console.log(errorMessage, err);
        logInfo(errorMessage, err);
    }
}

function getAccounts() {
    return {
        '3883pn6bg4w8byk4l5t1xpboc': {
            access_token: 'VugigEnFvxuzmpF5Ugpo8w8MPtq7q0',
            account_id: '3883pn6bg4w8byk4l5t1xpboc',
            email_address: 'dev@umwella.com',
            provider: 'gmail',
            token_type: 'bearer'
        },
    };
    // return JSON.parse(localStorage.getItem('accounts'));
}

function removeAccounts() {
    localStorage.removeItem('accounts');
}

function removeAccount(accountId) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));

    for (const key in accounts) {
        if (key === accountId) {
            delete accounts[key];
        }
    }
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

module.exports = {
    setAccounts,
    getAccounts,
    removeAccounts,
    removeAccount,
};