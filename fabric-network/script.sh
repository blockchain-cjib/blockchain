#!/bin/bash

set -e

sleep 15
# first we create the channel against the specified configuration in myc.tx
# this call returns a channel configuration block - myc.block - to the CLI container
peer channel create -c mychannel -f mychannel.block -o orderer.example.com:7050 -f config/channel.tx

# now we will join the channel and start the chain with myc.block serving as the
# channel's first block (i.e. the genesis block)
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer1.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer2.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer3.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer4.org1.example.com:7051 peer channel join -b mychannel.block

sleep 600000
exit 0
