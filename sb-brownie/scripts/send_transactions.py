from brownie import web3, Router, interface, CFA, TestToken, SalaryBondContract, BondMarket, accounts, config, convert

account = accounts.add(config["wallets"]["from_key"])

account1 = accounts.add(config["wallets"]["from_test1"])


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
    marketcontract = BondMarket[-1]

    cfa_con = web3.eth.contract(address=cfa.address, abi=cfa.abi)
    callData = cfa_con.encodeABI(fn_name="createFlow", args=[
        token.address, router.address, convert.to_int("0.0005 ether"), ""])

    bytes_data = web3.toBytes(hexstr=f"{callData}")
    sent_data = bytes_data[:(len(bytes_data) - 32)]
    host.callAgreement(cfa, sent_data,
                       "", {"from": account1})


if __name__ == "__main__":
    main()
