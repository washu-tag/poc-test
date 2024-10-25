package edu.washu.tag;

import io.restassured.RestAssured;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class TestAnotherThing extends BaseTestCase {

    public static final String PROVIDER_ID = "data_provider";

    @DataProvider(name = PROVIDER_ID)
    public Object[][] createData() {
        return new Object[][]{
                new Object[]{ "a", "b", 100 },
                new Object[]{ "c", "d", 200 }
        };
    }

    @Test(dataProvider = PROVIDER_ID)
    public void testThing(String parameter, String anotherParam, int someNumber) {
        RestAssured
                .given()
                .get("http://localhost")
                .then()
                .assertThat()
                .statusCode(200);
    }

}
