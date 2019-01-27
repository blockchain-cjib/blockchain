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

echo "Installing chaincode peer 0"
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer chaincode install -n mycc -p "/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/chaincodejava" -v v1 -l java
echo "Installing chaincode peer 1"
CORE_PEER_ADDRESS=peer1.org1.example.com:7051 peer chaincode install -n mycc -p "/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/chaincodejava" -v v1 -l java
echo "Installing chaincode peer 2"
CORE_PEER_ADDRESS=peer2.org1.example.com:7051 peer chaincode install -n mycc -p "/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/chaincodejava" -v v1 -l java
echo "Installing chaincode peer 3"
CORE_PEER_ADDRESS=peer3.org1.example.com:7051 peer chaincode install -n mycc -p "/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/chaincodejava" -v v1 -l java
echo "Installing chaincode peer 4"
CORE_PEER_ADDRESS=peer4.org1.example.com:7051 peer chaincode install -n mycc -p "/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/chaincodejava" -v v1 -l java

#instantiate the chaincode on peer0
echo "Instantiating chaincode on peer0"
CORE_PEER_ADDRESS=peer0.org1.example.com:7051 peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n mycc -v v1 -c '{"Args":[""]}' --collections-config chaincode/chaincodejava/collections_config.json



#invoke some info on peer 2
#echo "Invoking info on peer 2"
#CORE_PEER_ADDRESS=peer2.org1.example.com:7051 peer chaincode invoke -n mycc -c '{"Args":["setCitizen","123","James","Delft", "Street 5", "1000", "true", "1"]}' -C mychannel

#query info on peer 3
#echo "querying info on peer 3"
#CORE_PEER_ADDRESS=peer3.org1.example.com:7051 peer chaincode query -C mychannel -n mycc -c '{"Args":["getCitizen","123"]}'

sleep 600000
exit 0
