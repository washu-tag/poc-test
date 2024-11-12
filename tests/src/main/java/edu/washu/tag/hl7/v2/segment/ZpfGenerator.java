package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.AbstractGroup;
import ca.uhn.hl7v2.model.GenericSegment;
import ca.uhn.hl7v2.model.v281.message.ORU_R01;
import ca.uhn.hl7v2.util.Terser;
import edu.washu.tag.hl7.v2.GenerationContext;

public class ZpfGenerator extends NonstandardSegmentGenerator<ORU_R01> {

    @Override
    public String getSegmentName() {
        return "ZPF";
    }

    @Override
    protected void generateSegment(GenerationContext generationContext, GenericSegment baseSegment)
        throws HL7Exception {
        Terser.set(baseSegment, 1, 0, 1, 1, "1");
        Terser.set(baseSegment, 2, 0, 1, 1, "10");
        Terser.set(baseSegment, 2, 0, 2, 1, "IMG XR PROCEDURES");
    }

    @Override
    public AbstractGroup positionForSegment(ORU_R01 baseMessage) {
        return baseMessage.getPATIENT_RESULT().getORDER_OBSERVATION();
    }

    @Override
    public int insertionIndex(AbstractGroup position) {
        return 2;
    }

}
