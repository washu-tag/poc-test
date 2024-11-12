package edu.washu.tag.hl7.v2.segment;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.PL;
import ca.uhn.hl7v2.model.v281.segment.PV1;
import edu.washu.tag.hl7.v2.GenerationContext;
import edu.washu.tag.hl7.v2.model.AbcEncoder;
import edu.washu.tag.hl7.v2.model.Person;
import edu.washu.tag.util.RandomGenUtils;
import edu.washu.tag.util.TimeUtils;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Pv1Generator extends SegmentGenerator<PV1> {

    private static final String HOSP = "HOSP";
    private static final List<Person> availableAttendingDoctors = generateAttending();

    @Override
    public void generateSegment(GenerationContext generationContext, PV1 baseSegment) throws DataTypeException, IOException {
        baseSegment.getPv12_PatientClass().getCwe1_Identifier().setValue("O");
        final PL patientLocation = baseSegment.getPv13_AssignedPatientLocation();
        patientLocation.getPl1_PointOfCare().getHd1_NamespaceID().setValue("ABC RAD5");
        patientLocation.getPl2_Room().getHd1_NamespaceID().setValue("ABC RAD5 R-5005");
        patientLocation.getPl3_Bed().getHd1_NamespaceID().setValue("ABC RAD5 R-5005");
        patientLocation.getPl4_Facility().getHd1_NamespaceID().setValue("ABC");

        for (int i = 0; i < generationContext.getMessageRequirements().getNumAttendingDoctors(); i++) {
            availableAttendingDoctors.get(i).toXcn(baseSegment.getPv17_AttendingDoctor(i));
        }

        baseSegment.getPv110_HospitalService().getCwe1_Identifier().setValue("RAD");
        baseSegment.getPv119_VisitNumber().getCx1_IDNumber().setValue("V" + RandomGenUtils.randomId(8));
        baseSegment.getPv144_AdmitDateTime().setValue(TimeUtils.hl7DatetimeNow());
        baseSegment.getPv151_VisitIndicator().getCwe1_Identifier().setValue("V");
    }

    private static List<Person> generateAttending() {
        final Person doctor1 = new Person();
        doctor1.setPersonIdentifier("D" + RandomGenUtils.randomId());
        doctor1.setFamilyName("CURIE");
        doctor1.setGivenName("MARIE");
        doctor1.setSecondNameEtc("S");
        doctor1.setAssigningAuthority(AbcEncoder.assigningAuthority);
        doctor1.setIdentifierTypeCode(HOSP);

        final Person doctor2 = new Person();
        doctor2.setPersonIdentifier("D" + RandomGenUtils.randomId());
        doctor2.setFamilyName("ROENTGEN");
        doctor2.setGivenName("WILHELM");
        doctor2.setSecondNameEtc("CONRAD");
        doctor2.setAssigningAuthority(AbcEncoder.assigningAuthority);
        doctor2.setIdentifierTypeCode(HOSP);

        return Arrays.asList(doctor1, doctor2);
    }

}
