package edu.washu.tag.util;

import java.util.List;
import java.util.Random;
import org.apache.commons.lang3.RandomUtils;

public class RandomGenUtils {

    public static int randomId() {
        return randomId(7);
    }

    public static int randomId(int maxDigits) {
        return RandomUtils.nextInt(1, (int) Math.pow(10, maxDigits));
    }

    public static String randomIdStr() {
        return String.valueOf(randomId());
    }

    public static <X> List<X> randomSubset(List<X> inputList, int size) {
        return new Random()
            .ints(0, inputList.size())
            .distinct()
            .limit(size)
            .mapToObj(inputList::get)
            .toList();
    }

}
