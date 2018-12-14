fabric-download-dev-server:
	cd fabric-composer-project/fabric-dev-servers && \
	./downloadFabric.sh

fabric-restart-dev-server:
	cd fabric-composer-project/fabric-dev-servers && \
		./teardownFabric.sh && docker rm $(shell docker ps -aq) \
		|| ./startFabric.sh
	docker ps

fabric-archive-and-install:
	# Stop committing changes for fabric package.json by default (because of version)
	git update-index --assume-unchanged fabric-composer-project/package.json

	# Upgrade the package.json version
	cd fabric-composer-project && \
	npm version patch

	# Create archive locally
	cd fabric-composer-project && \
	composer archive create --sourceType dir \
		                    --sourceName . \
		                    --archiveFile cjib-network.bna

	# Store the archive on the blockhain
	cd fabric-composer-project && \
	composer network install --card PeerAdmin@hlfv1 \
							 --archiveFile cjib-network.bna

fabric-init-network: fabric-archive-and-install
	# Start the network using the newly installed network
	cd fabric-composer-project && \
	composer network start --networkName cjib-network \
                           --networkVersion $(shell cat fabric-composer-project/package.json | jq -r '.version | .[0:]') \
                           --networkAdmin admin \
                           --networkAdminEnrollSecret adminpw \
                           --card PeerAdmin@hlfv1 \
                           --file networkadmin.card

	# Import the network administrator
	cd fabric-composer-project && \
	composer card import --file networkadmin.card | true

	# Test the connection
	cd fabric-composer-project && \
	composer network ping --card admin@cjib-network

fabric-upgrade-network: fabric-archive-and-install
	# Upgrade network
	cd fabric-composer-project && \
	composer network upgrade --networkName cjib-network \
                             --card PeerAdmin@hlfv1 \
                             --networkVersion $(shell cat fabric-composer-project/package.json | jq -r '.version | .[0:]')

	# Test the connection
	cd fabric-composer-project && \
	composer network ping --card admin@cjib-network

start-rest:
	cd fabric-composer-project && \
	composer-rest-server --card admin@cjib-network \
		                 --namespaces never

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