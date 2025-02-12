var path = require('path');

function getHome(request, response) {
    response.send("Welcome to the back-end for the PhotoIt app!");
}

module.exports = {
    getHome
};