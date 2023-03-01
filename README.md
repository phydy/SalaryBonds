# Salary Bond Contract

<p>
    Use superfluid ACL and superApp routing to enable owners of a stream to create a bond on the contract 
</p>

## Project Breakdown

<p> 
    The project includes complete smart contracts built with solidity and foundry. it also has an incomplete UI undeer `salary-bonds/`. currently the ui is just to show how the bonds on the frontend with transactions to be added at a later date. 
</p>

<p>
    The project was tested on the local development evnironment and mumbai testnet. It is deployed to gnosis chain.
</p>
### Contracts

<ul>
    <li> SlalaryBondContract</li>
    <p>
        Contains the logic for cration of the bonds and posting them as open or filled and handling acl permissions
    </p>
        <li> marketContract</li>
    <p>
        Provides Bond buyers with open bond
    </p>
        <li> Router</li>
    <p>
       SuperApp that manages streams
    </p>
</ul>

### Project Utility

<p>
    This project can be used to manage an ecosytem of users receiving payments or slaries in stream and offer them an easy way to offer bonds for a live stream. It can also be used by someone with instant cash who needs to request a bond for a stream. Hence, It offers a backward compatibility for users with stream and those who need streams. 
</p>

### How to Test the Project

In the root directory run

```
forge build && forge test
```

### Contract addresses

<h4>
Deployment Addresses
</h4>

#### Mumbai

    "BondMarket":
      "0x2975A4Bd0958fCC7e053c83144A621FE5A17A999"
    "Router":
      "0x70Ac16F0014C27CF838C7e3B01E8F684E1e276ee"
    "SalaryBondContract":
      "0xbae7B2D8a8123Ba4e9f829EbE3d7f33e9d90A649"
    "TestToken":
      "0x3ac1aBe9654b1255d3Ff5c3C6969eA5Ba14Ce4d9"

#### Gnosis chain

    "BondMarket":
      "0x2975A4Bd0958fCC7e053c83144A621FE5A17A999"
    "Router":
      "0x70Ac16F0014C27CF838C7e3B01E8F684E1e276ee"
    "SalaryBondContract":
      "0xbae7B2D8a8123Ba4e9f829EbE3d7f33e9d90A649"
    "TestToken":
      "0xC89b03c370a733881aaC610E84265E3559dDD984"
