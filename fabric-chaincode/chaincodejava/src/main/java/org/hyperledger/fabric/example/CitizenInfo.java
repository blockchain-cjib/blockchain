package org.hyperledger.fabric.example;

import com.ing.blockchain.zk.dto.BoudotRangeProof;
import com.ing.blockchain.zk.dto.ClosedRange;
import com.ing.blockchain.zk.dto.Commitment;
import com.ing.blockchain.zk.dto.TTPMessage;

import java.io.Serializable;

public class CitizenInfo implements Serializable {
    private String bsn;
    private String firstName;
    private String lastName;
    private String address;
    private Integer financialSupport;
    private Integer fine;
    private Boolean consent;
    private Integer municipalityId;
    private Boolean canPay;
    private Commitment commitment;
    private BoudotRangeProof boudotRangeProof;
    private ClosedRange closedRange;

    public CitizenInfo() {
    }

    public CitizenInfo(String bsn, String firstName,
                       String lastName, String address,
                       Integer financialSupport, Integer fine, Boolean consent,
                       Integer municipalityId) {
        this.bsn = bsn;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.financialSupport = financialSupport;
        this.fine = fine;
        this.consent = consent;
        this.municipalityId = municipalityId;
    }

    public String getBsn() {
        return bsn;
    }

    public void setBsn(String bsn) {
        this.bsn = bsn;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getFinancialSupport() {
        return financialSupport;
    }

    public void setFinancialSupport(Integer financialSupport) {
        this.financialSupport = financialSupport;
    }

    public Integer getFine() {
        return fine;
    }

    public void setFine(Integer fine) {
        this.fine = fine;
    }

    public Boolean getConsent() {
        return consent;
    }

    public void setConsent(Boolean consent) {
        this.consent = consent;
    }

    public Integer getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Integer municipalityId) {
        this.municipalityId = municipalityId;
    }

    @Override
    public String toString() {
        return "CitizenInfo: " + this.bsn;
    }
}
