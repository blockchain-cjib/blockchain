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

    // Creates a new Citizen 
    async setCitizen(stub, args) {
        console.info('Creating new citizen')
        if (args.length != 7) {
            throw new Error('Incorrect number of arguments. Expecting 7.');
        }

        let bsn = args[0];
        let firstName = args[1];
        let lastName = args[2];
        let address = args[3];
        let financialSupport = parseInt(args[4]);
        let consent = (args[5] === 'true');
        let municipalityId = parseInt(args[6]);

        if (bsn.length <= 0) {
            throw new Error('(BSN) was not provided');
        }
        if (firstName.length <= 0) {
            throw new Error('(First Name) was not provided');
        }
        if (lastName.length <= 0) {
            throw new Error('(Last Name) was not provided');
        }
        if (address.length <= 0) {
            throw new Error('(Address) was not provided');
        }
        if (financialSupport < 0) {
            throw new Error('(Financial Support) cannot be a negative number');
        }
        if (!consent) {
            throw new Error('Citizen \"consent\" was not provided');
        }
        if (!municipalityId) {
            throw new Error('\"Municipality Id\" was not provided');
        }
        

        // Check if bsn already exists
        console.log('Check if already exists');

        let citizenState = await stub.getPrivateData('citizenCollection', bsn);
        if (citizenState.toString()) {
            throw new Error('Citizen with BSN: ' + bsn + ' already exists.' + bsn);
        }

        // Create citizen object
        let citizen = {};
        citizen.docType = 'citizen';
        citizen.bsn = bsn;
        citizen.firstName = firstName;
        citizen.lastName = lastName;
        citizen.address = address;
        citizen.financialSupport = financialSupport;
        citizen.consent = consent;
        citizen.municipalityId = municipalityId;

        // Store citizen
        await stub.putPrivateData('citizenCollection', bsn, Buffer.from(JSON.stringify(citizen)));
        //await stub.putState(bsn, Buffer.from(JSON.stringify(citizen)));
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

        let citizen = await stub.getPrivateData('citizenCollection', bsn);
        //let citizen = await stub.getState(bsn);
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

        let citizen = await stub.getPrivateData('citizenCollection', bsn);
        //let citizen = await stub.getState(bsn);
        if (citizen.toString() == []) {
                throw new Error('Citizen with this BSN does not exist');
            }


        await stub.deletePrivateData('citizenCollection', bsn)
        //await stub.deleteState(bsn); //remove the citizen from chaincode state
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
        //let citizenAsBytes = await stub.getState(bsn);
        let citizenAsBytes = await stub.getPrivateData('citizenCollection', bsn);
        if (citizenAsBytes.toString() == []) {
            throw new Error('Citizen with this BSN does not exist');
        }

        let newFinancialSupport = args[1];
        console.info('start updateCitizen ', bsn, newFinancialSupport);

        let citizenToUpdate = {};
        citizenToUpdate = JSON.parse(citizenAsBytes.toString()); //unmarshal
        citizenToUpdate.financialSupport = newFinancialSupport; //change the name
        //await stub.putState(bsn, Buffer.from(JSON.stringify(citizenToUpdate))); //rewrite the marble
        await stub.putPrivateData('citizenCollection', bsn, Buffer.from(JSON.stringify(citizenToUpdate)));

        console.info("Citizen updated");
        console.info(citizenToUpdate);
      }
};

shim.start(new Chaincode());
