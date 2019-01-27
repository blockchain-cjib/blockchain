package org.hyperledger.fabric.example;

import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.Chaincode.*;
import org.hyperledger.fabric.shim.Chaincode.Response.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class ChaincodeTest {
    @Mock
    ChaincodeStub ccs = mock(ChaincodeStub.class);
    Chaincode cc = new Chaincode();

    @Test
    public void initTest(){
        Response r = cc.init(ccs);
        assertEquals(r.getMessage(), null);
        assertEquals(r.getStatus(), Status.SUCCESS);
    }

    @Test
    public void invokeFailureTest(){
        when(ccs.getFunction()).thenReturn("modifyCitizen");
        when(ccs.getParameters()).thenReturn(new ArrayList<String>());
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Invalid invoke function name. Expecting one of: [\"setCitizen\", " +
                "\"getCitizenMun\", \"getCitizenCJIB\", \"updateCitizen\", \"deleteCitizen\"]");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void setCitizenTest_IncorrectNumberOfArguments(){
        when(ccs.getFunction()).thenReturn("setCitizen");
        ArrayList<String> citizen = new ArrayList<String>() {
            {add("1"); add("FirstName"); add("LastName"); add("Adress"); add("100"); add("50"); add("True"); add("1"); add("2");}};
        when(ccs.getParameters()).thenReturn(citizen);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Incorrect number of arguments. Expecting 8");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @ParameterizedTest
    @MethodSource("generateErrors")
    public void setCitizenTest_nullArguments(int i, String errorMessage){
        when(ccs.getFunction()).thenReturn("setCitizen");
        ArrayList<String> citizen = new ArrayList<String>() {
            {add("1"); add("FirstName"); add("LastName"); add("Adress"); add("100"); add("50"); add("True"); add("1");}};
        citizen.set(i, "");
        when(ccs.getParameters()).thenReturn(citizen);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), errorMessage);
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    static Stream<Arguments> generateErrors(){
        return Stream.of(
                Arguments.of(0,"1st argument (BSN) must be a non-empty string"),
                Arguments.of(1,"First Name was not provided"),
                Arguments.of(2,"Last Name was not provided"),
                Arguments.of(3,"Address was not provided"),
                Arguments.of(4,"Financial Support was not provided"),
                Arguments.of(5,"Fine amount was not provided"),
                Arguments.of(6,"Consent was not provided"),
                Arguments.of(7,"Municipality Id was not provided")
        );
    }

    @Test
    public void setCitizenTest_citizenAlreadyExists(){
        when(ccs.getFunction()).thenReturn("setCitizen");
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("1");
        ArrayList<String> citizen = new ArrayList<String>() {
            {add("1"); add("FirstName"); add("LastName"); add("Adress"); add("100"); add("50"); add("True"); add("1");}};
        when(ccs.getParameters()).thenReturn(citizen);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Citizen with BSN 1 already exists'");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void setCitizenTest_Success(){
        when(ccs.getFunction()).thenReturn("setCitizen");
        ArrayList<String> citizen = new ArrayList<String>() {
            {add("1"); add("FirstName"); add("LastName"); add("Adress"); add("100"); add("50"); add("True"); add("1");}};
        when(ccs.getParameters()).thenReturn(citizen);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("");
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "citizen added successfully");
        assertEquals(r.getStatus(), Status.SUCCESS);
        Mockito.verify(ccs, times(1)).getParameters();
        Mockito.verify(ccs, times(1)).getPrivateDataUTF8(anyString(), anyString());
    }
    static Stream<Arguments> funcs(){
        return Stream.of(
                Arguments.of("getCitizenMun"),
                Arguments.of("getCitizenCJIB")
        );
    }
    @ParameterizedTest
    @MethodSource("funcs")
    public void getCitizenTest_WrongArgumentNumber(String func){
        when(ccs.getFunction()).thenReturn(func);
        ArrayList<String> args = new ArrayList<String>(){
            {add("1"); add("1"); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Incorrect number of arguments. Expecting 1 or 2");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @ParameterizedTest
    @MethodSource("funcs")
    public void getCitizenTest_BSNnull(String func){
        when(ccs.getFunction()).thenReturn(func);
        ArrayList<String> args = new ArrayList<String>(){
            {add(""); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "1st argument (BSN) must be a non-empty string");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @ParameterizedTest
    @MethodSource("funcs")
    public void getCitizenTest_NonExistentCitizen(String func){
        when(ccs.getFunction()).thenReturn(func);
        ArrayList<String> args = new ArrayList<String>(){
            {add("1"); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("");
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Error 404: Citizen with BSN 1 does not exist'");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @ParameterizedTest
    @MethodSource("funcs")
    public void getCitizenTest_PrivateDataFailure(String func){
        when(ccs.getFunction()).thenReturn(func);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("1");
        ArrayList<String> args = new ArrayList<String>(){
            {add("1"); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        CitizenInfo ci = new CitizenInfo();
        byte[] ci_byte = null;
        try{
            ci_byte = objectToByteArray(ci);
        }catch(Exception e){

        }
        ci_byte[1] = 101;
        when(ccs.getPrivateData(anyString(), anyString())).thenReturn(ci_byte);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Conversion Error java.io.StreamCorruptedException: invalid stream header: AC650005");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    private byte[] objectToByteArray(CitizenInfo citizenInfo) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(citizenInfo);
        oos.flush();
        return bos.toByteArray();
    }

    @ParameterizedTest
    @MethodSource("funcs")
    public void getCitizenTest_Success(String func){
        when(ccs.getFunction()).thenReturn(func);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("1");
        ArrayList<String> args = new ArrayList<String>(){
            {add("1"); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        CitizenInfo ci = new CitizenInfo("1","firstName", "lastName", "address", 100, 500, true, 1);
        byte[] ci_byte = null;
        try{
            ci_byte = objectToByteArray(ci);
        }catch(Exception e){

        }
        when(ccs.getPrivateData(anyString(), anyString())).thenReturn(ci_byte);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "success");
        assertEquals(r.getStatus(), Status.SUCCESS);
    }
    @Test
    public void deleteCitizenTest_IncorrectArgumentSize(){
        when(ccs.getFunction()).thenReturn("deleteCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("1"); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Incorrect number of arguments. Expecting 1");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void deleteCitizenTest_wrongBSN(){
        when(ccs.getFunction()).thenReturn("deleteCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("");}
        };
        when(ccs.getParameters()).thenReturn(args);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "1st argument (BSN) must be a non-empty string");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void deleteCitizenTest_NonExistentCitizen(){
        when(ccs.getFunction()).thenReturn("deleteCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("2");}
        };
        when(ccs.getParameters()).thenReturn(args);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("");
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Error 404: Citizen with BSN 2 does not exist'");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void deleteCitizenTest_Success(){
        when(ccs.getFunction()).thenReturn("deleteCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("2");}
        };
        when(ccs.getParameters()).thenReturn(args);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("2");
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), null);
        assertEquals(r.getStatus(), Status.SUCCESS);
        Mockito.verify(ccs, times(1)).delPrivateData(anyString(), anyString());
    }

    @Test
    public void updateCitizenTest_IncorrectArgumentSize(){
        when(ccs.getFunction()).thenReturn("updateCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Incorrect number of arguments. Expecting 2");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void updateCitizenTest_wrongBSN(){
        when(ccs.getFunction()).thenReturn("updateCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add(""); add("1");}
        };
        when(ccs.getParameters()).thenReturn(args);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "1st argument (BSN) must be a non-empty string");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void updateCitizenTest_NonExistentCitizen(){
        when(ccs.getFunction()).thenReturn("updateCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("2"); add("2");}
        };
        when(ccs.getParameters()).thenReturn(args);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("");
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Error 404: Citizen with BSN 2 does not exist'");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    @Test
    public void updateCitizenTest_ConversionError(){
        when(ccs.getFunction()).thenReturn("updateCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("2"); add("2");}
        };
        when(ccs.getParameters()).thenReturn(args);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("2");
        byte[] ci_byte = null;
        CitizenInfo ci = new CitizenInfo("1","firstName", "lastName", "address", 100, 500, true, 1);
        try{
            ci_byte = objectToByteArray(ci);
        }catch(Exception e){

        }
        ci_byte[1] = 101;
        when(ccs.getPrivateData(anyString(), anyString())).thenReturn(ci_byte);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), "Conversion Error");
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }
    @Test
    public void updateCitizenTest_Success(){
        when(ccs.getFunction()).thenReturn("deleteCitizen");
        ArrayList<String> args = new ArrayList<String>(){
            {add("2");}
        };
        when(ccs.getParameters()).thenReturn(args);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("2");

        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), null);
        assertEquals(r.getStatus(), Status.SUCCESS);
        Mockito.verify(ccs, times(1)).delPrivateData(anyString(), anyString());
    }
}
