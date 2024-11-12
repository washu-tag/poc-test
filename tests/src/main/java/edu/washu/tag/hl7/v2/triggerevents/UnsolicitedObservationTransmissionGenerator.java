package edu.washu.tag.hl7.v2.triggerevents;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.v281.group.ORU_R01_PATIENT;
import ca.uhn.hl7v2.model.v281.message.ORU_R01;
import ca.uhn.hl7v2.model.v281.segment.MSH;
import edu.washu.tag.hl7.v2.GenerationContext;
import edu.washu.tag.hl7.v2.GeneratorConstants;
import edu.washu.tag.hl7.v2.MessageRequirements;
import edu.washu.tag.hl7.v2.model.Person;
import edu.washu.tag.hl7.v2.segment.MshGenerator;
import edu.washu.tag.hl7.v2.segment.ObrGenerator;
import edu.washu.tag.hl7.v2.segment.ObxGenerator;
import edu.washu.tag.hl7.v2.segment.OrcGenerator;
import edu.washu.tag.hl7.v2.segment.PidGenerator;
import edu.washu.tag.hl7.v2.segment.Pv1Generator;
import edu.washu.tag.hl7.v2.segment.ZdsGenerator;
import edu.washu.tag.hl7.v2.segment.ZpfGenerator;
import edu.washu.tag.util.FileIOUtils;
import edu.washu.tag.util.RandomGenUtils;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class UnsolicitedObservationTransmissionGenerator extends MessageGenerator<ORU_R01> {

    private static final String SAMPLE_READ = FileIOUtils.readResource("/sample_read.txt");
    private static final List<String> abnormalities = Arrays.asList(
        "arterial wall calcification",
        "pericardial effusion",
        "emphysema",
        "atelectasis",
        "lung nodules",
        "pleural effusion",
        "peribronchial thickening",
        "bronchiectasis"
    );
    private static final int LINE_LENGTH_WRAP = 70;

    @Override
    public ORU_R01 generateMessage(HapiContext hapiContext, MessageRequirements messageRequirements)
        throws HL7Exception, IOException {
        final ORU_R01 radReport = hapiContext.newMessage(ORU_R01.class);
        final GenerationContext generationContext = new GenerationContext(hapiContext, radReport, messageRequirements);

        final MSH msh = radReport.getMSH();
        new MshGenerator().generate(generationContext, msh);
        msh.getMsh9_MessageType().getMessageCode().setValue("ORU");
        msh.getMsh9_MessageType().getTriggerEvent().setValue("R01"); // intentionally skipping MSH-9.3
        msh.getMsh11_ProcessingID().getPt1_ProcessingID().setValue("P");
        msh.getMsh12_VersionID().getVid1_VersionID().setValue("2.7");

        final ORU_R01_PATIENT patientObj = radReport.getPATIENT_RESULT().getPATIENT();
        new PidGenerator().generate(generationContext, patientObj.getPID());
        new Pv1Generator().generate(generationContext, patientObj.getVISIT().getPV1());
        new OrcGenerator().generate(generationContext, radReport.getPATIENT_RESULT()
            .getORDER_OBSERVATION().getCOMMON_ORDER().getORC());
        new ObrGenerator().generate(generationContext, radReport.getPATIENT_RESULT()
            .getORDER_OBSERVATION().getOBR());
        new ZpfGenerator().generateSegment(generationContext);

        final List<ObxGenerator> obxGenerators = new ArrayList<>();
        obxGenerators.add(new ObxGenerator(false, "EXAMINATION: 1 view chest radiograph"));
        obxGenerators.add(new ObxGenerator(false, ""));

        final List<String> randomAbnormalities = RandomGenUtils.randomSubset(abnormalities, 4);
        final String fullReport = addValues(generationContext, randomAbnormalities);

        for (String line : fullReport.split("\n")) {
            for (String splitLine : splitLongLines(line)) {
                obxGenerators.add(new ObxGenerator(true, splitLine));
            }
        }

        for (int i = 0; i < obxGenerators.size(); i++) {
            obxGenerators
                .get(i)
                .setSetId(i)
                .generate(generationContext, radReport.getPATIENT_RESULT().getORDER_OBSERVATION().getOBSERVATION(i)
                    .getOBX());
        }

        new ZdsGenerator().generateSegment(generationContext);

        return radReport;
    }

    private List<String> splitLongLines(String line) {
        return splitLongLines(new ArrayList<>(), line);
    }

    private List<String> splitLongLines(List<String> split, String remainingString) {
        if (remainingString.length() < LINE_LENGTH_WRAP) {
            split.add(remainingString);
            return split;
        }
        final int lastSpace = remainingString.substring(0, LINE_LENGTH_WRAP).lastIndexOf(" ");
        split.add(remainingString.substring(0, lastSpace).trim());
        return splitLongLines(split, remainingString.substring(lastSpace + 1));
    }

    private static String addValues(GenerationContext generationContext,
        List<String> randomAbnormalities) {
        final Person interpreter = generationContext.getInterpreter();
        return SAMPLE_READ
            .replace(GeneratorConstants.ABNORMALITY_1_PLACEHOLDER, randomAbnormalities.get(0))
            .replace(GeneratorConstants.ABNORMALITY_2_PLACEHOLDER, randomAbnormalities.get(1))
            .replace(GeneratorConstants.ABNORMALITY_3_PLACEHOLDER, randomAbnormalities.get(2))
            .replace(GeneratorConstants.ABNORMALITY_4_PLACEHOLDER, randomAbnormalities.get(3))
            .replace(GeneratorConstants.INTERPRETER_PLACEHOLDER, interpreter.getGivenName() + " " + interpreter.getFamilyName().getSurname());
    }

}
