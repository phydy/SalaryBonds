#! /bin/bash

cast send $TOKEN "initialize(address,string,string,address,uint256)" $FACTORY,'SalaryBond Test Token','SBTT',$HOLDER,40000000000000000000000000\
    $RPC_URL --private-key $PRIVATE_KEY
