package org.hyperledger.fabric.example;

import com.ing.blockchain.zk.dto.BoudotRangeProof;
import com.ing.blockchain.zk.dto.ClosedRange;
import com.ing.blockchain.zk.dto.Commitment;

public class Proof {
    private Commitment commitment;
    private ClosedRange closedRange;
    private BoudotRangeProof rangeProof;

    Proof(Commitment commitment, ClosedRange closedRange, BoudotRangeProof rangeProof) {
        this.commitment = commitment;
        this.closedRange = closedRange;
        this.rangeProof = rangeProof;
    }

    public Commitment getCommitment() {
        return commitment;
    }

    public ClosedRange getClosedRange() {
        return closedRange;
    }

    public BoudotRangeProof getRangeProof() {
        return rangeProof;
    }
}
