# cjib-network

#### Remove and stop all previous docker images
```console
foo@bar:~$ make clean-docker
```

#### Generate crypto config (only need to run once)
Do not commit the things it generates to the github repository!
```console
foo@bar:~$ make fabric-init-crypto
```

#### Start blockchain network
```console
foo@bar:~$ make fabric-start-network
```

#### Install the chaincode on the network
```console
foo@bar:~$ make fabric-install-chaincode
```

#### Upgrade the network with new chaincode after changes are made
```console
foo@bar:~$ make fabric-upgrade-chaincode
```
