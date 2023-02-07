const { web3tx, toWad, BN, toBN } = require("@decentral.ee/web3-helpers")
const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework")
const {
	builtTruffleContractLoader
} = require("@superfluid-finance/ethereum-contracts/scripts/libs/common")
const SuperfluidSDK = require("@superfluid-finance/js-sdk")
const { fastForward } = require("../util")

const StreamFromMint = artifacts.require("StreamFromMint")

contract("StreamFromMint", accounts => {
	const errorHandler = error => {
		if (error) throw error
	}

	let sf
	let cfa
	let superTokenFactoryAddress

	// Functions on the proxy contract (StreamFromMint.sol) are called with `streamFromMint.proxy`
	// Functions on the implementation contract (SuperToken.sol) are called with `streamFromMint.impl`
	let impl
	let proxy
	let streamFromMint

	const INIT_MINT_FLOW_RATE = toWad(200)

	const [admin, alice] = accounts.slice(0, 2)

	before(
		async () =>
			await deployFramework(errorHandler, {
				web3,
				from: admin,
				newTestResolver: true
			})
	)

	beforeEach(async () => {
		sf = new SuperfluidSDK.Framework({
			web3,
			version: "test",
			contractLoader: builtTruffleContractLoader
		})
		await sf.initialize()

		cfa = sf.agreements.cfa

		superTokenFactoryAddress = await sf.host.getSuperTokenFactory.call()

		proxy = await web3tx(
			StreamFromMint.new,
			"StreamFromMint.new by alice"
		)({ from: alice })

		await web3tx(
			proxy.initialize,
			"StreamFromMint.initialize by alice max supply of 1_000_000"
		)(
			superTokenFactoryAddress,
			"Super Juicy Token",
			"SJT",
			cfa.address,
			alice,
			INIT_MINT_FLOW_RATE,
			{
				from: alice
			}
		)

		// get proxy methods from a template
		const { ISuperToken } = sf.contracts
		impl = await ISuperToken.at(proxy.address)

		streamFromMint = { impl, proxy, address: proxy.address }
	})

	it("mint stream can be created", async () => {
		assert.equal(
			(await streamFromMint.proxy.totalSupply.call()).toString(),
			"0"
		)
		assert.equal(
			(
				await cfa.getFlow.call(
					streamFromMint.address,
					streamFromMint.address,
					alice
				)
			).flowRate.toString(),
			INIT_MINT_FLOW_RATE
		)

		fastForward(10000)

		assert.notEqual(
			(await streamFromMint.proxy.totalSupply.call()).toString(),
			"0"
		)
	})

	it("STOP", async () => {
		console.log(
			"STOP. If you think this is enough tests to go put this in prod, stop thinking that. Don't do what you're thinking about doing. Please."
		)
	})
})
