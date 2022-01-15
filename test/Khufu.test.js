const { assert } = require("chai")

const Khufu = artifacts.require('Khufu')
const GizaToken = artifacts.require('GizaToken')

contract('Khufu', ([owner, participant]) => {
    let khufu
    let token

    before(async () => {
        token = await GizaToken.new()
        khufu = await Khufu.new(token.address)
        await token.passMinterRole(khufu.address, { from: owner })
    })

    describe('Smart contract deployment', () => {
        it('contract has owner', async () => {
            const _owner = await khufu.owner()
            assert.equal(_owner, owner)
        })

        it('owner is participating', async () => {
            const isParticipating = await khufu.isParticipating(owner)
            expect(isParticipating).to.be.eq(true)
        })

        it('owners balance is 0', async () => {
            const balanceOf = await khufu.balanceOf(owner)
            expect(balanceOf.toString()).to.be.eq('0')
        })

        it('contract has zero balance', async () => {
            const totalBalance = await khufu.totalBalance()
            expect(totalBalance.toString()).to.be.eq('0')
        })

        it('participant is not participating', async () => {
            const isParticipating = await khufu.isParticipating(participant)
            expect(isParticipating).to.be.eq(false)
        })
    })

    describe('Participant joins scheme', () => {
        it('participant GIZA balance is 0', async () => {
            const balance = await token.balanceOf(participant);
            assert.equal(balance, 0);
        })

        it('participant joins scheme with wrong amount', async () => {
            try {
                await khufu.join(owner, { from: participant, value: web3.utils.toWei('0.1', 'ether') })
            } catch (e) {
                assert.include(e.message, 'Error, value to join is 0.01 ETH.')
            }
        })

        it('participant joins scheme', async () => {
            const event = await khufu.join(owner, { from: participant, value: web3.utils.toWei('0.01', 'ether') })
            expect(event.user).to.be.eq(participant.address)
            expect(event.referral).to.be.eq(owner.address)
        })

        it('participant is participating', async () => {
            const isParticipating = await khufu.isParticipating(participant)
            expect(isParticipating).to.be.eq(true)
        })

        it('balance of participant is 0.0099', async () => {
            const balanceOf = await khufu.balanceOf(participant)
            expect(balanceOf.toString()).to.be.eq(web3.utils.toWei('0.0099', 'ether'))
        })

        it('participant GIZA balance is 1', async () => {
            const balance = await token.balanceOf(participant);
            assert.equal(balance, 1e18); // 1 GIZA
        })

        it('balance of owner is 0.0001', async () => {
            const balanceOf = await khufu.balanceOf(owner)
            expect(balanceOf.toString()).to.be.eq(web3.utils.toWei('0.0001', 'ether'))
        })

        it('total balance is 0.01 ETH', async () => {
            const totalBalance = await khufu.totalBalance()
            expect(totalBalance.toString()).to.be.eq(web3.utils.toWei('0.01', 'ether'))
        })
    })

    describe('Participant leaves scheme', () => {
        it('participang leaves scheme', async () => {
            const event = await khufu.leave({ from: participant })
            expect(event.user).to.be.eq(participant.address)
        })

        it('participant is not participating', async () => {
            const isParticipating = await khufu.isParticipating(participant)
            expect(isParticipating).to.be.eq(false)
        })

        it('participant GIZA balance is 1', async () => {
            const balance = await token.balanceOf(participant);
            assert.equal(balance, 1e18); // 1 GIZA
        })

        it('total balance is 0.0001 ETH', async () => {
            const totalBalance = await khufu.totalBalance()
            expect(totalBalance.toString()).to.be.eq(web3.utils.toWei('0.0001', 'ether'))
        })
    })
})