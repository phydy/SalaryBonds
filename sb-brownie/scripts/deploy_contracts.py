from brownie import CFA, TestToken, SalaryBondContract, Router, BondMarket, accounts, config, convert

account = accounts.add(config["wallets"]["from_key"])


_host = "0xEB796bdb90fFA0f28255275e16936D25d3418603"
_factory = "0x200657E2f123761662567A1744f9ACAe50dF47E6"
_cfa = "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873"
_testToken = "0x3ac1aBe9654b1255d3Ff5c3C6969eA5Ba14Ce4d9"


def main():
    bondContract = 0
    market = 0
    router = 0
    token = TestToken.at(_testToken)
    cfa = CFA.at(_cfa)
    if len(SalaryBondContract) < 1:
        bondContract = SalaryBondContract.deploy(_host, {"from": account})

    else:
        bondContract = SalaryBondContract[-1]

    if len(Router) < 1:
        router = Router.deploy(
            _host, _cfa, bondContract.address, {"from": account})
    else:
        router = Router[-1]

    if len(BondMarket) < 1:
        market = BondMarket.deploy(
            bondContract.address, router.address, {"from": account})

        bondContract.addBondMarket(
            market.address, router.address, {"from": account})

    else:
        market = BondMarket[-1]

    # if len(TestToken) < 1:
    #    token = TestToken.deploy({"from": account})
#
    #    token.initialize(
    #        _factory, "test super token",
    #        "TST", account.address,
    #        convert.to_uint("2000000 ether"), {"from": account})
#
    # else:


if __name__ == "__ main__":
    main()
