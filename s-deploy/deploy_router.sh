#! /bin/bash

forge create $RPC_URL\
    --constructor-args $HOST $CFA $BOND \
    --private-key $PRIVATE_KEY\
    src/Router.sol:Router\