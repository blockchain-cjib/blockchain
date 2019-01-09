/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

    // Initialize the chaincode
    async Init(stub) {
        console.info('Init chaincode');
        return shim.success();
    }

    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID());

        // Extract the function and args from the transaction proposal
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];

        if (!method) {
            console.log('no method of name:' + ret.fcn + ' found');
            return shim.success(); 
        }

        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async setCitizen(stub, args) {
        console.info('Creating new citizen')
        if (args.length != 4) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }

        if (args[0].lenth <= 0) {
            throw new Error('1st argument (BSN) must be a non-empty string');
        }
        if (args[1].lenth <= 0) {
            throw new Error('2nd argument (Name) must be a non-empty string');
        }
        if (args[2].lenth <= 0) {
            throw new Error('3rd argument (AddressCity) must be a non-empty string');
        }
        if (args[3].lenth <= 0) {
            throw new Error('4th argument (AddressStreet) must be a non-empty string');
        }

        let bsn = args[0];
        let name = args[1];
        let addressCity = args[2];
        let addressStreet = args[3];

        // Check if bsn already exists
        console.log('Check if already exists');

        let citizenState = await stub.getState(bsn);
        if (citizenState.toString()) {
            throw new Error('Citizen with this BSN already exists ' + bsn);
        }

        // Create citizen object
        let citizen = {};
        citizen.docType = 'citizen';
        citizen.bsn = bsn;
        citizen.name = name;
        citizen.addressCity = addressCity;
        citizen.addressStreet = addressStreet;

        // Store citizen
        //await stub.putState(bsn, Buffer.from(JSON.stringify(citizen)), {privateCollection: 'citizenCollection'});
        await stub.putState(bsn, Buffer.from(JSON.stringify(citizen)));
        console.info(JSON.stringify(citizen));
    }

    async getCitizen(stub, args) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }

        let bsn = args[0];
        if (args[0].length <= 0) {
            throw new Error('1st argument (BSN) must be a non-empty string');
        }

        //let citizen = await stub.getState(bsn, {privateCollection: 'citizenCollection'});
        let citizen = await stub.getState(bsn);
        if (citizen.toString() == []) {
            throw new Error('Citizen with this BSN does not exist');
        }

        console.info(citizen.toString());
        return citizen;
    }

    async deleteCitizen(stub, args) {
        if (args.length != 1) {
          throw new Error('Incorrect number of arguments. Expecting 1');
        }
        let bsn = args[0];
        if (args[0].length <= 0) {
            throw new Error('1st argument (BSN) must be a non-empty string');
        }

        //let citizen = await stub.getState(bsn, {privateCollection: 'citizenCollection'});
        let citizen = await stub.getState(bsn);
        if (citizen.toString() == []) {
                throw new Error('Citizen with this BSN does not exist');
            }


        //await stub.deletePrivateData('citizenCollection', bsn)
        await stub.deleteState(bsn); //remove the citizen from chaincode state
        console.info("citizen deleted with bsn number: " + bsn);
    }

    async updateCitizen(stub, args) {
        if (args.length != 2) {
            throw new Error('Incorrect number of arguments. Expecting 2');
        }

        let bsn = args[0];
        if (args[0].length <= 0) {
            throw new Error('1st argument (BSN) must be a non-empty string');
        }

        //let citizen = await stub.getState(bsn, {privateCollection: 'citizenCollection'});
        let citizenAsBytes = await stub.getState(bsn);
        if (citizenAsBytes.toString() == []) {
            throw new Error('Citizen with this BSN does not exist');
        }

        let newName = args[1];
        console.info('start updateCitizen ', bsn, newName);

        let citizenToUpdate = {};
        citizenToUpdate = JSON.parse(citizenAsBytes.toString()); //unmarshal
        citizenToUpdate.name = newName; //change the name
        await stub.putState(bsn, Buffer.from(JSON.stringify(citizenToUpdate))); //rewrite the marble

        console.info("Citizen updated");
        console.info(citizenToUpdate);
      }
};

shim.start(new Chaincode());
