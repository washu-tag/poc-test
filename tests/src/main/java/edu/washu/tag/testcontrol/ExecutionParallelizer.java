package edu.washu.tag.testcontrol;

import org.testng.IMethodInstance;
import org.testng.IMethodInterceptor;
import org.testng.ITestContext;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

public class ExecutionParallelizer implements IMethodInterceptor {

    @Override
    public List<IMethodInstance> intercept(List<IMethodInstance> list, ITestContext iTestContext) {
        final String totalExecutionNodesProp = System.getProperty("totalNodes");
        if (totalExecutionNodesProp == null || totalExecutionNodesProp.isEmpty()) {
            System.out.println("Executing tests on single node...");
            return list;
        }
        final int executorsSize = Integer.parseInt(totalExecutionNodesProp);
        final int executorId = Integer.parseInt(System.getProperty("executorId"));
        System.out.println("Executing test suite as executor " + executorId);

        final List<? extends Class<?>> allTestClasses = list
                .stream()
                .map(this::extractClass)
                .distinct()
                .sorted(Comparator.comparing(Class::getCanonicalName))
                .toList();

        final List<? extends Class<?>> classesHandledOnExecutor = IntStream.range(executorId, allTestClasses.size())
                .filter(index -> index % executorsSize == executorId)
                .mapToObj(allTestClasses::get)
                .toList();

        return list
                .stream()
                .filter(test -> classesHandledOnExecutor.contains(extractClass(test)))
                .toList();
    }

    private Class<?> extractClass(IMethodInstance methodInstance) {
        return methodInstance.getMethod().getRealClass();
    }
}
