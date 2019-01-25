package org.hyperledger.fabric.example;


import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.Chaincode.*;
import org.hyperledger.fabric.shim.Chaincode.Response.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.AdditionalMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyByte;
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
        citizen.set(i, null);
        when(ccs.getParameters()).thenReturn(citizen);
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), errorMessage);
        assertEquals(r.getStatus(), Status.INTERNAL_SERVER_ERROR);
    }

    static Stream<Arguments> generateErrors(){
        return Stream.of(
                Arguments.of(0,"Bsn was not provided"),
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
    public void setCitizenTest_PrivateDataFailure(){
        when(ccs.getFunction()).thenReturn("setCitizen");
        doThrow(IllegalStateException.class).when(ccs).putPrivateData(anyString(), anyString(), Mockito.any(byte[].class));
        ArrayList<String> citizen = new ArrayList<String>() {
            {add("1"); add("FirstName"); add("LastName"); add("Adress"); add("100"); add("50"); add("True"); add("1");}};
        when(ccs.getParameters()).thenReturn(citizen);
        when(ccs.getPrivateDataUTF8(anyString(), anyString())).thenReturn("");
        Response r = cc.invoke(ccs);
        assertEquals(r.getMessage(), null);
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
}
