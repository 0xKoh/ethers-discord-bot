const path = require('node:path');
const express = require('express');
const axios = require('axios');
const  { v4 : uuidv4 } = require ( 'uuid' ) ; 
const { ipAddr } = require(path.relative('./server', './config.json'));
const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(`/rise`, (req, res) => {
    const tokenData = req.body;
    const onetimePath = uuidv4();
    res.json({ "path": onetimePath });
    app.get(`/${onetimePath}`, (req, res) => {
        res.sendFile(path.join( __dirname, 'build', "index.html"));
    });
    if(tokenData.method == 'deployERC20') {
        setServerDeploy({data: tokenData, path: onetimePath});
    } else if(tokenData.method == 'transaction') {
        setServerTX({data: tokenData, path: onetimePath});
    }
});

const setServerDeploy = ({data, path}) => {
    // Discordからのデータ取得
    app.get(`/${path}/data`, (req, res) => {
        res.json({
            "method": data.method,
            "name": data.name,
            "symbol": data.symbol,
            "supply": data.supply,
            "network": data.network,
        });
    });
    // サイトからのデータ取得
    app.post(`/${path}/request`, async (req,res) => {
        await axios.post(`${ipAddr}:3001/${path}/request`, {
            address: req.body.address,
            hash: req.body.hash,
        }).catch((error) => console.log(error));
        res.send('completed');
    });
}

const setServerTX = ({data, path}) => {
    // Discordからのデータ取得
    app.get(`/${path}/data`, (req, res) => {
        res.json({
            "method": data.method,
            "tokenAddrs": data.tokenAddrs,
            "walletAddrs": data.walletAddrs,
            "amount": data.amount,
            "network": data.network,
        });
    });
    // サイトからのデータ取得
    app.post(`/${path}/request`, async (req,res) => {
        await axios.post(`${ipAddr}:3002/${path}/request`, {
            hash: req.body.hash,
            symbol: req.body.symbol,
        }).catch((error) => console.log(error));
        res.send('completed');
    });
}

app.listen("443", () => 
    console.log(`Server Started.`)
);