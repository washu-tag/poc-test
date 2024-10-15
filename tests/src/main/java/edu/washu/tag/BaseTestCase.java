package edu.washu.tag;

import edu.washu.tag.testcontrol.ExecutionParallelizer;
import org.testng.annotations.Listeners;

@Listeners(ExecutionParallelizer.class)
public class BaseTestCase {
}
