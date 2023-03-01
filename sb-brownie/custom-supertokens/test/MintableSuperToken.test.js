const { web3tx, toWad } = require("@decentral.ee/web3-helpers")
const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework")
const {
	builtTruffleContractLoader
} = require("@superfluid-finance/ethereum-contracts/scripts/libs/common")
const SuperfluidSDK = require("@superfluid-finance/js-sdk")
const { fastForward } = require("./util")

const MintableSuperToken = artifacts.require("MintableSuperToken")

contract("MintableSuperToken", accounts => {
	const errorHandler = error => {
		if (error) throw error
	}

	let sf
	let cfa
	let superTokenFactoryAddress

	// Functions on the proxy contract (MintableSuperToken.sol) are called with `mintableSuperToken.proxy`
	// Functions on the implementation contract (SuperToken.sol) are called with `mintableSuperToken.impl`
	let impl
	let proxy
	let mintableSuperToken

	const INIT_SUPPLY = toWad(1000000)

	const [admin, alice, bob, carol] = accounts.slice(0, 4)

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

		// proxy (custom) logic
		proxy = await web3tx(
			MintableSuperToken.new,
			"MintableSuperToken.new by alice"
		)({ from: alice })

		await web3tx(
			proxy.initialize,
			"MintableSuperToken.initialize by alice with supply of 1_000_000"
		)(superTokenFactoryAddress, "Super Juicy Token", "SJT")

		// get impl functions from the framework
		const { ISuperToken } = sf.contracts
		impl = await ISuperToken.at(proxy.address)

		mintableSuperToken = { impl, proxy, address: proxy.address }
	})

	it("alice cannot initialize twice", async () => {
		try {
			await web3tx(
				superTokenFactoryAddress,
				mintableSuperToken.proxy.initialize,
				"alice tries to initializes a second time"
			)("Not Super Juicy Token", "NSJT")
			throw null
		} catch (error) {
			assert(error, "Expected revert")
		}
	})

	it("alice mints to anyone", async () => {
		// alice mints to self
		await web3tx(
			mintableSuperToken.proxy.mint,
			"alice mints 100 SJT to self"
		)(alice, toWad(100), "0x", { from: alice })

		assert.equal(
			(await mintableSuperToken.impl.balanceOf.call(alice)).toString(),
			toWad(100)
		)

		assert.equal(
			(await mintableSuperToken.impl.totalSupply.call()).toString(),
			toWad(100)
		)

		// alice mints to bob
		await web3tx(
			mintableSuperToken.proxy.mint,
			"alice mints 100 SJT to bob"
		)(bob, toWad(100), "0x", { from: alice })

		assert.equal(
			(await mintableSuperToken.impl.balanceOf.call(alice)).toString(),
			toWad(100)
		)

		assert.equal(
			(await mintableSuperToken.impl.balanceOf.call(bob)).toString(),
			toWad(100)
		)

		assert.equal(
			(await mintableSuperToken.impl.totalSupply.call()).toString(),
			toWad(200)
		)
	})

	it("only alice can mint", async () => {
		// alice mints to self
		await web3tx(
			mintableSuperToken.proxy.mint,
			"alice mints 100 SJT to self"
		)(alice, toWad(100), "0x", { from: alice })

		assert.equal(
			(await mintableSuperToken.impl.balanceOf.call(alice)).toString(),
			toWad(100)
		)

		assert.equal(
			(await mintableSuperToken.impl.totalSupply.call()).toString(),
			toWad(100)
		)

		// bob tries to mint to self
		try {
			await web3tx(
				mintableSuperToken.proxy.mint,
				"bob tries to mint 100 SJT to self"
			)(bob, toWad(100), "0x", { from: bob })
			// always throws to catch, but assert() requires a non-nullish error
			throw null
		} catch (error) {
			assert(error, "Expected Revert")
		}

		assert.equal(
			(await mintableSuperToken.impl.balanceOf.call(alice)).toString(),
			toWad(100)
		)

		assert.equal(
			(await mintableSuperToken.impl.balanceOf.call(bob)).toString(),
			"0"
		)

		assert.equal(
			(await mintableSuperToken.impl.totalSupply.call()).toString(),
			toWad(100)
		)
	})

	it("alice transfers mint permission to bob", async () => {
		assert.equal(await mintableSuperToken.proxy.owner.call(), alice)

		await web3tx(
			mintableSuperToken.proxy.transferOwnership,
			"alice transfers minting permission to bob"
		)(bob, { from: alice })

		assert.equal(await mintableSuperToken.proxy.owner.call(), bob)
	})

	it("bob may not transfer mint permission if not minter", async () => {
		assert.equal(await mintableSuperToken.proxy.owner.call(), alice)

		try {
			await web3tx(
				mintableSuperToken.proxy.transferOwnership,
				"bob tries to transfer minting permission to self"
			)(bob, { from: bob })
		} catch (error) {
			assert(error, "Expected revert")
		}

		assert.equal(await mintableSuperToken.proxy.owner.call(), alice)
	})

	it("tokens can be streamed", async () => {
		await web3tx(mintableSuperToken.proxy.mint, "alice mints SJT to self")(
			alice,
			INIT_SUPPLY,
			"0x",
			{ from: alice }
		)

		await web3tx(
			mintableSuperToken.impl.transfer,
			"alice transfers 500_000 SJT to bob"
		)(bob, toWad("500000"), { from: alice })

		const flowRate = "1000000000000000" // 0.001 tokens per second

		await web3tx(
			sf.host.callAgreement,
			"bob starts a 0.001 SJT per second flow to carol"
		)(
			cfa.address,
			cfa.contract.methods
				.createFlow(mintableSuperToken.address, carol, flowRate, "0x")
				.encodeABI(),
			"0x",
			{ from: bob }
		)

		assert.equal(
			(
				await cfa.getFlow.call(mintableSuperToken.address, bob, carol)
			).flowRate.toString(),
			flowRate
		)

		// FAST FORWARD 1000 SECONDS
		await fastForward(1000)

		await web3tx(sf.host.callAgreement, "bob stops flow to carol")(
			cfa.address,
			cfa.contract.methods
				.deleteFlow(mintableSuperToken.address, bob, carol, "0x")
				.encodeABI(),
			"0x",
			{ from: bob }
		)

		assert.equal(
			(
				await cfa.getFlow.call(mintableSuperToken.address, bob, carol)
			).flowRate.toString(),
			"0"
		)

		// The passage of time seems to be a little unpredictable in the
		// testing environment, but this at least ensures the balances are
		// not what they once were. :)
		assert.notEqual(
			(await mintableSuperToken.impl.balanceOf.call(bob)).toString(),
			toWad("500000")
		)

		assert.notEqual(
			(await mintableSuperToken.impl.balanceOf.call(carol)).toString(),
			"0"
		)
	})
})
