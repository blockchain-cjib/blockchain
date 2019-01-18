package org.hyperledger.fabric.example;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.List;

import com.google.protobuf.ByteString;
import com.sun.org.apache.xpath.internal.operations.Bool;
import io.netty.handler.ssl.OpenSsl;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.shim.ChaincodeBase;
import org.hyperledger.fabric.shim.ChaincodeStub;

import static java.nio.charset.StandardCharsets.UTF_8;

public class SimpleChaincode extends ChaincodeBase {

    private static Log _logger = LogFactory.getLog(SimpleChaincode.class);

    @Override
    public Response init(ChaincodeStub stub) {
        _logger.info("Init java simple chaincode");
        return newSuccessResponse();
    }

    @Override
    public Response invoke(ChaincodeStub stub) {
        try {
            _logger.info("Invoke java simple chaincode");
            String func = stub.getFunction();
            List<String> params = stub.getParameters();
            if (func.equals("setCitizen")) {
                return setCitizen(stub, params);
            }
            if (func.equals("getCitizen")) {
                return getCitizen(stub, params);
            }
            if (func.equals("updateCitizen")) {
                return updateCitizen(stub, params);
            }
            if (func.equals("deleteCitizen")) {
                return deleteCitizen(stub, params);
            }
            return newErrorResponse("Invalid invoke function name. Expecting one of: [\"invoke\", \"delete\", \"query\"]");
        } catch (Throwable e) {
            return newErrorResponse(e);
        }
    }

    private Response setCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() != 7) {
            return newErrorResponse("Incorrect number of arguments. Expecting 7");
        }
        String bsn = args.get(0);
        String firstName = args.get(1);
        String lastName = args.get(2);
        String address = args.get(3);
        String financialSupportStr = args.get(4);
        String consentStr = args.get(5);
        String municipalityIdStr = args.get(6);

        if (bsn == null) {
            return newErrorResponse("Bsn was not provided");
        }
        if (firstName == null) {
            return newErrorResponse("First Name was not provided");
        }
        if (lastName == null) {
            return newErrorResponse("Last Name was not provided");
        }
        if (address == null) {
            return newErrorResponse("Address was not provided");
        }
        if (financialSupportStr == null) {
            return newErrorResponse("Financial Support was not provided");
        }
        if (consentStr == null) {
            return newErrorResponse("Consent was not provided");
        }
        if (municipalityIdStr == null) {
            return newErrorResponse("Municipality Id was not provided");
        }

        Integer financialSupport = Integer.parseInt(financialSupportStr);
        Integer municipalityId = Integer.parseInt(municipalityIdStr);
        Boolean consent = (consentStr.equals("true"));

        String citizenState = stub.getPrivateDataUTF8("citizenCollection", bsn);
        if (citizenState != null) {
            return newErrorResponse("Citizen with BSN: " + bsn + " already exists");
        }

        CitizenInfo citizenInfo = new CitizenInfo(bsn, firstName, lastName, address, financialSupport, consent, municipalityId);

        try {
            byte[] cit = objectToByteArray(citizenInfo);
            stub.putPrivateData("citizenCollection", bsn, cit);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error");
        }

        return newSuccessResponse();
    }

    private Response getCitizen(ChaincodeStub stub, List<String> args) {
        return newSuccessResponse();
    }

    private Response deleteCitizen(ChaincodeStub stub, List<String> args) {
//        if (args.size() != 1) {
//            return newErrorResponse("Incorrect number of arguments. Expecting 1");
//        }
//        String key = args.get(0);
//        // Delete the key from the state in ledger
//        stub.delState(key);
        return newSuccessResponse();
    }

    private Response updateCitizen(ChaincodeStub stub, List<String> args) {
//        if (args.size() != 1) {
//            return newErrorResponse("Incorrect number of arguments. Expecting name of the person to query");
//        }
//        String key = args.get(0);
//        //byte[] stateBytes
//        String val	= stub.getStringState(key);
//        if (val == null) {
//            return newErrorResponse(String.format("Error: state for %s is null", key));
//        }
//        _logger.info(String.format("Query Response:\nName: %s, Amount: %s\n", key, val));
//        return newSuccessResponse(val, ByteString.copyFrom(val, UTF_8).toByteArray());
        return newSuccessResponse();
    }

    private byte[] objectToByteArray(CitizenInfo citizenInfo) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(citizenInfo);
        oos.flush();
        return bos.toByteArray();
    }

    public static void main(String[] args) {
        System.out.println("OpenSSL avaliable: " + OpenSsl.isAvailable());
        new SimpleChaincode().start(args);
    }
}
