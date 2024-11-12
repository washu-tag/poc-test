package edu.washu.tag.hl7.v2;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.Message;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class LocalHospitalMessageLogger implements MessageLogger {

    public static final String CR_REPLACEMENT = "<R>";

    @Override
    public String encodeMessages(List<Message> messages) {
        return messages
            .stream()
            .map(this::encodeMessage)
            .collect(Collectors.joining(CR_REPLACEMENT + "\n\r\n"));
    }

    private String encodeMessage(Message message) {
        final List<String> lines = new ArrayList<>();
        lines.add("<SB>");
        try {
            for (String line : message.encode().split("\r")) {
                lines.add(line + CR_REPLACEMENT);
            }
        } catch (HL7Exception e) {
            throw new RuntimeException(e);
        }
        lines.add("<EB>");
        return String.join("\n", lines);
    }

}
