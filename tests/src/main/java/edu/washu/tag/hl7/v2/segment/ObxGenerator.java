package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.v281.datatype.ST;
import ca.uhn.hl7v2.model.v281.segment.OBX;
import ca.uhn.hl7v2.util.Terser;
import edu.washu.tag.hl7.v2.GenerationContext;
import java.io.IOException;

public class ObxGenerator extends SegmentGenerator<OBX> {

    private String setId;
    private final String observationId;
    private final String observationSubId;
    private final String content;

    public ObxGenerator(boolean isImpression, String content) {
        if (!isImpression) {
            observationId = "GDT";
            observationSubId = "1";
        } else {
            observationId = "IMP";
            observationSubId = "2";
        }
        this.content = content;
    }

    public ObxGenerator setSetId(int index) {
        setId = String.valueOf(index + 2);
        return this;
    }

    @Override
    public void generateSegment(GenerationContext generationContext, OBX baseSegment)
        throws HL7Exception, IOException {
        baseSegment.getObx1_SetIDOBX().setValue(setId);
        baseSegment.getObx2_ValueType().setValue("ST");
        Terser.set(baseSegment, 3, 0, 1, 2, observationId);
        baseSegment.getObx4_ObservationSubID().setValue(observationSubId);
        final ST st = new ST(baseSegment.getMessage());
        st.setValue(content);
        baseSegment.getObx5_ObservationValue(0).setData(st);
        baseSegment.getObx11_ObservationResultStatus().setValue(generationContext.getMessageRequirements().getOrcStatus()); // is this what we want?
        generationContext.getTechnician().toXcn(baseSegment.getObx16_ResponsibleObserver(0));
    }

}
