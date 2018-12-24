# Hyperdebt-network

#### Remove and stop all previous docker images
```console
foo@bar:~$ make clean-docker
```

### Development network

#### Start development network
Leave terminal open
```console
foo@bar:~$ make fabric-dev-start-network
```

#### Make connection to peer node
Leave terminal open
```console
foo@bar:~$ make fabric-dev-chaincode-connect
```

#### First time instantiation of chaincode
```console
foo@bar:~$ make fabric-dev-chaincode-instantiate
```

#### Upgrading of chaincode
```console
foo@bar:~$ make fabric-dev-chaincode-upgrade
```

#### Invoke chaincode on the network
```console
foo@bar:~$ make fabric-dev-chaincode-invoke
```

Upgrade and invoke:
```console
foo@bar:~$ make fabric-dev-chaincode-upgrade && make fabric-dev-chaincode-invoke
```

Invoke with custom arguments:
```console
foo@bar:~$ make fabric-dev-chaincode-invoke CC_ARGS='{"Args":["setCitizen","123","James","Delft", "Street 5"]}'
```


#### Query chaincode on the network
```console
foo@bar:~$ make fabric-dev-chaincode-query
```

### "Production" network
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