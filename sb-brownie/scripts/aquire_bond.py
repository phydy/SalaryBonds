from brownie import web3, Router, interface, CFA, TestToken, SalaryBondContract, BondMarket, accounts, config, convert

account = accounts.add(config["wallets"]["from_test1"])
account2 = accounts.add(config["wallets"]["from_key"])


_host = "0xEB796bdb90fFA0f28255275e16936D25d3418603"
_factory = "0x200657E2f123761662567A1744f9ACAe50dF47E6"
_cfa = "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873"
_testToken = "0x3ac1aBe9654b1255d3Ff5c3C6969eA5Ba14Ce4d9"


def main():

    market = BondMarket[-1]
    token = interface.IERC20(_testToken)
    router = Router[-1]

    # token.approve(market.address, convert.to_uint(
    #    "4000 ether"), {"from": account})

    if token.balanceOf(router.address) < 100000000000000000000:
        token.transfer(router.address, convert.to_uint(
            "100000 ether"), {"from": account2})

    market.acquireBond(1, {"from": account})


if __name__ == "__main__":
    main()
