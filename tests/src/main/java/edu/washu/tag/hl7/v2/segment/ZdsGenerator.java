package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.AbstractGroup;
import ca.uhn.hl7v2.model.GenericSegment;
import ca.uhn.hl7v2.model.v281.message.ORU_R01;
import ca.uhn.hl7v2.util.Terser;
import edu.washu.tag.hl7.v2.GenerationContext;
import org.dcm4che3.util.UIDUtils;

public class ZdsGenerator extends NonstandardSegmentGenerator<ORU_R01> {

    @Override
    public String getSegmentName() {
        return "ZDS";
    }

    @Override
    protected void generateSegment(GenerationContext generationContext, GenericSegment baseSegment)
        throws HL7Exception {

        Terser.set(baseSegment, 1, 0, 1, 1, UIDUtils.createUID());
        Terser.set(baseSegment, 1, 0, 2, 1, "EPIC");
        Terser.set(baseSegment, 1, 0, 3, 1, "APPLICATION");
        Terser.set(baseSegment, 1, 0, 4, 1, "DICOM");
    }

    @Override
    public AbstractGroup positionForSegment(ORU_R01 baseMessage) {
        return baseMessage.getPATIENT_RESULT().getORDER_OBSERVATION();
    }

}
