package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.v281.datatype.CWE;
import ca.uhn.hl7v2.model.v281.segment.OBR;
import ca.uhn.hl7v2.model.v281.segment.ORC;
import ca.uhn.hl7v2.util.DeepCopy;
import ca.uhn.hl7v2.util.Terser;
import edu.washu.tag.hl7.v2.GenerationContext;
import edu.washu.tag.hl7.v2.GeneratorConstants;
import edu.washu.tag.hl7.v2.model.AbcEncoder;
import edu.washu.tag.hl7.v2.model.Person;
import edu.washu.tag.util.RandomGenUtils;
import edu.washu.tag.util.TimeUtils;
import java.io.IOException;

public class ObrGenerator extends SegmentGenerator<OBR> {

    private static final Person radiologist = new Person()
        .setPersonIdentifier("D" + RandomGenUtils.randomId())
        .setFamilyName("DOC")
        .setGivenName("THAT")
        .setSecondNameEtc("Q")
        .setAssigningAuthority(AbcEncoder.assigningAuthority);
    
    @Override
    public void generateSegment(GenerationContext generationContext, OBR baseSegment)
        throws HL7Exception, IOException {
        final ORC orcSegment = generationContext.lookupSegment(ORC.class);
        baseSegment.getObr1_SetIDOBR().setValue("1");
        DeepCopy.copy(orcSegment.getOrc2_PlacerOrderNumber(), baseSegment.getObr2_PlacerOrderNumber());
        DeepCopy.copy(orcSegment.getOrc3_FillerOrderNumber(), baseSegment.getObr3_FillerOrderNumber());

        final CWE universalServiceIdentifier = baseSegment.getObr4_UniversalServiceIdentifier();
        universalServiceIdentifier.getCwe1_Identifier().setValue("IMG5595");
        universalServiceIdentifier.getCwe2_Text().setValue("XR CHEST 1 VIEW");
        universalServiceIdentifier.getCwe3_NameOfCodingSystem().setValue("RISPACS");
        universalServiceIdentifier.getCwe5_AlternateText().setValue("XR CHEST 1 VW");
        
        baseSegment.getObr5_DeliverToLocation().setValue("O");
        baseSegment.getObr6_DeliverToLocationNumber2().setValue(TimeUtils.hl7DatetimeNow());
        baseSegment.getObr11_SpecimenActionCode().setValue("Hosp Perf");

        final Terser terser = new Terser(baseSegment.getMessage());
        terser.set("/.OBR-15-4", "BODY");
        terser.set("/.OBR-15(1)-4", "CHEST");

        DeepCopy.copy(orcSegment.getOrc12_OrderingProvider(0), baseSegment.getObr16_OrderingProvider(0));
        baseSegment.getObr17_OrderCallbackPhoneNumber(0).getXtn1_TelephoneNumber().setValue("(555)555-5555");
        baseSegment.getObr18_PlacerField1().setValue("CHEST");

        baseSegment.getObr19_PlacerField2().setValue(GeneratorConstants.MAIN_HOSPITAL + " RAD DX");
        terser.set("/.OBR-19-4", GeneratorConstants.MAIN_HOSPITAL);

        baseSegment.getObr20_FillerField1().setValue("GEXR5");
        baseSegment.getObr22_ResultsRptStatusChngDateTime().setValue(TimeUtils.hl7DatetimeNow());
        baseSegment.getObr24_DiagnosticServSectID().setValue("CR");
        baseSegment.getObr25_ResultStatus().setValue(generationContext.getMessageRequirements().getOrcStatus());

        DeepCopy.copy(orcSegment.getOrc7_DeliverToLocation(0), baseSegment.getObr27_DeliverToLocationNumber5(0));
        baseSegment.getObr31_ReasonForStudy(0).getCwe2_Text().setValue(generationContext.getMessageRequirements().getReasonForStudy());

        final NameEncoder nameEncoder = new NameEncoder(baseSegment, generationContext.getMessageRequirements().isMalformObrInterpretersAndTech());
        nameEncoder.encodeAssistantResultInterpreter(1, radiologist.getPersonIdentifier());
        nameEncoder.encodeAssistantResultInterpreter(2, radiologist.getFamilyName().getSurname());
        nameEncoder.encodeAssistantResultInterpreter(3, radiologist.getGivenName());
        nameEncoder.encodeAssistantResultInterpreter(4, radiologist.getSecondNameEtc());
        nameEncoder.encodeAssistantResultInterpreter(9, radiologist.getAssigningAuthority().getNamespaceId());
        if (generationContext.getMessageRequirements().isMalformObrInterpretersAndTech()) {
            nameEncoder.encodeAssistantResultInterpreter(13, "HOSP");
        }
        generationContext.setInterpreter(radiologist);

        final Person tech = generationContext.getTechnician();
        nameEncoder.encodeTechnician(1, tech.getPersonIdentifier());
        nameEncoder.encodeTechnician(2, tech.getFamilyName().getSurname());
        nameEncoder.encodeTechnician(3, tech.getGivenName());

        baseSegment.getObr36_ScheduledDateTime().setValue(TimeUtils.hl7DatetimeNow());
        DeepCopy.copy(universalServiceIdentifier, baseSegment.getObr44_ProcedureCode());
    }

    private class NameEncoder {
        private final OBR obr;
        private final boolean malform;

        private NameEncoder(OBR obr, boolean malform) {
            this.obr = obr;
            this.malform = malform;
        }

        private void encodeValue(int fieldId, int componentId, int subcomponentId, String value)
            throws HL7Exception {
            Terser.set(obr, fieldId, 0, componentId, subcomponentId, value);
        }

        private void encodeValue(int fieldId, int pieceId, String value) throws HL7Exception {
            encodeValue(
                fieldId,
                malform ? pieceId : 1,
                malform ? 1 : pieceId,
                value
            );
        }

        private void encodeAssistantResultInterpreter(int pieceId, String value) throws HL7Exception {
            encodeValue(33, pieceId, value);
        }

        private void encodeTechnician(int pieceId, String value) throws HL7Exception {
            encodeValue(34, pieceId, value);
        }
    }

}
