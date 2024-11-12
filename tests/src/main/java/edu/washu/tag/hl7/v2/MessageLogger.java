package edu.washu.tag.hl7.v2;

import ca.uhn.hl7v2.model.Message;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

public interface MessageLogger {

    String encodeMessages(List<Message> messages);

    default File getLogfileFor(List<Message> messages) {
        try {
            return Files.createTempFile("hl7messages", ".log").toFile();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    default void writeToLog(File logFile, List<Message> messages) {
        try {
            Files.writeString(logFile.toPath(), encodeMessages(messages));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    default File writeToLog(List<Message> messages) {
        final File log = getLogfileFor(messages);
        writeToLog(log, messages);
        return log;
    }

}
