const {
    URL
} = require('url')
module.exports = (gcpUrl) => {
    let url = new URL(gcpUrl)
    let firstIndexOfSlash = url.pathname.indexOf('/')
    let secondIndexOfSlash = url.pathname.indexOf('/', (firstIndexOfSlash + 1));
    return url.pathname.slice(secondIndexOfSlash + 1);
}