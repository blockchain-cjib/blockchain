FABRIC_ROOT_DIR=fabric-network
CC_LANG=node
CC_VERSION=$(shell date +"%y%m%d%H%M%S")
CC_SRC_PATH=/opt/gopath/src/github.com/chaincode
DOCKER_CRYPTO_DIR=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CHANNEL_NAME=mychannel
CC_ARGS={"Args":[""]}

clean-docker:
	docker rm $(shell docker ps -a -q) | true && \
	docker rmi $(shell docker images -q)

fabric-init-crypto:
	rm -fr $(FABRIC_ROOT_DIR)/config/*
	rm -fr $(FABRIC_ROOT_DIR)/crypto-config/*

	# generate crypto material
	cd $(FABRIC_ROOT_DIR) && ./bin/cryptogen generate \
		--config=./crypto-config.yaml

	# generate genesis block for orderer
	cd $(FABRIC_ROOT_DIR) && ./bin/configtxgen \
		-profile OneOrgOrdererGenesis \
		-outputBlock ./config/genesis.block

	# generate channel configuration transaction
	cd $(FABRIC_ROOT_DIR) && ./bin/configtxgen \
		-profile OneOrgChannel \
		-outputCreateChannelTx ./config/channel.tx \
		-channelID $(CHANNEL_NAME)

	# generate anchor peer transaction
	cd $(FABRIC_ROOT_DIR) && ./bin/configtxgen \
		-profile OneOrgChannel \
		-outputAnchorPeersUpdate ./config/Org1MSPanchors.tx \
		-channelID $(CHANNEL_NAME) \
		-asOrg Org1MSP

	echo "====================="
	echo "REMEMBER TO CHANGE ca FABRIC_CA_SERVER_CA_KEYFILE in docker-compose.yml to crypto-config/peerOrganizations/org1.example.com/ca/[random stuff]_sk"
	echo "====================="

fabric-start-network:
	cd $(FABRIC_ROOT_DIR) && \
	docker-compose -f docker-compose.yml down | true && \
	docker rm $(shell docker ps -a -q) | true && \
	docker-compose -f docker-compose.yml up ca.example.com orderer.example.com peer0.org1.example.com couchdb cli

	# Close on Control+C
	docker-compose -f docker-compose.yml down

fabric-install-chaincode:
	# Create channel
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		peer0.org1.example.com peer channel create \
		-o orderer.example.com:7050 \
		-c mychannel \
		-f /etc/hyperledger/configtx/channel.tx \
		| true

    # Join peer0.org1.example.com to the channel.
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		peer0.org1.example.com peer channel join \
		-b mychannel.block \
		| true

	# Install the chaincode on the peers
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=$(DOCKER_CRYPTO_DIR)" \
		cli peer chaincode install \
		-n mycc \
		-v $(CC_VERSION)  \
		-p "$(CC_SRC_PATH)" \
		-l "$(CC_LANG)"

	# Instantiate chaincode
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=$(DOCKER_CRYPTO_DIR)" \
		cli peer chaincode instantiate \
		-o orderer.example.com:7050 \
		-C mychannel \
		-n mycc \
		-l "$(CC_LANG)" \
		-v $(CC_VERSION) \
		-c '$(CC_ARGS)'


fabric-upgrade-chaincode:
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=$(DOCKER_CRYPTO_DIR)" \
		cli peer chaincode install \
		-n mycc \
		-v $(CC_VERSION) \
		-p "$(CC_SRC_PATH)" \
		-l "$(CC_LANG)"

	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=$(DOCKER_CRYPTO_DIR)" \
		cli peer chaincode upgrade \
		-o orderer.example.com:7050 \
		-C $(CHANNEL_NAME) \
		-n mycc \
		-l "$(CC_LANG)" \
		-v $(CC_VERSION) \
		-c '$(CC_ARGS)'

# New citizen: {"Args":["setCitizen","123","James","Delft", "Street 5"]}
fabric-invoke-chaincode:
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
    	-e "CORE_PEER_MSPCONFIGPATH=$(DOCKER_CRYPTO_DIR)" \
		cli peer chaincode invoke \
		-o orderer.example.com:7050 \
		-C $(CHANNEL_NAME) \
		-n mycc \
		--peerAddresses peer0.org1.example.com:7051 \
		-c '{"Args":["setCitizen","123","James","Delft", "Street 5"]}'

fabric-dev-start-network:
	cd fabric-network-dev && \
	docker rm $(shell docker ps -a -q) | true && \
	docker-compose up

fabric-dev-chaincode-connect:
	cd fabric-network-dev && \
	docker exec \
		-it chaincode /bin/bash -c \
			'cd chaincode && npm install && CORE_CHAINCODE_ID_NAME=mycc:$(CC_VERSION) node chaincode --peer.address grpc://peer0.org1.example.com:7052'

fabric-dev-chaincode-install:
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			'peer chaincode install -p chaincode/chaincode -n mycc -v $(CC_VERSION) -l "$(CC_LANG)"'

fabric-dev-chaincode-instantiate: fabric-dev-chaincode-install
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			$$'peer chaincode instantiate -n mycc -v $(CC_VERSION) -c \'$(CC_ARGS)\' -C mychannel --collections-config chaincode/chaincode/collections_config.json'

fabric-dev-chaincode-upgrade: fabric-dev-chaincode-install
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			$$'peer chaincode upgrade -n mycc -v $(CC_VERSION) -c \'$(CC_ARGS)\' -C mychannel'

fabric-dev-chaincode-invoke:
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			$$'peer chaincode invoke -n mycc -c \'$(CC_ARGS)\' -C mychannel'

fabric-dev-chaincode-query:
	cd fabric-network-dev && \
			docker exec \
				-it cli /bin/bash -c \
					$$'peer chaincode query -n mycc -c \'$(CC_ARGS)\' -C mychannel'

fabric-dev-all-instantiate:
	tmux rename-window main
	tmux new-window -n chaincode 'make fabric-dev-chaincode-connect CC_VERSION=$(CC_VERSION)'
	sleep 5
	tmux new-window -n launch 'make fabric-dev-chaincode-instantiate CC_VERSION=$(CC_VERSION) ; echo "UPGRADE DONE - Chaincode running container should start in a few seconds..." ; sleep 6666';
	sleep 7
	tmux new-window -n log 'watch docker logs dev-peer0.org1.example.com-mycc-$(CC_VERSION)'

fabric-dev-all-upgrade:
	tmux kill-window -t chaincode | true
	tmux kill-window -t launch | true
	tmux kill-window -t log | true
	tmux new-window -n chaincode 'make fabric-dev-chaincode-connect CC_VERSION=$(CC_VERSION)'
	sleep 5
	tmux new-window -n launch 'make fabric-dev-chaincode-upgrade CC_VERSION=$(CC_VERSION) ; echo "UPGRADE DONE - Chaincode running container should start in a few seconds..." ; sleep 6666';
	sleep 7
	tmux new-window -n log 'watch docker logs dev-peer0.org1.example.com-mycc-$(CC_VERSION)'


start-rest:
	echo "todo"

start-cjib-app:
	echo "Start CJIB app"

start-municipalities-app:
	echo "Start Municipality app"

#create-card:
#	cd fabric-composer-project && \
#	composer card create -n network-name \
#	-p connection-profile.file \
#	-u user-name \
#	-c certificate \
#	-k private-key \
#	-r role-1(PeerAdmin) \
#	-r role-2 (ChannelAdmin) \
#	-f file-name