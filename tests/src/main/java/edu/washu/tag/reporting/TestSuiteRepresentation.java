package edu.washu.tag.reporting;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import java.util.stream.Collectors;

public record TestSuiteRepresentation(int executorId, List<TestClassRepresentation> testClasses) {

    @Override
    public String toString() {
        return testClasses
                .stream()
                .map(TestClassRepresentation::toString)
                .collect(Collectors.joining("\n\n"));
    }

    @JsonIgnore
    public int countTestInstances(TestInstance.TestResult testResult) {
        int testCount = 0;
        for (TestClassRepresentation classRepresentation : testClasses) {
            for (TestRepresentation testRepresentation : classRepresentation.tests()) {
                for (TestInstance testInstance : testRepresentation.testResults()) {
                    if (testInstance.testResult() == testResult) {
                        testCount++;
                    }
                }
            }
        }
        return testCount;
    }

}
