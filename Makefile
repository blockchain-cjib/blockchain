#
# Shortcut commands just for fabric-network-dev
#

FABRIC_ROOT_DIR=fabric-network-dev
CC_LANG=java
CC_VERSION=$(shell date +"%y%m%d%H%M%S")
CC_SRC_PATH=chaincode/chaincodejava
DOCKER_CRYPTO_DIR=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CHANNEL_NAME=mychannel
CC_ARGS={"Args":[""]}
BLOCK_NUMBER=0
CORE_PEER_ADDRESS=peer0.org1.example.com:7051

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

	# Change FABRIC_CA_SERVER_CA_KEYFILE
	python3 editFiles.py $(FABRIC_ROOT_DIR)

# Start the whole blockchain network
fabric-start-network:
	cd $(FABRIC_ROOT_DIR) && \
	docker rm $(shell docker ps -a -q) | true && \
	docker rmi $(docker images | grep dev-peer | awk "{print \$3}") | true && \
	docker-compose up


# Not completely sure what it does but it is nececary when you run the network in development mode
# Better not to run manually! Its in 'make fabric-dev-all-instantiate'
fabric-dev-chaincode-connect:
	docker exec -it chaincode /bin/bash -c \
		'cd chaincode CORE_CHAINCODE_ID_NAME=mycc:$(CC_VERSION) node chaincode --peer.address grpc://peer0.org1.example.com:7052'

# Installs the chaincode on the peer
# Better not to run manually! Its in 'make fabric-dev-all-instantiate' and 'make fabric-dev-all-upgrade'.
fabric-chaincode-install:
	docker exec -it cli /bin/bash -c \
		'peer chaincode install -p $(CC_SRC_PATH) -n mycc -v $(CC_VERSION) -l "$(CC_LANG)"'

# Instantiates the chaincode on the peer, only for the first time, after this run upgrade instead.
# Better not to run manually! Its in 'make fabric-dev-all-instantiate'
fabric-chaincode-instantiate:
	make fabric-chaincode-install CC_VERSION=$(CC_VERSION)
	docker exec -it cli /bin/bash -c \
		'peer chaincode instantiate -n mycc -v $(CC_VERSION) -c '\''$(CC_ARGS)'\'' -C mychannel --collections-config $(CC_SRC_PATH)/collections_config.json'

# Instantiates the chaincode on the peer, only for the first time, after this run upgrade instead.
# Better not to run manually!  Its in 'make fabric-dev-all-upgrade'
fabric-chaincode-upgrade:
	make fabric-chaincode-install CC_VERSION=$(CC_VERSION)
	docker exec -it cli /bin/bash -c \
		'peer chaincode upgrade -n mycc -v $(CC_VERSION) -c '\''$(CC_ARGS)'\'' -C mychannel  --collections-config $(CC_SRC_PATH)/collections_config.json'

# Invoke something on the chaincode, invoking is done to put some information on the blockchain
#
# EXAMPLE: make fabric-dev-chaincode-invoke CC_ARGS='{"Args":["setCitizen","123","James","Delft", "Street 5"]}'
# Executes the chaincode function 'setCitizen' with arguments "123","James","Delft", "Street 5"
fabric-chaincode-invoke:
	docker exec -it cli /bin/bash -c \
		'CORE_PEER_ADDRESS=$(CORE_PEER_ADDRESS) peer chaincode invoke -n mycc -c '\''$(CC_ARGS)'\'' -C mychannel'

# Query some data on the blockchain, querying is done to retriev some information from the blockchain
#
# EXAMPLE: make fabric-dev-chaincode-query CC_ARGS='{"Args":["getCitizen", "123"]}'
# Executes the chaincode function 'getCitizen', with argument '123'
fabric-chaincode-query:
	docker exec -it cli /bin/bash -c \
			'CORE_PEER_ADDRESS=$(CORE_PEER_ADDRESS) peer chaincode query -n mycc -c '\''$(CC_ARGS)'\'' -C mychannel'

# Combo command to run multiple of above commamds at once
fabric-dev-all-instantiate:
	tmux rename-window main
	tmux new-window -n chaincode 'make fabric-dev-chaincode-connect CC_VERSION=$(CC_VERSION) ; sleep 666'
	sleep 5
	tmux new-window -n launch 'make fabric-chaincode-instantiate CC_VERSION=$(CC_VERSION) ; echo "UPGRADE DONE - Chaincode running container should start in a few seconds..." ; sleep 6666';
	sleep 5
	tmux new-window -n log './dockerlogs.sh $(CC_VERSION)'

# Combo command to run multiple of above commamds at once, for quicker upgrading
fabric-dev-all-upgrade:
	tmux kill-window -t chaincode | true
	tmux kill-window -t launch | true
	tmux kill-window -t log | true
	tmux new-window -n chaincode 'make fabric-dev-chaincode-connect CC_VERSION=$(CC_VERSION)'
	sleep 5
	tmux new-window -n launch 'make fabric-chaincode-upgrade CC_VERSION=$(CC_VERSION) ; echo "UPGRADE DONE - Chaincode running container should start in a few seconds..." ; sleep 6666';
	sleep 5
	tmux new-window -n log './dockerlogs.sh $(CC_VERSION)'

query-specific-block:
	docker exec -it cli /bin/bash -c \
			'peer channel fetch $(BLOCK_NUMBER) block$(BLOCK_NUMBER).block -c mychannel --orderer orderer.example.com:7050'
	mv -f $(FABRIC_ROOT_DIR)/block$(BLOCK_NUMBER).block $(FABRIC_ROOT_DIR)/blocks/block$(BLOCK_NUMBER).block
	$(BIN_DIR)/configtxlator proto_decode \
		--type=common.Block \
		--input=$(FABRIC_ROOT_DIR)/blocks/block$(BLOCK_NUMBER).block \
		| jq '.' > $(FABRIC_ROOT_DIR)/blocks/block$(BLOCK_NUMBER).json && rm -f $(FABRIC_ROOT_DIR)/blocks/block$(BLOCK_NUMBER).block

query-newest-block:
	docker exec -it cli /bin/bash -c \
			'peer channel fetch newest newest.block -c mychannel --orderer orderer.example.com:7050'
	mv -f $(FABRIC_ROOT_DIR)/newest.block $(FABRIC_ROOT_DIR)/blocks/newest.block
	$(BIN_DIR)/configtxlator proto_decode \
		--type=common.Block \
		--input=$(FABRIC_ROOT_DIR)/blocks/newest.block \
		| jq '.' > $(FABRIC_ROOT_DIR)/blocks/newestBlock.json \
		&& rm -f $(FABRIC_ROOT_DIR)/blocks/newest.block

query-oldest-block:
	docker exec -it cli /bin/bash -c \
			'peer channel fetch oldest oldest.block -c mychannel --orderer orderer.example.com:7050'
	mv -f $(FABRIC_ROOT_DIR)/oldest.block $(FABRIC_ROOT_DIR)/blocks/oldest.block
	$(BIN_DIR)/configtxlator proto_decode \
		--type=common.Block \
		--input=$(FABRIC_ROOT_DIR)/blocks/oldest.block \
		| jq '.' > $(FABRIC_ROOT_DIR)/blocks/oldestBlock.json && rm -f $(FABRIC_ROOT_DIR)/blocks/oldest.block

# Start the rest server to interact with the blockchain network
start-rest:
	cd rest-server && \
	rm -rf hfc-key-store && \
	npm install && \
	node enrollAdmin.js && \
	node rest-server.js

start-cjib-app:
	echo "Start CJIB app"
	cd cjib-app && \
	npm install && \
	npm start

start-municipalities-app:
	echo "Start Municipality app"
	cd municipalities-app && \
	npm install && \
	npm start

test-blockchain-commands:
	cd fabric-network && docker-compose down

	make fabric-init-crypto FABRIC_ROOT_DIR=fabric-network
	cd fabric-network && docker rm $(shell docker ps -a -q) | true && docker-compose up -d

	# Wait until network has started
	sleep 30

	# Test create citizen
	make fabric-chaincode-invoke CC_ARGS='{"Args":["setCitizen", "1234", "James", "Brown", "New Street 5 Delft", "100", "200", "true", "1"]}'

	# Wait untill citizen is created
	sleep 5

	# Test get citizen no month
	make fabric-chaincode-invoke CC_ARGS='{"Args":["getCitizenMun", "1234"]}'

	# Test get citizen 1 month
	make fabric-chaincode-invoke CC_ARGS='{"Args":["getCitizenMun", "1234", "1"]}'

	# Test get citizen 20 month
	make fabric-chaincode-invoke CC_ARGS='{"Args":["getCitizenMun", "1234", "20"]}'

	# Test get citizen no month
	make fabric-chaincode-invoke CC_ARGS='{"Args":["getCitizenCJIB", "1234"]}'

	# Test get citizen 1 month
	make fabric-chaincode-invoke CC_ARGS='{"Args":["getCitizenCJIB", "1234", "1"]}'

	# Test get citizen 20 month
	make fabric-chaincode-invoke CC_ARGS='{"Args":["getCitizenCJIB", "1234", "20"]}'

	# Test update citizen
	make fabric-chaincode-invoke CC_ARGS='{"Args":["updateCitizen", "1234", "2000"]}'

	# Test delete citizen
	make fabric-chaincode-invoke CC_ARGS='{"Args":["deleteCitizen", "1234"]}'

	# Test create citizen after deletation with same id
	make fabric-chaincode-invoke CC_ARGS='{"Args":["setCitizen", "1234", "James", "Brown", "New Street 5 Delft", "100", "200", "true", "1"]}'

	cd fabric-network && docker-compose down

test:
	cd fabric-chaincode/chaincodejava && gradle clean test
	cd cjib-app && npm test
	cd municipalities-app && npm test