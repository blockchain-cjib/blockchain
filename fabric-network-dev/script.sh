#!/bin/bash

set -e

sleep 15
# first we create the channel against the specified configuration in myc.tx
# this call returns a channel configuration block - myc.block - to the CLI container
peer channel create -c mychannel -f mychannel.block -o orderer.example.com:7050 -f config/channel.tx

# now we will join the channel and start the chain with myc.block serving as the
# channel's first block (i.e. the genesis block)
peer channel join -b mychannel.block

sleep 600000
exit 0
