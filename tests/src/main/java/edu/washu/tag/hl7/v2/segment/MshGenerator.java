package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.segment.MSH;
import edu.washu.tag.hl7.v2.GenerationContext;
import edu.washu.tag.util.TimeUtils;
import java.io.IOException;

public class MshGenerator extends SegmentGenerator<MSH> {

    @Override
    public void generateSegment(GenerationContext generationContext, MSH msh) throws DataTypeException, IOException {
        msh.getMsh1_FieldSeparator().setValue("|");
        msh.getMsh2_EncodingCharacters().setValue("^~\\&");
        msh.getMsh3_SendingApplication().getHd1_NamespaceID().setValue("SOMERIS");
        msh.getMsh4_SendingFacility().getHd1_NamespaceID().setValue("ABCHOSP");
        msh.getMsh5_ReceivingApplication().getHd1_NamespaceID().setValue("SOMEAPP");
        msh.getMsh6_ReceivingFacility().getHd1_NamespaceID().setValue("ABC_HOSP_DEPT_X");
        msh.getMsh7_DateTimeOfMessage().setValue(TimeUtils.hl7DatetimeNow());
        msh.getMsh8_Security().setValue("TBD");
        msh.getMsh10_MessageControlID().setValue(generationContext.getHapiContext().getParserConfiguration().getIdGenerator().getID());
    }

}
