const { assert } = require("chai")

const Token = artifacts.require('GizaToken')

contract ('GizaToken', function(accounts) {
    let token
    let minter = accounts[0]
    let user = accounts[1]
    let anotherUser = accounts[2]

    before(async () => {
        token = await Token.new()
    })

    describe('contract deployment', function() {
        it('contract has a name', async function() {
            const name = await token.name();
            assert.equal(name, 'Giza Token');
        })
    
        it('contract has a symbol', async function() {
            const symbol = await token.symbol();
            assert.equal(symbol, 'GIZA')
        })
    
        it('total supply is 0', async function() {
            const totalSupply = await token.totalSupply();
            assert.equal(totalSupply, 0);
        })
    
        it('contract has minter', async function() {
            const _minter = await token.minter();
            assert.equal(_minter, minter)
        })
    })

    describe('mint token', function() {
        it('user has balance equals to 0', async function() {
            const balanceOf = await token.balanceOf(user)
            assert.equal(balanceOf, 0)
        })

        it('mints token with wrong minter', async function() {
            try {
                await token.mint(user, 1, { from: anotherUser })
            } catch (e) {
                assert.include(e.message, 'Error, msg.sender does not have minter role')
            }
        })

        it('mints 1 token to user', async function() {
            const event = await token.mint(user, 1, { from: minter })
            assert.equal(event.to, user.address)
            //assert.equal(event.value, 1);
        })

        it('user balance equals to 1', async function() {
            const balanceOf = await token.balanceOf(user)
            assert.equal(balanceOf, 1)
        })

        it('total supply is 1', async function() {
            const totalSupply = await token.totalSupply();
            assert.equal(totalSupply, 1);
        })
    })

    describe('mint token to another user', function() {
        it('another user has balance equals to 0', async function() {
            const balanceOf = await token.balanceOf(anotherUser)
            assert.equal(balanceOf, 0)
        })

        it('mints 1 token to another user', async function() {
            const event = await token.mint(anotherUser, 5, { from: minter })
            assert.equal(event.to, anotherUser.address)
            //assert.equal(event.value, 1);
        })

        it('another user balance equals to 5', async function() {
            const balanceOf = await token.balanceOf(anotherUser)
            assert.equal(balanceOf, 5)
        })

        it('toten total supply is 6', async function() {
            const totalSupply = await token.totalSupply()
            assert.equal(totalSupply, 6)
        })
    })

    describe('burn token', function() {
        it('burn token from user', async function() {
            const event = await token.burn(user, 1, { from: minter })
            assert.equal(event.to, accounts[1].address)
        })

        it('user balance equals to 0', async function() {
            const balanceOf = await token.balanceOf(user)
            assert.equal(balanceOf, 0)
        })

        it('toten total supply is 5', async function() {
            const totalSupply = await token.totalSupply()
            assert.equal(totalSupply, 5)
        })
    })
})