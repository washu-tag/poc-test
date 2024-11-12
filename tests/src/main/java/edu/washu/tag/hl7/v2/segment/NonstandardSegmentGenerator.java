package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.AbstractGroup;
import ca.uhn.hl7v2.model.GenericSegment;
import ca.uhn.hl7v2.model.Message;
import edu.washu.tag.hl7.v2.GenerationContext;
import java.io.IOException;

public abstract class NonstandardSegmentGenerator<T extends Message> extends SegmentGenerator<GenericSegment> {

    public void generateSegment(GenerationContext generationContext)
        throws HL7Exception, IOException {
        final T parentMessage = (T) generationContext.getParentMessage();
        final AbstractGroup position = positionForSegment(parentMessage);
        final String segmentName = getSegmentName();
        position.addNonstandardSegment(segmentName, insertionIndex(position));
        generateSegment(
            generationContext,
            (GenericSegment) position.get(segmentName)
        );
    }

    public int insertionIndex(AbstractGroup position) {
        return position.getNames().length;
    }

    public abstract String getSegmentName();

    public abstract AbstractGroup positionForSegment(T baseMessage);

}
