package org.hyperledger.fabric.example;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.math.BigInteger;
import java.io.*;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;
import com.ing.blockchain.zk.RangeProof;
import com.ing.blockchain.zk.TTPGenerator;
import com.ing.blockchain.zk.dto.BoudotRangeProof;
import com.ing.blockchain.zk.dto.ClosedRange;
import com.ing.blockchain.zk.dto.Commitment;
import com.ing.blockchain.zk.dto.TTPMessage;
import io.netty.handler.ssl.OpenSsl;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.shim.ChaincodeBase;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.json.JSONObject;

import static java.nio.charset.StandardCharsets.UTF_8;

public class Chaincode extends ChaincodeBase {

    private static Log _logger = LogFactory.getLog(Chaincode.class);

    /**
     * Init is called during chaincode instantiation to initialize any data.
     */
    @Override
    public Response init(ChaincodeStub stub) {
        _logger.info("Init java simple chaincode");
        return newSuccessResponse();
    }

    /**
     * Invoke is called per transaction on the chaincode.
     */
    @Override
    public Response invoke(ChaincodeStub stub) {
        try {
            _logger.info("Invoke java simple chaincode");
            String func = stub.getFunction();
            List<String> params = stub.getParameters();
            // Handle different functions
            switch (func) {
                case "setCitizen": //create a new citizen
                    return setCitizen(stub, params);
                case "getCitizenMun": //get citizen based on bsn, from municipality side
                    return getCitizenMun(stub, params);
                case "getCitizenCJIB": //get citizen based on bsn, from CJIB side
                    return getCitizenCJIB(stub, params);
                case "updateCitizen": //update citizen information with given bsn
                    return updateCitizen(stub, params);
                case "deleteCitizen": //delete citizen with given bsn
                    return deleteCitizen(stub, params);
                default:
                    return newErrorResponse("Invalid invoke function name. Expecting one of: [\"setCitizen\", " +
                            "\"getCitizenMun\", \"getCitizenCJIB\", \"updateCitizen\", \"deleteCitizen\"]");
            }
        } catch (Throwable e) {
            return newErrorResponse(e);
        }
    }

    /**
     * Creates a new citizen with given parameters and stores a on the ledger.
     * If a citizen with given BSN exists, doesn't create a new one.
     * <p>
     * args(8): {bsn, firstName, lastName, address, financialSupportStr, fineStr, consentStr, municipalityIdStr}
     */
    private Response setCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() != 8) {
            return newErrorResponse("Incorrect number of arguments. Expecting 8");
        }
        String bsn = args.get(0);
        String firstName = args.get(1);
        String lastName = args.get(2);
        String address = args.get(3);
        String financialSupportStr = args.get(4);
        String fineStr = args.get(5);
        String consentStr = args.get(6);
        String municipalityIdStr = args.get(7);

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
        if (fineStr == null) {
            return newErrorResponse("Fine amount was not provided");
        }
        if (consentStr == null) {
            return newErrorResponse("Consent was not provided");
        }
        if (municipalityIdStr == null) {
            return newErrorResponse("Municipality Id was not provided");
        }

        //Parse arguments
        Integer financialSupport = Integer.parseInt(financialSupportStr);
        Integer fine = Integer.parseInt(fineStr);
        Integer municipalityId = Integer.parseInt(municipalityIdStr);
        Boolean consent = (consentStr.equals("true"));

        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);

        //Check if citizen already exists
        if (!citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s already exists'", bsn));
        }

        //Create a citizen object
        CitizenInfo citizenInfo = new CitizenInfo(bsn, firstName, lastName, address, financialSupport,
                fine, consent, municipalityId);

        //Convert citizen object to byte array and save into state
        try {
            byte[] cit = objectToByteArray(citizenInfo);
            stub.putPrivateData("citizenCollection", bsn, cit);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error " + e);
        }

        //Return success
        return newSuccessResponse("citizen added successfully");
    }

    /**
     * Reads citizen information with given BSN from the ledger.
     * Difference from getCitizenCJIB: this adds financialSupport to response.
     * args(1) = {BSN}
     */
    private Response getCitizenMun(ChaincodeStub stub, List<String> args) {
        if (args.size() > 2) {
            return newErrorResponse("Incorrect number of arguments. Expecting 1 or 2");
        }

        String bsn = args.get(0);
        if (bsn == null) {
            return newErrorResponse("Bsn was not provided");
        }

        int months;
        if (args.size() != 2) {
            months = 0;
        } else {
            months = Integer.parseInt(args.get(1));
        }

        //Check if citizen exists
        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);
        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        //Search ledger with given BSN, save returned citizen info as byte array
        CitizenInfo citizenInfo;
        byte[] citizenInfoByte = stub.getPrivateData("citizenCollection", bsn);

        //Convert byte array citizen info into object
        try {
            citizenInfo = byteArrayToObject(citizenInfoByte);
        } catch (IOException | ClassNotFoundException e) {
            return newErrorResponse("Conversion Error " + e);
        }

        //Generate response with citizen info object to return to REST API.
        //Normally financial information is not returned, here it is added to test.
        String response;
        try {
            response = buildCitizenResponse(citizenInfo, months)
                    .put("financialSupport", citizenInfo.getFinancialSupport())
                    .toString();
        } catch (JsonProcessingException e) {
            return newErrorResponse(e);
        }
        _logger.info(response);

        //Return success and requested citizen information as response
        return newSuccessResponse("success", ByteString.copyFrom(response, UTF_8).toByteArray());
    }

    /**
     * Reads citizen information with given BSN from the ledger.
     * Financial support information is not added to response.
     * args(1) = {BSN}
     */
    private Response getCitizenCJIB(ChaincodeStub stub, List<String> args) {
        if (args.size() >= 1 && args.size() < 2) {
            return newErrorResponse("Incorrect number of arguments. Expecting 1 or 2");
        }

        String bsn = args.get(0);
        if (bsn == null) {
            return newErrorResponse("Bsn was not provided");
        }

        String monthsStr = args.get(1);
        int months;
        if (monthsStr == null) {
            months = 0;
        } else {
            months = Integer.parseInt(monthsStr);
        }

        //Check if citizen exists
        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);
        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        //Search ledger with given BSN, save returned citizen info as byte array
        CitizenInfo citizenInfo;
        byte[] citizenInfoByte = stub.getPrivateData("citizenCollection", bsn);
        //Convert byte array citizen info into object
        try {
            citizenInfo = byteArrayToObject(citizenInfoByte);
        } catch (IOException | ClassNotFoundException e) {
            return newErrorResponse("Conversion Error " + e);
        }

        //Generate response with citizen info object to return to REST API
        String response;
        try {
            response = buildCitizenResponse(citizenInfo, months).toString();
        } catch (JsonProcessingException e) {
            return newErrorResponse(e);
        }
        _logger.info(response);

        //Return success and requested citizen information as response
        return newSuccessResponse("success", ByteString.copyFrom(response, UTF_8).toByteArray());
    }

    /**
     * Removes citizen information with given BSN from ledger.
     * args(1) = {BSN}
     */
    private Response deleteCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() != 1) {
            return newErrorResponse("Incorrect number of arguments. Expecting 1");
        }

        String bsn = args.get(0);
        if (bsn.length() <= 0) {
            return newErrorResponse("1st argument (BSN) must be a non-empty string");
        }

        //Check if citizen exists
        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);
        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        //Delete citizen with given BSN
        stub.delPrivateData("citizenCollection", bsn);

        _logger.info(String.format("citizen deleted with bsn number: %s", bsn));
        //Return success
        return newSuccessResponse();
    }

    /**
     * Removes citizen information with given BSN from ledger.
     * args(2) = {BSN, new financial support}
     */
    private Response updateCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() != 2) {
            return newErrorResponse("Incorrect number of arguments. Expecting 2");
        }

        String bsn = args.get(0);
        if (bsn.length() <= 0) {
            return newErrorResponse("1st argument (BSN) must be a non-empty string");
        }

        //Check if citizen exists
        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);
        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        //Search ledger with given BSN, save returned citizen info as byte array
        CitizenInfo citizenInfo;
        byte[] citizenInfoByte = stub.getPrivateData("citizenCollection", bsn);
        //Convert byte array citizen info into object
        try {
            citizenInfo = byteArrayToObject(citizenInfoByte);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error");
        } catch (ClassNotFoundException e) {
            return newErrorResponse("Class not found");
        }

        //Parse the argument
        Integer newFinancialSupport = Integer.parseInt(args.get(1));
        //Change the financial support value of citizen object with new value
        citizenInfo.setFinancialSupport(newFinancialSupport);

        _logger.info(String.format("new financialSupport of citizen: %s", newFinancialSupport));

        //Convert citizen object to byte array and save into state
        try {
            byte[] cit = objectToByteArray(citizenInfo);
            stub.putPrivateData("citizenCollection", bsn, cit);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error");
        }

        _logger.info("Update complete");

        //Return success
        return newSuccessResponse("update finished successfully", ByteString.copyFrom(bsn + ": " + newFinancialSupport, UTF_8).toByteArray());
    }

    /**
     * Checks whether citizen can pay his fine or not.
     * If fine is less than financialSupport, citizen is able to pay.
     */
    private static Boolean canPay(Integer fine, Integer financialSupport) {
        return fine <= financialSupport;
    }

    /**
     * Creates a closed interval of integers.
     */
    private static ClosedRange generateRange(Integer fine, Integer financialSupport) {
        ClosedRange closedRange;
        fine *= 100;
        financialSupport *= 100;
        if (!canPay(fine, financialSupport)) {
            fine -= 1;
            closedRange = ClosedRange.of("0", fine.toString());
        } else {
            closedRange = ClosedRange.of(fine.toString(), "999999999999999999999999999999999999999999999999999999999999999");
        }

        return closedRange;
    }

    private Proof generateProof(Integer financialSupport, Integer fine) {
        //Generate ZKRP to proove to CJIB that citizen can or can not pay
        TTPMessage ttpMessage = TTPGenerator.generateTTPMessage(BigInteger.valueOf(financialSupport * 100));
        ClosedRange closedRange = generateRange(fine, financialSupport);
        BoudotRangeProof rangeProof = RangeProof.calculateRangeProof(ttpMessage, closedRange);

        return new Proof(ttpMessage.getCommitment(), closedRange, rangeProof);
    }


    /**
     * Creates a JSONObject with citizenInfo object to return to REST API.
     */
    private JSONObject buildCitizenResponse(CitizenInfo citizenInfo, int months) throws JsonProcessingException {

        int citizenMoney = citizenInfo.getFinancialSupport();
        if (months > 0) {
            citizenMoney *= months;
        }

        Proof proof = generateProof(citizenMoney, citizenInfo.getFine());

        //Convert ZKRP variables into String variables to be able to call while verifying with JS code.
        ObjectMapper mapper = new ObjectMapper();
        String serializedCommitment = mapper.writeValueAsString(proof.getCommitment());
        _logger.info("Commitment: " + serializedCommitment);
        String serializedProof = mapper.writeValueAsString(proof.getRangeProof());
        _logger.info("Proof: " + serializedProof);
        String serializedRange = mapper.writeValueAsString(proof.getClosedRange());
        _logger.info("Range: " + serializedRange);

        return new JSONObject()
                .put("bsn", citizenInfo.getBsn())
                .put("firstName", citizenInfo.getFirstName())
                .put("lastName", citizenInfo.getFirstName())
                .put("address", citizenInfo.getAddress())
                .put("consent", citizenInfo.getConsent())
                .put("municipalityId", citizenInfo.getMunicipalityId())
                .put("canPay", canPay(citizenInfo.getFine(), citizenInfo.getFinancialSupport()))
                .put("commitment", new JSONObject(serializedCommitment))
                .put("proof", new JSONObject(serializedProof))
                .put("range", new JSONObject(serializedRange));
    }

    /**
     * Converts citizenInfo object into byte array.
     */
    private byte[] objectToByteArray(CitizenInfo citizenInfo) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(citizenInfo);
        oos.flush();
        return bos.toByteArray();
    }

    /**
     * Converts byte array data into citizenInfo object.
     */
    private static CitizenInfo byteArrayToObject(byte[] data) throws IOException, ClassNotFoundException {
        ByteArrayInputStream in = new ByteArrayInputStream(data);
        ObjectInputStream is = new ObjectInputStream(in);
        CitizenInfo obj = (CitizenInfo) is.readObject();
        in.close();
        return obj;
    }

    public static void main(String[] args) {
        System.out.println("OpenSSL avaliable: " + OpenSsl.isAvailable());
        new Chaincode().start(args);
    }
}
