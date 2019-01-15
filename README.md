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

To add a new citizen: 
```console
foo@bar:~$ make fabric-chaincode-invoke CC_ARGS='{"Args":["setCitizen","123","James","Delft", "Street 5", "1000", "true", "1"]}'
```
To delete an existing citizen:
```console
foo@bar:~$ make fabric-chaincode-invoke CC_ARGS='{"Args":["deleteCitizen","123"]}'
```
To update financial support information of an existing citizen:
```console
foo@bar:~$ make fabric-chaincode-invoke CC_ARGS='{"Args":["updateCitizen","123", "2000"]}'
```


#### Query chaincode on the network
```console
foo@bar:~$ make fabric-chaincode-query CC_ARGS='{"Args":["getCitizen","123", "100", "2"]}'
```

#### Query actual blocks on the blockchain
The following command retrieves the block with specified blocknumber *a* (the *n*th block
added to the blockchain has blocknumber *n*-1):

```console
foo@bar:~$ make query-specific-block BLOCK_NUMBER=*a*
```

To retrieve the latest block added:

```console
foo@bar:~$ make query-oldest-block
```

To retrieve the newest block added:

```console
foo@bar:~$ make query-newest-block
```

# PostgreSQL

The REST Server described in the next section uses a PostgreSQL to authenticate requests. 
 In other words, a database that consists of cjib and municipalities users is needed.

## 1. Create database
Create a PostgreSQL database with the following attributes:

```
{
    database: 'hyperdebt',
    username: 'postgres',
    password: 'postgres',
    host: 'localhost'
}
```

## 2. Create "users" table

Once the PostgreSQL instance is up execute the following to create the table.
```sql
create table users
(
    id       serial       not null constraint user_pkey primary key,
    username varchar(100) not null,
    password varchar(100) not null,
    role     integer      not null
);

alter table users
  owner to postgres;
```

## 3. Store "dummy" users
Execute the following to create 2 dummy users in the database (one for CJIB and one for the municipalities). The password for both of these users is "admin".

```sql
insert into users values (0, 'cjib_admin', '$2y$10$UfzmabEBmKu/ho7029xJwey0wvm6em8N1TISxyIEzagQ7PM4cEnri
', 0);
insert into users values (0, 'mun_admin', '$2y$10$UfzmabEBmKu/ho7029xJwey0wvm6em8N1TISxyIEzagQ7PM4cEnri
', 1);

```

# REST Server

To startup the rest server, run the following command:
```console
foo@bar:~$ make start-rest
```

The command mentioned above does the following 2 [Step by step]:
## 1. Create admin
```console
foo@bar:~$ node enrollAdmin.js
 Store path:/home/y/Documents/CS4160 Blockchain Engineering/blockchain/rest-api/hfc-key-store
Successfully loaded admin from persistence
Assigned the admin user to the fabric client ::{"name":"admin","mspid":"Org1MSP","roles":null,"affiliation":"","enrollmentSecret":"","enrollment":{"signingIdentity":"524ff911a22b85000770417a9a65c827a85a4f2f460c8600afdda607285901d1","identity":{"certificate":"-----BEGIN CERTIFICATE-----\nMIICATCCAaigAwIBAgIUBV8vgJxIOqM3oz8wGB0WRpduPUQwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgxMjI4MTgwNTAwWhcNMTkxMjI4MTgx\nMDAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAEONZh0CyVv9uNUbsJRB28XDrtCZ/mqpqmMAgL8cVZ\nNhbFGOayBvGH97pvQBz3Ysi2eulM39zaWNsBUuPjZMQBs6NsMGowDgYDVR0PAQH/\nBAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFNHW0KdSzkEyAyjbq066HcwC\n/W74MCsGA1UdIwQkMCKAIEqwliofTiy1P6NkG3EPehypJqWmlG1wglbhCxS/NoqS\nMAoGCCqGSM49BAMCA0cAMEQCIBKkzsOYLkASivnmLJyFUS5B1z/XQvxfyAM69z5Q\neCbVAiA4qmCrorn5Jy1ALitu5QdHVLmyAlum4FCN6cSX8aFabg==\n-----END CERTIFICATE-----\n"}}}
```

## 2. Start server
```console
foo@bar:~$ node rest-client.js
Store path:.../rest-api/hfc-key-store
Listening at http://localhost:8081
```

## Authenticate and interact with REST server

To verify the REST Server is up and running, you can use **Postman** to invoke HTTP requests.

### 1. Get yourself authenticated 

**Postman URL:** http://localhost:8080/authenticate \
**HTTP method:** POST \
**HTTP body:** Use *x-www-form-urlencoded* and add the following to the body:

```json 
name -> mun_admin 
password -> admin
```

The following request will return a **token**. Use this for the next requests!

**Note!** If you want to query a citizen the **cjib_admin** should be used for authentication.

### 2. Create a citizen

**Postman URL:** http://localhost:8080/createCitizen \
**HTTP method:** POST \
**HTTP headers:** Add the following pair: 
```
{
    Authorization -> TOKEN_THAT_WAS_RETURNED
}
```

**HTTP body:** 

```json
{
    "bsn": "123788888",
    "firstName": "Angelos",
    "lastName": "NotSaying",
    "address": "Blablah 52",
    "financialSupport": "1000",
    "consent": "true",
    "municipalityId": "1"
}

```

### 2. Query Citizen

**Postman URL:** http://localhost:8080/getCitizen?bsn=3&fineAmount=10020 \
**HTTP method:** GET \
**HTTP headers:** Add the following pair: 
```
{
    Authorization -> TOKEN_THAT_WAS_RETURNED
}
```
