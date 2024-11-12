package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.Segment;
import edu.washu.tag.hl7.v2.GenerationContext;
import java.io.IOException;

public abstract class SegmentGenerator<T extends Segment> {

    protected abstract void generateSegment(GenerationContext generationContext, T baseSegment)
        throws HL7Exception, IOException;

    public void generate(GenerationContext generationContext, T baseSegment)
        throws HL7Exception, IOException {
        generateSegment(generationContext, baseSegment);
        generationContext.getSegments().add(baseSegment);
    }

}
