package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.XAD;
import ca.uhn.hl7v2.model.v281.datatype.XTN;
import ca.uhn.hl7v2.model.v281.segment.PID;
import edu.washu.tag.hl7.v2.GenerationContext;
import edu.washu.tag.hl7.v2.MessageRequirements;
import edu.washu.tag.hl7.v2.model.AbcEncoder;
import edu.washu.tag.hl7.v2.model.EpicEncoder;
import edu.washu.tag.hl7.v2.model.PatientIdEncoder;
import edu.washu.tag.hl7.v2.model.Person;
import edu.washu.tag.util.TimeUtils;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import org.apache.commons.lang3.RandomUtils;

public class PidGenerator extends SegmentGenerator<PID> {

    private static final List<PatientIdEncoder> patientIdEncoders = Arrays.asList(
        new EpicEncoder(), new AbcEncoder()
    );

    @Override
    public void generateSegment(GenerationContext generationContext, PID baseSegment) throws DataTypeException {
        final MessageRequirements messageRequirements = generationContext.getMessageRequirements();
        baseSegment.getPid1_SetIDPID().setValue("1");

        for (int i = 0; i < messageRequirements.getNumPatientIds(); i++) {
            patientIdEncoders.get(i).generateAndEncodeId(baseSegment.getPid3_PatientIdentifierList(i));
        }

        final Person patientName = new Person();
        patientName.setFamilyName("SMITH");
        patientName.setGivenName("JOHN");
        patientName.setSecondNameEtc("J");
        patientName.setNameTypeCode("D"); // code for "customary name"

        patientName.toXpn(baseSegment.getPid5_PatientName(0));

        baseSegment.getPid7_DateTimeOfBirth().setValue(
            TimeUtils.toHl7(
                LocalDate.of(1900, 1, 1).plusDays(
                    RandomUtils.nextInt(0, 36525) // 100 years
                )
            )
        );

        baseSegment.getPid8_AdministrativeSex().getCwe1_Identifier().setValue("M");
        if (messageRequirements.isIncludePatientAlias()) {
            baseSegment.getPid9_PatientAlias().setValue("SMITH^JOHN");
        }
        baseSegment.getPid10_Race(0).getCwe1_Identifier().setValue("WHITE");

        final XAD patientAddress = baseSegment.getPid11_PatientAddress(0);
        if (messageRequirements.isSpecifyAddress()) {
            patientAddress.getXad1_StreetAddress().getSad1_StreetOrMailingAddress().setValue("123 STREET");
            patientAddress.getXad3_City().setValue("CITY CITY");
            patientAddress.getXad4_StateOrProvince().setValue("MO");
            patientAddress.getXad5_ZipOrPostalCode().setValue("61111");
            patientAddress.getXad9_CountyParishCode().getCwe1_Identifier().setValue("COUNTY");
        }
        patientAddress.getXad6_Country().setValue("USA");
        patientAddress.getXad7_AddressType().setValue("L");

        if (!messageRequirements.isExtendedPid()) {
            return;
        }

        baseSegment.getPid12_CountyCode().setValue("COUNTY");
        final String phoneNumber = "(555)555-5555";
        final XTN phone1 = baseSegment.getPid13_PhoneNumberHome(0);
        phone1.getXtn1_TelephoneNumber().setValue(phoneNumber);
        phone1.getXtn2_TelecommunicationUseCode().setValue("P");
        phone1.getXtn3_TelecommunicationEquipmentType().setValue("H");
        final XTN phone2 = baseSegment.getPid13_PhoneNumberHome(1);
        phone2.getXtn1_TelephoneNumber().setValue(phoneNumber);
        phone2.getXtn2_TelecommunicationUseCode().setValue("P");
        phone2.getXtn3_TelecommunicationEquipmentType().setValue("M");

        baseSegment.getPid16_MaritalStatus().getCwe1_Identifier().setValue("S");
        baseSegment.getPid19_SSNNumberPatient().setValue("111-11-1111");
        baseSegment.getPid22_EthnicGroup(0).getCwe1_Identifier().setValue("CAU");
    }

}
