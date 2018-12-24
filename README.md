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
Leave terminal open, in this window you can view chaincode logging output
```console
foo@bar:~$ make fabric-dev-chaincode-connect
```

#### Installing and upgrading chaincode on the network
For each upgrade we need to restart the chaincode debugger AND upgrade the network. Because doing this manually 
is too annoying we can run the two windows in `tmux`.

First install tmux, in ubuntu:
```console
foo@bar:~$ sudo apt -y install tmux
```

Now we need three terminal windows.

In the first one you have the network running as specified above.

In the second window you start tmux by executing `tmux`

In the third window you send commands to the second tmux window, by using the command 
below:

For the first run:
```console
foo@bar:~$ make fabric-dev-all-instantiate
```

When upgrading:
```console
foo@bar:~$ make fabric-dev-all-upgrade
```

Leave all three windows open when you update some code and just re-run above command in the third terminal.

To actually view the chaincode logging, you need to switch tmux windows. To do this, press `Control+b` and then `p` in 
the second (tmux) terminal.

#### Invoke chaincode on the network
```console
foo@bar:~$ make fabric-dev-chaincode-invoke
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