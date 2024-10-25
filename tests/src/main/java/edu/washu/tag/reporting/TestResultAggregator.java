package edu.washu.tag.reporting;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TestResultAggregator {

    private static final Logger log = LoggerFactory.getLogger(TestResultAggregator.class);

    public static void main(String[] args) {
        final File resultDirectory = new File(args[0]);
        final ObjectMapper objectMapper = new ObjectMapper();
        final List<TestSuiteRepresentation> partialSuites;

        System.out.println("Running test aggregator...");

        try (Stream<Path> stream = Files.walk(resultDirectory.toPath())) {
            partialSuites = stream
                    .filter(path -> path.toFile().isFile() && path.toFile().getName().endsWith(".json"))
                    .map(jsonFile -> {
                        try {
                            return objectMapper.readValue(jsonFile.toFile(), TestSuiteRepresentation.class);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }).toList();
        } catch (IOException e) {
            log.warn("Failed to read suite logs", e);
            return;
        }

        final TestSuiteRepresentation aggregated = new TestSuiteRepresentation(
                0,
                partialSuites
                        .stream()
                        .map(TestSuiteRepresentation::testClasses)
                        .flatMap(List::stream)
                        .toList()
        );
        final int overallPassing = aggregated.countTestInstances(TestInstance.TestResult.PASSED);
        final int overallFailing = aggregated.countTestInstances(TestInstance.TestResult.FAILED);
        final int overallSkipped = aggregated.countTestInstances(TestInstance.TestResult.SKIPPED);
        final int countWidth = Stream.of(overallPassing, overallFailing, overallSkipped)
                .mapToInt(count -> String.valueOf(count).length()) // number of digits in count
                .max()
                .getAsInt();
        Function<Integer, String> pad = (testCount) -> StringUtils.leftPad(Integer.toString(testCount), countWidth, ' ');

        System.out.printf("Test Suite completed distributed across %d nodes. Overall results:%n", partialSuites.size());
        System.out.println("  " + pad.apply(overallPassing) + " PASSING");
        System.out.println("  " + pad.apply(overallFailing) + " FAILING");
        System.out.println("  " + pad.apply(overallSkipped) + " SKIPPED\n");

        System.out.println(aggregated);
    }

}
