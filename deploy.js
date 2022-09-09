const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const fs = require('extra-fs')

const provider = new HDWalletProvider(
  'again pistol admit must cruise maximum copper clump ranch purpose decade service',
  'https://goerli.infura.io/v3/4fa0cc2c0f14403da9f576ed83dffe1d'
)
const web3 = new Web3(provider)
const abi = fs.readFileSync('./Lottery_sol_Lottery.abi', 'utf8').toString()
const binary = fs.readFileSync('./Lottery_sol_Lottery.bin', 'utf8')

async function deploy() {
  const accounts = await web3.eth.getAccounts()
  const inbox = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({
      data: binary,
    })
    .send({ from: accounts[0], gas: '1000000' })
  console.log(inbox.options.address)
}

deploy()
