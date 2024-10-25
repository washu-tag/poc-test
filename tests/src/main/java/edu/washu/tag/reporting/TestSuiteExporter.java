package edu.washu.tag.reporting;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.washu.tag.TestSettings;
import groovy.lang.Tuple2;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.IReporter;
import org.testng.IResultMap;
import org.testng.ISuite;
import org.testng.ISuiteResult;
import org.testng.ITestContext;
import org.testng.ITestResult;
import org.testng.xml.XmlSuite;

public class TestSuiteExporter implements IReporter {

    private static final Logger log = LoggerFactory.getLogger(TestSuiteExporter.class);

    @Override
    public void generateReport(List<XmlSuite> xmlSuites, List<ISuite> suites, String outputDirectory) {
        final List<TestClassRepresentation> testClasses = new ArrayList<>();

        for (ISuite suite : suites) {
            for (ISuiteResult result : suite.getResults().values()) {
                final ITestContext testContext = result.getTestContext();
                for (Tuple2<IResultMap, TestInstance.TestResult> testSubset : Arrays.asList(
                        new Tuple2<>(testContext.getPassedTests(), TestInstance.TestResult.PASSED),
                        new Tuple2<>(testContext.getFailedTests(), TestInstance.TestResult.FAILED),
                        new Tuple2<>(testContext.getSkippedTests(), TestInstance.TestResult.SKIPPED))) {

                    for (ITestResult testResult : testSubset.getV1().getAllResults()) {
                        final String testClassName = testResult.getTestClass().getName();
                        final String testName = testResult.getName();
                        final TestClassRepresentation testClassRepresentation = testClasses
                                .stream()
                                .filter(rep -> rep.testClassName().equals(testClassName))
                                .findAny()
                                .orElseGet(() -> {
                                    final TestClassRepresentation classRep = new TestClassRepresentation(testClassName, new ArrayList<>());
                                    testClasses.add(classRep);
                                    return classRep;
                                });

                        final TestRepresentation testRepresentation = testClassRepresentation
                                .tests()
                                .stream()
                                .filter(rep -> rep.testName().equals(testName))
                                .findAny()
                                .orElseGet(() -> {
                                    final TestRepresentation testRep = new TestRepresentation(testName, new ArrayList<>());
                                    testClassRepresentation.tests().add(testRep);
                                    return testRep;
                                });

                        testRepresentation.testResults().add(
                                new TestInstance(
                                        testSubset.getV2(),
                                        Arrays.stream(testResult.getParameters())
                                                .map(Object::toString)
                                                .toList()
                                )
                        );
                    }
                }
            }
        }

        final TestSuiteRepresentation suiteRepresentation = new TestSuiteRepresentation(
                TestSettings.EXECUTOR_ID,
                testClasses
        );
        try {
            new ObjectMapper().writeValue(
                    Paths.get(outputDirectory, "test_executions_" + TestSettings.EXECUTOR_ID + ".json").toFile(),
                    suiteRepresentation
            );
        } catch (IOException e) {
            log.warn("Failed to record test executions", e);
        }
    }

}
