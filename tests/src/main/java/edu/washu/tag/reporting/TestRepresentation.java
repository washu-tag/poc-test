package edu.washu.tag.reporting;

import java.util.List;
import java.util.stream.Collectors;

public record TestRepresentation(String testName, List<TestInstance> testResults) {

    @Override
    public String toString() {
        return testResults
                .stream()
                .map(testInstance -> "  * " + testInstance.represent(testName))
                .collect(Collectors.joining("\n"));
    }

}
