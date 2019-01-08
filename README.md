# Hyperdebt-network

#### Switch between development and real network
Switching is done by setting the make parameter `FABRIC_ROOT_DIR`
to either `fabric-network-dev` or `fabric-network`. So for example:
```console
foo@bar:~$ make fabric-init-crypto FABRIC_ROOT_DIR=fabric-network
```

#### Initialize configuration
```console
foo@bar:~$ make fabric-init-crypto FABRIC_ROOT_DIR=fabric-network-dev
```

#### Start development network
Leave terminal open
```console
foo@bar:~$ make fabric-start-network FABRIC_ROOT_DIR=fabric-network-dev
```

#### Installing and upgrading chaincode on the network
For each upgrade we need to restart the chaincode debugger AND upgrade the network. Because doing this manually 
is too annoying we can run the two windows in `tmux`.

First install tmux, in ubuntu:
```console
foo@bar:~$ sudo apt -y install tmux
```

Now we need three terminal windows.

(1) In the first one you have the network running as specified above.

(2) In the second window you start tmux by executing `tmux`

(3) In the third window you send commands to the second tmux window, by using the command 
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

To switch between the tmux windows, press `Control+b` and then `p` or `Control+b` and then `n` in 
the second (tmux) terminal.

#### Invoke chaincode on the network
```console
foo@bar:~$ make fabric-chaincode-invoke
```

Invoke with custom arguments:
```console
foo@bar:~$ make fabric-chaincode-invoke CC_ARGS='{"Args":["setCitizen","123","James","Delft", "Street 5"]}'
```

#### Query chaincode on the network
```console
foo@bar:~$ make fabric-chaincode-query CC_ARGS='{"Args":["getCitizen","123"]}'
```

### REST-API server
All in one:
```console
foo@bar:~$ make start-rest
```

Step by step:
#### Create admin
```console
foo@bar:~$ node enrollAdmin.js
 Store path:/home/y/Documents/CS4160 Blockchain Engineering/blockchain/rest-api/hfc-key-store
Successfully loaded admin from persistence
Assigned the admin user to the fabric client ::{"name":"admin","mspid":"Org1MSP","roles":null,"affiliation":"","enrollmentSecret":"","enrollment":{"signingIdentity":"524ff911a22b85000770417a9a65c827a85a4f2f460c8600afdda607285901d1","identity":{"certificate":"-----BEGIN CERTIFICATE-----\nMIICATCCAaigAwIBAgIUBV8vgJxIOqM3oz8wGB0WRpduPUQwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgxMjI4MTgwNTAwWhcNMTkxMjI4MTgx\nMDAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAEONZh0CyVv9uNUbsJRB28XDrtCZ/mqpqmMAgL8cVZ\nNhbFGOayBvGH97pvQBz3Ysi2eulM39zaWNsBUuPjZMQBs6NsMGowDgYDVR0PAQH/\nBAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFNHW0KdSzkEyAyjbq066HcwC\n/W74MCsGA1UdIwQkMCKAIEqwliofTiy1P6NkG3EPehypJqWmlG1wglbhCxS/NoqS\nMAoGCCqGSM49BAMCA0cAMEQCIBKkzsOYLkASivnmLJyFUS5B1z/XQvxfyAM69z5Q\neCbVAiA4qmCrorn5Jy1ALitu5QdHVLmyAlum4FCN6cSX8aFabg==\n-----END CERTIFICATE-----\n"}}}
```

#### Start server
```console
foo@bar:~$ node rest-client.js
Store path:.../rest-api/hfc-key-store
Listening at http://localhost:8081
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
foo@bar:~$ http POST localhost:8080/api/getCitizen bsn='3' --json
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