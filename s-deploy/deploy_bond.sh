#! /bin/bash

forge create $RPC_URL\
    --constructor-args $HOST\
    --private-key $PRIVATE_KEY\
    src/SalaryBond.sol:SalaryBondContract\