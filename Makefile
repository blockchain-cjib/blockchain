create-card:
	cd fabric-composer-project && \
	composer card create -n network-name \
	-p connection-profile.file \
	-u user-name \
	-c certificate \
	-k private-key \
	-r role-1(PeerAdmin) \
	-r role-2 (ChannelAdmin) \
	-f file-name

deploy-network:
	cd fabric-composer-project && \
	composer archive create --sourceType dir \
		--sourceName . \
		-a tutorial-network@0.0.1.bna

	# Install
	cd fabric-composer-project && \
	composer network install --card PeerAdmin@hlfv1 \
		--archiveFile tutorial-network@0.0.1.bna

	# Start the network
	cd fabric-composer-project && \
	composer network start --networkName tutorial-network \
		--networkVersion 0.0.1 \
		--networkAdmin admin \
		--networkAdminEnrollSecret adminpw \
		--card PeerAdmin@hlfv1 \
		--file networkadmin.card

	# Upgrade network
	cd fabric-composer-project && \
	composer network upgrade -c PeerAdmin@hlfv1 \
		-n tutorial-network \
		-V 0.0.1

	# Import the network administrator
	cd fabric-composer-project && \
	composer card import --file networkadmin.card

	# Test the connection
	cd fabric-composer-project && \
	composer network ping --card admin@tutorial-network


start-rest:
	cd fabric-composer-project && \
	composer-rest-server -c admin@tutorial-network \
		-n never

start-cjib-app:
	echo "Start CJIB app"

start-municipalities-app:
	echo "Start Municipality app"