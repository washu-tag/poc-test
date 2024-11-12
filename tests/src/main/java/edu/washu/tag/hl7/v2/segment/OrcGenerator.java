package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.v281.datatype.EI;
import ca.uhn.hl7v2.model.v281.datatype.PL;
import ca.uhn.hl7v2.model.v281.segment.ORC;
import ca.uhn.hl7v2.util.Terser;
import edu.washu.tag.hl7.v2.GenerationContext;
import edu.washu.tag.hl7.v2.GeneratorConstants;
import edu.washu.tag.hl7.v2.MessageRequirements;
import edu.washu.tag.hl7.v2.model.AbcEncoder;
import edu.washu.tag.hl7.v2.model.Person;
import edu.washu.tag.util.RandomGenUtils;
import edu.washu.tag.util.TimeUtils;
import java.time.LocalDateTime;

public class OrcGenerator extends SegmentGenerator<ORC> {

    private static final Person enteredBy = new Person()
        .setPersonIdentifier("T" + RandomGenUtils.randomId())
        .setFamilyName("EXAMPLE")
        .setGivenName("PERSON")
        .setSecondNameEtc("O.");
    private static final Person orderingProvider = new Person()
        .setPersonIdentifier("D" + RandomGenUtils.randomId())
        .setFamilyName("HOUNSFIELD")
        .setGivenName("GODFREY")
        .setSecondNameEtc("N")
        .setAssigningAuthority(AbcEncoder.assigningAuthority)
        .setIdentifierTypeCode("HOSP");

    @Override
    public void generateSegment(GenerationContext generationContext, ORC baseSegment)
        throws HL7Exception {
        final MessageRequirements messageRequirements = generationContext.getMessageRequirements();

        baseSegment.getOrc1_OrderControl().setValue("RE"); // "Observations/Performed Service to follow"
        final EI placerOrderNumber = baseSegment.getOrc2_PlacerOrderNumber();
        placerOrderNumber.getEi1_EntityIdentifier().setValue(RandomGenUtils.randomIdStr());
        placerOrderNumber.getEi2_NamespaceID().setValue("SYS");
        baseSegment.getOrc3_FillerOrderNumber().getEi1_EntityIdentifier().setValue(RandomGenUtils.randomIdStr());

        baseSegment.getOrc5_OrderStatus().setValue(messageRequirements.getOrcStatus());

        final LocalDateTime now = LocalDateTime.now();
        final Terser terser = new Terser(baseSegment.getMessage());
        terser.set("/.ORC-7-4", TimeUtils.toHl7(now.minusSeconds(1)));
        terser.set("/.ORC-7-5", TimeUtils.toHl7(now));
        terser.set("/.ORC-7-6", "O");

        baseSegment.getOrc9_DateTimeOfTransaction().setValue(TimeUtils.toHl7(now));

        enteredBy.toXcn(baseSegment.getOrc10_EnteredBy(0));
        generationContext.setTechnician(enteredBy);
        orderingProvider.toXcn(baseSegment.getOrc12_OrderingProvider(0));

        final PL entererLocation = baseSegment.getOrc13_EntererSLocation();
        entererLocation.getPl1_PointOfCare().getHd1_NamespaceID().setValue(GeneratorConstants.MAIN_HOSPITAL + "_R");
        entererLocation.getPl4_Facility().getHd1_NamespaceID().setValue("RS50");
        entererLocation.getPl9_LocationDescription().setValue("RAD5");

        baseSegment.getOrc14_CallBackPhoneNumber(0).getXtn1_TelephoneNumber().setValue("(555)555-5555");
        baseSegment.getOrc29_OrderType().getCwe1_Identifier().setValue("O");
        baseSegment.getOrc30_EntererAuthorizationMode().getCne1_Identifier().setValue("Electr");
    }

}
