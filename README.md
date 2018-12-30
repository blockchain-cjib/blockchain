# Hyperdebt-network

#### Remove and stop all previous docker images
```console
foo@bar:~$ make clean-docker
```

### Development network

#### Initialize configuration
```console
foo@bar:~$ make fabric-init-crypto FABRIC_ROOT_DIR=fabric-network-dev
```

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

### REST-API server
```console
foo@bar:~$ cd rest-api && npm install
```

#### Create admin
```console
foo@bar:~$ node enrollAdmin.js
 Store path:/home/y/Documents/CS4160 Blockchain Engineering/blockchain/rest-api/hfc-key-store
Successfully loaded admin from persistence
Assigned the admin user to the fabric client ::{"name":"admin","mspid":"Org1MSP","roles":null,"affiliation":"","enrollmentSecret":"","enrollment":{"signingIdentity":"524ff911a22b85000770417a9a65c827a85a4f2f460c8600afdda607285901d1","identity":{"certificate":"-----BEGIN CERTIFICATE-----\nMIICATCCAaigAwIBAgIUBV8vgJxIOqM3oz8wGB0WRpduPUQwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgxMjI4MTgwNTAwWhcNMTkxMjI4MTgx\nMDAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAEONZh0CyVv9uNUbsJRB28XDrtCZ/mqpqmMAgL8cVZ\nNhbFGOayBvGH97pvQBz3Ysi2eulM39zaWNsBUuPjZMQBs6NsMGowDgYDVR0PAQH/\nBAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFNHW0KdSzkEyAyjbq066HcwC\n/W74MCsGA1UdIwQkMCKAIEqwliofTiy1P6NkG3EPehypJqWmlG1wglbhCxS/NoqS\nMAoGCCqGSM49BAMCA0cAMEQCIBKkzsOYLkASivnmLJyFUS5B1z/XQvxfyAM69z5Q\neCbVAiA4qmCrorn5Jy1ALitu5QdHVLmyAlum4FCN6cSX8aFabg==\n-----END CERTIFICATE-----\n"}}}
```

#### Start server
```console
foo@bar:~$ node client.js
Store path:.../rest-api/hfc-key-store
Example app listening at http://localhost:8081
```

#### Invoke and Query server

```console
foo@bar:~$ http POST localhost:8080/api/createCitizen bsn='3' name='James' addressCity='Delft' addressStreet='Street 5' --json
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 20
Content-Type: application/json; charset=utf-8
Date: Sun, 30 Dec 2018 19:06:29 GMT
ETag: W/"14-Y53wuE/mmbSikKcT/WualL1N65U"
X-Powered-By: Express

{
    "status": "success"
}
```


```console
foo@bar:~$ http POST localhost:8080/api/getCitizen bsn='2' --json
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 95
Content-Type: application/json; charset=utf-8
Date: Sun, 30 Dec 2018 19:08:58 GMT
ETag: W/"5f-i6rnL/mRxMJYbCoyuBiOXgE8y+M"
X-Powered-By: Express

{
    "addressCity": "Delft",
    "addressStreet": "Street 5",
    "bsn": "2",
    "docType": "citizen",
    "name": "James"
}
```