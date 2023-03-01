from brownie import web3, Router, interface, CFA, TestToken, SalaryBondContract, BondMarket, accounts, config, convert

account = accounts.add(config["wallets"]["from_key"])

_host = "0xEB796bdb90fFA0f28255275e16936D25d3418603"
_factory = "0x200657E2f123761662567A1744f9ACAe50dF47E6"
_cfa = "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873"
_testToken = "0x3ac1aBe9654b1255d3Ff5c3C6969eA5Ba14Ce4d9"


def main():
    cfa = CFA.at(_cfa)
    host = interface.ISuper(_host)

    router = Router[-1]
    token = TestToken[-1]
    bondContract = SalaryBondContract[-1]
    bondContract.createBond(token.address, convert.to_uint("1200 ether"), 2529000, {
                            "from": account, "value": convert.to_uint("0.0005 ether")})


if __name__ == "__main__":
    main()
