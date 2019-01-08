#
# Shortcut commands just for fabric-network-dev
#

FABRIC_ROOT_DIR=fabric-network-dev
CC_LANG=node
CC_VERSION=$(shell date +"%y%m%d%H%M%S")
CC_SRC_PATH=/opt/gopath/src/github.com/chaincode
DOCKER_CRYPTO_DIR=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CHANNEL_NAME=mychannel
CC_ARGS={"Args":[""]}

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	BIN_DIR=./fabric-bin/linux
endif
ifeq ($(UNAME_S),Darwin)
	BIN_DIR=./fabric-bin/darwin
endif

# Creates crypto stuff, only has to be run once
fabric-init-crypto:
	# Remove all previously generated material
	rm -fr $(FABRIC_ROOT_DIR)/config/*
	rm -fr $(FABRIC_ROOT_DIR)/crypto-config/*

	# Generate crypto material from the crypto config file
	$(BIN_DIR)/cryptogen generate \
		--config=./$(FABRIC_ROOT_DIR)/crypto-config.yaml \
		--output=./$(FABRIC_ROOT_DIR)/crypto-config

	# Generate genesis block for orderer
	$(BIN_DIR)/configtxgen \
		-configPath ./$(FABRIC_ROOT_DIR) \
		-profile OneOrgOrdererGenesis \
		-outputBlock ./$(FABRIC_ROOT_DIR)/config/genesis.block

	# Generate channel configuration transaction
	$(BIN_DIR)/configtxgen \
		-configPath ./$(FABRIC_ROOT_DIR) \
		-profile OneOrgChannel \
		-outputCreateChannelTx ./$(FABRIC_ROOT_DIR)/config/channel.tx \
		-channelID $(CHANNEL_NAME)

	# Generate anchor peer transaction
	$(BIN_DIR)/configtxgen \
		-configPath ./$(FABRIC_ROOT_DIR) \
		-profile OneOrgChannel \
		-outputAnchorPeersUpdate ./$(FABRIC_ROOT_DIR)/config/Org1MSPanchors.tx \
		-channelID $(CHANNEL_NAME) \
		-asOrg Org1MSP
	#change FABRIC_CA_SERVER_CA_KEYFILE
	python editFiles.py

	echo "====================="
	echo "REMEMBER TO CHANGE ca FABRIC_CA_SERVER_CA_KEYFILE in docker-compose.yml to crypto-config/peerOrganizations/org1.example.com/ca/[random stuff]_sk"
	echo "====================="

# Start the whole blockchain network
fabric-start-network:
	cd $(FABRIC_ROOT_DIR) && \
	docker rm $(shell docker ps -a -q) | true && \
	docker-compose up

query-specific-block:
	@read -p "Enter block-number:" block-number; \
	'Fetching block...';\
	peer channel fetch $$block-number

query-newest-block:
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
	'Fetching newest block...';\
	peer channel fetch newest mychannel.block -c mychannel --orderer orderer.example.com:7050

query-oldest-block:
	'Fetching oldest block...';\
	peer channel fetch oldest

# Start the rest server to interact with the blockchain network
start-rest:
	cd rest-server && \
	npm install && \
	node enrollAdmin.js && \
	node rest-server.js

start-cjib-app:
	echo "Start CJIB app"

start-municipalities-app:
	echo "Start Municipality app"

##
## START DEVELOPMENT NETWORK SPECIFIC COMANDS
##
# Not completely sure what it does but it is nececary when you run the network in development mode
# Better not to run manually! Its in 'make fabric-dev-all-instantiate'
fabric-dev-chaincode-connect:
	cd fabric-network-dev && \
	docker exec \
		-it chaincode /bin/bash -c \
			'cd chaincode && npm install && CORE_CHAINCODE_ID_NAME=mycc:$(CC_VERSION) node chaincode --peer.address grpc://peer0.org1.example.com:7052'

# Installs the chaincode on the peer
# Better not to run manually! Its in 'make fabric-dev-all-instantiate' and 'make fabric-dev-all-upgrade'.
fabric-dev-chaincode-install:
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			'peer chaincode install -p chaincode/chaincode -n mycc -v $(CC_VERSION) -l "$(CC_LANG)"'

# Instantiates the chaincode on the peer, only for the first time, after this run upgrade instead.
# Better not to run manually! Its in 'make fabric-dev-all-instantiate'
fabric-dev-chaincode-instantiate: fabric-dev-chaincode-install
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			'peer chaincode instantiate -n mycc -v $(CC_VERSION) -c '\''$(CC_ARGS)'\'' -C mychannel --collections-config chaincode/chaincode/collections_config.json'

# Instantiates the chaincode on the peer, only for the first time, after this run upgrade instead.
# Better not to run manually!  Its in 'make fabric-dev-all-upgrade'
fabric-dev-chaincode-upgrade: fabric-dev-chaincode-install
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			$$'peer chaincode upgrade -n mycc -v $(CC_VERSION) -c \'$(CC_ARGS)\' -C mychannel  --collections-config chaincode/chaincode/collections_config.json'

# Invoke something on the chaincode, invoking is done to put some information on the blockchain
#
# EXAMPLE: make fabric-dev-chaincode-invoke CC_ARGS='{"Args":["setCitizen","123","James","Delft", "Street 5"]}'
# Executes the chaincode function 'setCitizen' with arguments "123","James","Delft", "Street 5"
fabric-dev-chaincode-invoke:
	cd fabric-network-dev && \
    	docker exec \
    		-it cli /bin/bash -c \
    			'peer chaincode invoke -n mycc -c '\''$(CC_ARGS)'\'' -C mychannel'

# Query some data on the blockchain, querying is done to retriev some information from the blockchain
#
# EXAMPLE: make fabric-dev-chaincode-query CC_ARGS='{"Args":["getCitizen", "123"]}'
# Executes the chaincode function 'getCitizen', with argument '123'
fabric-dev-chaincode-query:
	cd fabric-network-dev && \
			docker exec \
				-it cli /bin/bash -c \
					'peer chaincode query -n mycc -c '\''$(CC_ARGS)'\'' -C mychannel'

# Combo command to run multiple of above commamds at once
fabric-dev-all-instantiate:
	tmux rename-window main
	tmux new-window -n chaincode 'make fabric-dev-chaincode-connect CC_VERSION=$(CC_VERSION)'
	sleep 5
	tmux new-window -n launch 'make fabric-dev-chaincode-instantiate CC_VERSION=$(CC_VERSION) ; echo "UPGRADE DONE - Chaincode running container should start in a few seconds..." ; sleep 6666';
	sleep 5
	tmux new-window -n log './dockerlogs.sh $(CC_VERSION)'

# Combo command to run multiple of above commamds at once, for quicker upgrading
fabric-dev-all-upgrade:
	tmux kill-window -t chaincode | true
	tmux kill-window -t launch | true
	tmux kill-window -t log | true
	tmux new-window -n chaincode 'make fabric-dev-chaincode-connect CC_VERSION=$(CC_VERSION)'
	sleep 5
	tmux new-window -n launch 'make fabric-dev-chaincode-upgrade CC_VERSION=$(CC_VERSION) ; echo "UPGRADE DONE - Chaincode running container should start in a few seconds..." ; sleep 6666';
	sleep 5
	tmux new-window -n log './dockerlogs.sh $(CC_VERSION)'

##
## FINISH DEVELOPMENT NETWORK SPECIFIC COMMANDS
##

##
## START REAL NETWORK SPECIFIC COMMANDS
##
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

    	# Join peer1.org1.example.com to the channel.
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		-e "CORE_PEER_ADDRESS=peer1.org1.example.com:7051" \
		peer0.org1.example.com peer channel join -b mychannel.block

    	# Join peer2.org1.example.com to the channel.
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		-e "CORE_PEER_ADDRESS=peer2.org1.example.com:7051" \
		peer0.org1.example.com peer channel join -b mychannel.block

	# Join peer3.org1.example.com to the channel.
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		-e "CORE_PEER_ADDRESS=peer3.org1.example.com:7051" \
		peer0.org1.example.com peer channel join -b mychannel.block

    	# Join peer4.org1.example.com to the channel.
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		-e "CORE_PEER_ADDRESS=peer4.org1.example.com:7051" \
		peer0.org1.example.com peer channel join -b mychannel.block

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
		-c '{"Args":[""]}'


fabric-join-peer0:
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

fabric-join-peer1:
    	# Join peer1.org1.example.com to the channel.
	docker exec \
		-e "CORE_PEER_LOCALMSPID=Org1MSP" \
		-e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
		-e "CORE_PEER_ADDRESS=peer1.org1.example.com:7051" \
		peer0.org1.example.com peer channel join -b mychannel.block
##
## FINISH REAL NETWORK SPECIFIC COMMANDS
##

