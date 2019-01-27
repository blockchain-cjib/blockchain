package org.hyperledger.fabric.example;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.lang.reflect.InvocationTargetException;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CitizenInfoTest {
    CitizenInfo ci;
    @BeforeEach
    public void setup(){
        ci = new CitizenInfo(
                "1",
                "firstName",
                "lastName",
                "address",
                100,
                500,
                true,
                1);
    }

    @ParameterizedTest
    @MethodSource("getters")
    public void testGetters(String methodName, Object expected){
        java.lang.reflect.Method method = null;

        try {
            method = ci.getClass().getMethod(methodName);
        } catch (SecurityException e) {}
        catch (NoSuchMethodException e) {}

        Object output = null;
        try {
            output = method.invoke(ci);
        } catch (IllegalArgumentException e) {}
        catch (IllegalAccessException e) {}
        catch (InvocationTargetException e) {}

        assertEquals(expected, output);
    }

    static Stream<Arguments> getters(){
        return Stream.of(
                Arguments.of("getBsn","1"),
                Arguments.of("getFirstName", "firstName"),
                Arguments.of("getLastName", "lastName"),
                Arguments.of("getAddress", "address"),
                Arguments.of("getFinancialSupport",100),
                Arguments.of("getFine", 500),
                Arguments.of("getConsent", true),
                Arguments.of("getMunicipalityId", 1)
        );
    }

    @ParameterizedTest
    @MethodSource("setters")
    public void testSetters(String setter, String getter, Object expected, Class c){
        java.lang.reflect.Method setterMethod = null;
        java.lang.reflect.Method getterMethod = null;
        try {
            setterMethod = ci.getClass().getMethod(setter, c);
            getterMethod = ci.getClass().getMethod(getter);
        } catch (SecurityException e) {}
        catch (NoSuchMethodException e) {}

        Object output = null;
        try {
            setterMethod.invoke(ci, expected);
            output = getterMethod.invoke(ci);
        } catch (IllegalArgumentException e) {}
        catch (IllegalAccessException e) {}
        catch (InvocationTargetException e) {}

        assertEquals(expected, output);
    }

    static Stream<Arguments> setters(){
        return Stream.of(
                Arguments.of("setBsn", "getBsn","2", String.class),
                Arguments.of("setFirstName", "getFirstName", "T", String.class),
                Arguments.of("setLastName", "getLastName", "P", String.class),
                Arguments.of("setAddress", "getAddress", "Street", String.class),
                Arguments.of("setFinancialSupport", "getFinancialSupport",1, Integer.class),
                Arguments.of("setFine", "getFine", 2, Integer.class),
                Arguments.of("setConsent", "getConsent", true, Boolean.class),
                Arguments.of("setMunicipalityId", "getMunicipalityId", 666, Integer.class)
        );

    }

}
