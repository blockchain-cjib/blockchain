# cjib-network

cjib


#How to create network card
composer card create -n network-name -p connection-profile.file -u user-name -c certificate -k private-key -r role-1(PeerAdmin) -r role-2 (ChannelAdmin) -f file-name

#Install composer runtime
composer runtime install --card card-name --businessNetworkName network-name

#deploy business network
composer network start --card card-name --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile bna --file bnc

#import network administrator identity
composer card import --file bnc

#check deployment by pinging
composer network ping --card admin@network-name

```console
foo@bar:~$ make create-card
foo
```

