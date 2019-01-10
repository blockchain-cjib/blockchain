#!/bin/bash

set -e

sleep 15
# first we create the channel against the specified configuration in myc.tx
# this call returns a channel configuration block - myc.block - to the CLI container
peer channel create -c mychannel -f mychannel.block -o orderer.example.com:7050 -f config/channel.tx

# now we will join the channel and start the chain with myc.block serving as the
# channel's first block (i.e. the genesis block)
echo "Peers joining channel"
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer1.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer2.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer3.org1.example.com:7051 peer channel join -b mychannel.block
CORE_PEER_ADDRESS=peer4.org1.example.com:7051 peer channel join -b mychannel.block

# install the chaincode on peer0
echo "Installing chaincode"
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer chaincode install -n mycc -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02 -v v0
CORE_PEER_ADDRESS=peer1.org1.example.com:7051 peer chaincode install -n mycc -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02 -v v0
CORE_PEER_ADDRESS=peer2.org1.example.com:7051 peer chaincode install -n mycc -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02 -v v0
CORE_PEER_ADDRESS=peer3.org1.example.com:7051 peer chaincode install -n mycc -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02 -v v0
CORE_PEER_ADDRESS=peer4.org1.example.com:7051 peer chaincode install -n mycc -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02 -v v0

#instantiate the chaincode on peer0
echo "Instantiating chaincode on peer0"
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer chaincode instantiate -o orderer:5005 -C myc -n mycc -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02 -v v0 -c '{"Args":["init","a","100","b","200"]}'

#query peer0
echo "Querying peers"
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer chaincode query -C myc -n mycc -v v0 -c '{"Args":["query","a"]}'
CORE_PEER_ADDRESS=peer1.org1.example.com:7051 peer chaincode query -C myc -n mycc -v v0 -c '{"Args":["query","a"]}'
CORE_PEER_ADDRESS=peer2.org1.example.com:7051 peer chaincode query -C myc -n mycc -v v0 -c '{"Args":["query","a"]}'
CORE_PEER_ADDRESS=peer3.org1.example.com:7051 peer chaincode query -C myc -n mycc -v v0 -c '{"Args":["query","a"]}'
CORE_PEER_ADDRESS=peer4.org1.example.com:7051 peer chaincode query -C myc -n mycc -v v0 -c '{"Args":["query","a"]}'

sleep 600000
exit 0
