package edu.washu.tag.reporting;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public record TestInstance(TestResult testResult, List<String> parameters) {

    public enum TestResult { PASSED, FAILED, SKIPPED }

    @JsonIgnore
    public String represent(String testName) {
        return testName + serializeParams() + ": " + testResult;
    }

    private String serializeParams() {
        if (parameters.isEmpty()) {
            return "";
        } else {
            return " " + parameters;
        }
    }

}
