package edu.washu.tag;

import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class TestSkippedFromConfigFailure extends BaseTestCase {

    @BeforeClass
    private void buggySetup() {
        throw new RuntimeException("A thing happened");
    }

    @Test
    public void testThingExpectedToBeSkipped() {

    }

}
