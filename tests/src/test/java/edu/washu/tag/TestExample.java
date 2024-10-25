package edu.washu.tag;

import io.restassured.RestAssured;
import org.testng.annotations.Test;

public class TestExample extends BaseTestCase {

    @Test
    public void testThing() {
        RestAssured
                .given()
                .get("http://localhost")
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void testThingAlso() {
        
    }

}
