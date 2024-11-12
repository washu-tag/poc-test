package edu.washu.tag.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TimeUtils {

    public static final DateTimeFormatter HL7_FORMATTER_DATETIME = DateTimeFormatter.ofPattern("uuuuMMddHHmmss");
    public static final DateTimeFormatter HL7_FORMATTER_DATE = DateTimeFormatter.ofPattern("uuuuMMdd");

    public static String toHl7(LocalDateTime timestamp) {
        return HL7_FORMATTER_DATETIME.format(timestamp);
    }

    public static String toHl7(LocalDate timestamp) {
        return HL7_FORMATTER_DATE.format(timestamp);
    }

    public static String hl7DatetimeNow() {
        return toHl7(LocalDateTime.now());
    }

}
