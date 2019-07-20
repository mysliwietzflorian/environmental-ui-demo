const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');

const app = express();

app.use(express.static(`${__dirname}/../client/public`));

http.createServer((req, res) => {
    res.writeHead(301, {'Location': 'https://' + req.headers.host + req.url});
    res.end();
}, app).listen(80);

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(443, () => initializeServer(443));

function initializeServer(port) {
    let networkInterfaceName = process.argv.length > 2 ?
        process.argv[2] : 'WLAN';
    let externalIp = getIpAddress(networkInterfaceName);

    console.log('[INFO] Development server running!\n');
    console.log(`Local:    https://localhost:${port}`);

    if (externalIp) {
        console.log(`External: https://${getIpAddress(networkInterfaceName)}:${port}`);
    } else {
        console.warn(`External: Network interface name '${networkInterfaceName}' is not valid.`);
        console.warn(`          Use one of the following as command line argument:\n`);

        let test = Object.keys(os.networkInterfaces()).forEach(value => {
            console.log(`            - ${value}`);
        });
    }
    console.log('\nUse Ctrl+C to quit this process');
}

function getIpAddress(name) {
    let interface = os.networkInterfaces()[name];
    let result = interface ?
        interface.filter(details => {
            return details.family == 'IPv4';
        }) : [];
    return result.length > 0 ? result[0].address : undefined;
};
