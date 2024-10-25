package edu.washu.tag;

import edu.washu.tag.reporting.TestSuiteExporter;
import edu.washu.tag.testcontrol.ExecutionParallelizer;
import org.testng.annotations.Listeners;

@Listeners({
        ExecutionParallelizer.class,
        TestSuiteExporter.class
})
public class BaseTestCase {
}
