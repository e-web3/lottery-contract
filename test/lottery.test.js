const ganache = require('ganache-cli')
const assert = require('assert')
const Web3 = require('web3')
const fs = require('extra-fs')
// create web3 instance
const web3 = new Web3(ganache.provider())

const abi = fs.readFileSync('./Lottery_sol_Lottery.abi', 'utf8').toString()
const binary = fs.readFileSync('./Lottery_sol_Lottery.bin', 'utf8')

let lottery
let accounts
beforeEach(async () => {
  accounts = await web3.eth.getAccounts()
  lottery = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({ data: binary })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery Contract', () => {
  it('Deploys a ontract', () => {
    assert.ok(lottery.options.address)
  })
  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether'),
    })
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })
    assert.equal(accounts[0], players[0])
    assert.equal(1, players.length)
  })
  it('allows multiple account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether'),
    })
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.03', 'ether'),
    })
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.05', 'ether'),
    })
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })
    assert.equal(accounts[0], players[0])
    assert.equal(accounts[1], players[1])
    assert.equal(accounts[2], players[2])

    assert.equal(3, players.length)
  })
  it('require a minimum amount of ethers to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether'),
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })
  it('Only owner call pick winner', async () => {
    try {
      await lottery.methods.pickedWinner().send({
        from: accounts[1],
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })
  it('send money to the winner and reset the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether'),
    })
    // get initial balance
    const initialBalance = await web3.eth.getBalance(accounts[0])
    await lottery.methods.pickedWinner().send({
      from: accounts[0],
    })
    const finalBalance = await web3.eth.getBalance(accounts[0])
    const diff = finalBalance - initialBalance
    assert(diff > web3.utils.toWei('1.8', 'ether'))
  })
})
