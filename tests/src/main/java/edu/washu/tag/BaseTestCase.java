package edu.washu.tag;

import edu.washu.tag.testcontrol.ExecutionParallelizer;
import edu.washu.tag.reporting.TestSuiteExporter;
import org.testng.annotations.Listeners;

@Listeners({
        ExecutionParallelizer.class,
        TestSuiteExporter.class
})
public class BaseTestCase {
}
