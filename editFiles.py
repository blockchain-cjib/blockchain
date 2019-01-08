import os
import argparse
from pathlib import Path

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Change CA key in docker-compose.yml')
    parser.add_argument('network', type=str,
                        help='Root directory, fabric-network-dev or fabric-network')
    args = parser.parse_args()

    sourceFolder = Path(args.network) / 'crypto-config/peerOrganizations/org1.example.com/ca/'
    files = os.listdir(sourceFolder)

    filename = next(file for file in files if file.endswith('_sk'))

    with open("fabric-network-dev/docker-compose.yml", "r") as file:
        data = file.readlines()

    data[17] = "      - FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/" + filename + "\n"
    with open("fabric-network-dev/docker-compose.yml", "w") as file:
        file.writelines(data)
