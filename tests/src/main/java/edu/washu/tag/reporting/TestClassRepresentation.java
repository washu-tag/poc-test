package edu.washu.tag.reporting;

import java.util.List;
import java.util.stream.Collectors;

public record TestClassRepresentation(String testClassName, List<TestRepresentation> tests) {

    @Override
    public String toString() {
        return testClassName + ":\n" + tests
                .stream()
                .map(TestRepresentation::toString)
                .collect(Collectors.joining("\n"));
    }

}
