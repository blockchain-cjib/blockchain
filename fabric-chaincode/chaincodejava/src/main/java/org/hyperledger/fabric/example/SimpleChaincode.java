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
import com.ing.blockchain.zk.dto.TTPMessage;
import io.netty.handler.ssl.OpenSsl;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.shim.ChaincodeBase;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.json.JSONObject;

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

        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);

        if (!citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s already exists'", bsn));
        }

        TTPMessage message = TTPGenerator.generateTTPMessage(BigInteger.valueOf(financialSupport));
        CitizenInfo citizenInfo = new CitizenInfo(bsn, firstName, lastName, address,
                financialSupport, consent, municipalityId, message);

        try {
            byte[] cit = objectToByteArray(citizenInfo);
            stub.putPrivateData("citizenCollection", bsn, cit);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error " + e);
        }

        return newSuccessResponse("citizen added successfully");
    }

    private Response getCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() < 2 || args.size() > 3) {
            return newErrorResponse("Incorrect number of arguments. Expecting 2-3");
        }
        String bsn = args.get(0);
        String fineAmount = args.get(1);
        String months = args.get(2);

        if (bsn == null) {
            return newErrorResponse("Bsn was not provided");
        }

        if (fineAmount == null) {
            return newErrorResponse("Fine amount was not provided");
        }

        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);
        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        CitizenInfo citizenInfo;
        byte[] citizenInfoByte = stub.getPrivateData("citizenCollection", bsn);
        try {
            citizenInfo = byteArrayToObject(citizenInfoByte);
        } catch (IOException | ClassNotFoundException e) {
            return newErrorResponse("Conversion Error " + e);
        }

        Integer financialSupport = citizenInfo.getFinancialSupport();
        _logger.info(String.format("Query Response:\nBSN: %s, financialSupport: %s\n", bsn, financialSupport));

        TTPMessage ttpMessage = citizenInfo.getTtpMessage();
        BoudotRangeProof rangeProof = RangeProof
                .calculateRangeProof(ttpMessage, ClosedRange.of("0", financialSupport.toString()));

        ObjectMapper mapper = new ObjectMapper();
        String serializedCommitment;
        String serializedProof;
        try {
            serializedCommitment = mapper.writeValueAsString(citizenInfo.getTtpMessage());
            _logger.info("Proof: " + serializedCommitment);
            serializedProof = mapper.writeValueAsString(rangeProof);
            _logger.info("Proof: " + serializedProof);
        } catch (JsonProcessingException e) {
            return newErrorResponse(e);
        }

        String response = new JSONObject()
                .put("bsn", citizenInfo.getBsn())
                .put("firstName", citizenInfo.getFirstName())
                .put("lastName", citizenInfo.getFirstName())
                .put("address", citizenInfo.getAddress())
                .put("financialSupport", citizenInfo.getFinancialSupport())
                .put("consent", citizenInfo.getConsent())
                .put("municipalityId", citizenInfo.getMunicipalityId())
                .put("commitment", serializedCommitment)
                .put("proof", serializedProof).toString();
        _logger.info(response);

        return newSuccessResponse("success", ByteString.copyFrom(response, UTF_8).toByteArray());
    }

    private Response deleteCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() != 1) {
            return newErrorResponse("Incorrect number of arguments. Expecting 1");
        }

        String bsn = args.get(0);
        if (bsn.length() <= 0) {
            return newErrorResponse("1st argument (BSN) must be a non-empty string");
        }

        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);

        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        CitizenInfo citizenInfo = new CitizenInfo();
        byte[] citizenInfoByte = stub.getPrivateData("citizenCollection", bsn);
        try {
            citizenInfo = byteArrayToObject(citizenInfoByte);
        } catch (IOException | ClassNotFoundException e) {
            return newErrorResponse("Conversion Error " + e);
        }

        //stub.delState(bsn);
        stub.delPrivateData("citizenCollection", bsn);

        _logger.info(String.format("citizen deleted with bsn number: %s", bsn));
        return newSuccessResponse();
    }

    private Response updateCitizen(ChaincodeStub stub, List<String> args) {
        if (args.size() != 2) {
            return newErrorResponse("Incorrect number of arguments. Expecting 2");
        }

        String bsn = args.get(0);
        if (bsn.length() <= 0) {
            return newErrorResponse("1st argument (BSN) must be a non-empty string");
        }

        String citizenInfoStr = stub.getPrivateDataUTF8("citizenCollection", bsn);

        if (citizenInfoStr.equals("")) {
            return newErrorResponse(String.format("Citizen with BSN %s does not exist'", bsn));
        }

        CitizenInfo citizenInfo = new CitizenInfo();
        byte[] citizenInfoByte = stub.getPrivateData("citizenCollection", bsn);
        try {
            citizenInfo = byteArrayToObject(citizenInfoByte);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error");
        } catch (ClassNotFoundException e) {
            return newErrorResponse("Class not found");
        }

        Integer newFinancialSupport = Integer.parseInt(args.get(1));
        //here change the financial support value of citizen object
        citizenInfo.setFinancialSupport(newFinancialSupport);

        _logger.info(String.format("new financialSupport of citizen: %s", newFinancialSupport));

        try {
            byte[] cit = objectToByteArray(citizenInfo);
            stub.putPrivateData("citizenCollection", bsn, cit);
        } catch (IOException e) {
            return newErrorResponse("Conversion Error");
        }

        _logger.info("Update complete");

        return newSuccessResponse("update finished successfully", ByteString.copyFrom(bsn + ": " + newFinancialSupport, UTF_8).toByteArray());

    }

    private byte[] objectToByteArray(CitizenInfo citizenInfo) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(citizenInfo);
        oos.flush();
        return bos.toByteArray();
    }

    public static CitizenInfo byteArrayToObject(byte[] data) throws IOException, ClassNotFoundException {
        ByteArrayInputStream in = new ByteArrayInputStream(data);
        ObjectInputStream is = new ObjectInputStream(in);
        CitizenInfo obj = (CitizenInfo) is.readObject();
        in.close();
        return obj;
    }

    public static void main(String[] args) {
        System.out.println("OpenSSL avaliable: " + OpenSsl.isAvailable());
        new SimpleChaincode().start(args);
    }
}
