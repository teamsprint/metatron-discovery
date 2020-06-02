package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.dataprep.teddy.exceptions.TransformExecutionInterrupteddException;
import app.metatron.dataprep.teddy.exceptions.TransformTimeoutException;
import app.metatron.dataprep.parser.exception.RuleException;
import app.metatron.dataprep.parser.RuleVisitorParser;
import app.metatron.dataprep.parser.rule.Rule;
import app.metatron.dataprep.parser.rule.Union;
import app.metatron.dataprep.parser.rule.expr.Constant;
import app.metatron.dataprep.parser.rule.expr.Expression;
import app.metatron.dataprep.parser.rule.*;

//import app.metatron.discovery.prep.parser.exceptions.RuleException;
//import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
//import app.metatron.discovery.prep.parser.preparation.rule.Join;
//import app.metatron.discovery.prep.parser.preparation.rule.Rule;
//import app.metatron.discovery.prep.parser.preparation.rule.Union;
//import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
//import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

@Service
public class RecipeDataFrameService {

    private static Logger LOGGER = LoggerFactory.getLogger(RecipeDataFrameService.class);


    @Autowired
    PrepProperties prepProperties;

    static private List<String> getLiteralList(Expression expr) {
        List<String> literals = null;
        if (expr instanceof Constant.StringExpr) {
            literals = new ArrayList<>();
            literals.add(((Constant.StringExpr) expr).getEscapedValue());
        } else if (expr instanceof Constant.ArrayExpr) {
            literals = ((Constant.ArrayExpr) expr).getValue();
            for (int i = 0; i < literals.size(); i++) {
                literals.set(i, literals.get(i).replaceAll("'", ""));
            }
        } else {
            assert false : expr;
        }
        return literals;
    }

    static public List<String> getSlaveDsIds(String ruleString) {
        Rule rule;

        try {
            rule = new RuleVisitorParser().parse(ruleString);
        } catch (RuleException re) {
            LOGGER.error("getSlaveDsIds(): Rule exception occurred", re);
            throw PrepException.fromTeddyException(TeddyException.fromRuleException(re));
        }

        switch (rule.getName()) {
            case "join":
                return getLiteralList(((Join) rule).getDataset2());
            case "union":
                return getLiteralList(((Union) rule).getDataset2());
            default:
                return null;
        }
    }

    public DataFrame applyRuleInternal(DataFrame df, String ruleString, List<DataFrame> slaveDfs, Integer cores,
                                       Integer timeout, Integer limitRows) throws TeddyException {
        LOGGER.trace("applyRule(): start");

        List<Future<List<Row>>> futures = new ArrayList<>();
        Rule rule = new RuleVisitorParser().parse(ruleString);
        DataFrame newDf = DataFrame.getNewDf(rule, df.dsName, ruleString);

        try {
            LOGGER.debug("applyRule(): start: ruleString={}", ruleString);
            List<Object> preparedArgs = newDf.prepare(df, rule, slaveDfs);
            int rowcnt = df.rows.size();

            if (rowcnt > 0) {
                if (DataFrame.isParallelizable(rule)) {
                    int partSize = rowcnt / cores + 1;  // +1 to prevent being 0

                    // Outer joins cannot be parallelized. (But, implemented as prepare-gather structure)
                    if (rule.getName().equals("join") && ((Join) rule).getJoinType().equalsIgnoreCase("INNER") == false) {
                        partSize = rowcnt;
                    }

                    for (int rowno = 0; rowno < rowcnt; rowno += partSize) {
                        LOGGER.debug("applyRuleString(): add thread: rowno={} partSize={} rowcnt={}", rowno, partSize, rowcnt);
                        futures.add(gatherAsync(df, newDf, preparedArgs, rowno, Math.min(partSize, rowcnt - rowno), limitRows));
                    }

                    for (int i = 0; i < futures.size(); i++) {
                        List<Row> rows = futures.get(i).get(timeout, TimeUnit.SECONDS);
                        assert rows != null : rule.toString();
                        newDf.rows.addAll(rows);
                    }
                } else {
                    // if not parallelizable, newDf comes to be modified directly.
                    // then, 'rows' returned is only for assertion.
                    List<Row> rows = newDf.gather(df, preparedArgs, 0, rowcnt, limitRows);
                    assert rows == null : ruleString;
                }
            }
        } catch (ExecutionException e) {
            String msg = "applyRule(): transform execution failed";
            LOGGER.error(msg, e);
            throw new TransformExecutionFailedException(msg);
        } catch (InterruptedException e) {
            String msg = "applyRule(): transform execution interrupted";
            LOGGER.error(msg, e);
            throw new TransformExecutionInterrupteddException(msg);
        } catch (TimeoutException e) {
            String msg = String.format("applyRule(): transform timeout: timeout=%ds", timeout);
            LOGGER.error(msg, e);
            throw new TransformTimeoutException(msg);
        } catch (TeddyException e) {
            LOGGER.error("applyRule(): teddy error occurred.", e);
            throw e;
        }

        LOGGER.trace("applyRule(): end (parallel)");
        return newDf;
    }

    public DataFrame applyRule(DataFrame df, String ruleString, List<DataFrame> slaveDfs) throws TeddyException {
        Integer cores = prepProperties.getSamplingCores();
        Integer timeout = prepProperties.getSamplingTimeout();
        Integer limitRows = prepProperties.getSamplingLimitRows();

        return applyRuleInternal(df, ruleString, slaveDfs, cores, timeout, limitRows);
    }

    @Async("prepThreadPoolTaskExecutor")
    public Future<List<Row>> gatherAsync(DataFrame prevDf, DataFrame newDf, List<Object> preparedArgs,
                                         int offset, int length, int limit) throws TeddyException, InterruptedException {
        return new AsyncResult<>(newDf.gather(prevDf, preparedArgs, offset, length, limit));
    }
}
