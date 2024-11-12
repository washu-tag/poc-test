package edu.washu.tag.util;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.commons.io.IOUtils;

public class FileIOUtils {

    public static String readResource(String resourceName) {
        try {
            return IOUtils.resourceToString(resourceName, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
