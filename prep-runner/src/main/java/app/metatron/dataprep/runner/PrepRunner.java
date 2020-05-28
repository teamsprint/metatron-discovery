/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.dataprep.runner;

import static app.metatron.dataprep.runner.RunnerUtil.prepareOptions;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.SourceDesc;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.dataprep.util.JobSpec;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepRunner {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepContext.class);

  private static PrepContext pc;

  private static boolean verbose;
  private static boolean dryRun;

  public static void main(String[] args) {
    try {
      run(args);
    } catch (TeddyException e) {
      e.printStackTrace();
      System.exit(-1);
    } catch (IOException e) {
      e.printStackTrace();
      System.exit(-2);
    }
  }

  public static void run(String[] args) throws TeddyException, IOException {
    CommandLineParser parser = new DefaultParser();
    HelpFormatter formatter = new HelpFormatter();
    CommandLine cmd = null;
    Options options = prepareOptions();

    try {
      cmd = parser.parse(options, args);
    } catch (ParseException e) {
      System.out.println(e.getMessage());
      formatter.printHelp("PrepRunner", options);
      System.exit(-1);
    }

    verbose = cmd.hasOption("verbose");
    dryRun = cmd.hasOption("dry-run");

    String strDop = cmd.getOptionValue("dop");
    int dop = 4;
    if (strDop != null) {
      dop = Integer.valueOf(strDop);
    }

    pc = PrepContext.DEFAULT.withDop(dop);

    String jobSpecFile = cmd.getOptionValue("job-spec-file");
    JobSpec job = null;
    try {
      job = JobSpec.readJson(jobSpecFile);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      System.exit(-2);
    }

    String srcQueryStmt = cmd.getOptionValue("src-query-stmt");
    if (srcQueryStmt != null) {
      job.getSrc().setQueryStmt(srcQueryStmt);
    }

    String append = cmd.getOptionValue("target-append");
    if (append != null) {
      job.getTarget().setAppend(Boolean.valueOf(append));
    }

    if (verbose) {
      System.out.println("Job Spec: " + job);
    }

    // Load & Transform
    String dsId = transformRecursive(job.getSrc());

    if (dryRun) {
      System.exit(0);
    }

    // Save to target
    pc.save(dsId, job.getTarget());

    LOGGER.info(String.format("Runner: %d rows written.", pc.fetch(dsId).rows.size()));
  }

  private static String transformRecursive(SourceDesc src) throws TeddyException {
    if (src.getUpstreams() != null) {
      List<SourceDesc> upstreams = src.getUpstreams();
      assert upstreams.size() > 0;
      for (SourceDesc upstream : upstreams) {
        transformRecursive(upstream);
      }
    }

    String dsName = src.toString();
    dsName = dsName.substring(0, Math.min(dsName.length(), 2000));
    String dsId = pc.load(src, dsName, src.getDsId());

    pc.put(dsId, process(dsId, src.getRuleStrs()));
    return dsId;
  }

  private static DataFrame process(String dsId, List<String> ruleStrs) throws TeddyException {
    DataFrame df = pc.fetch(dsId);
    if (ruleStrs == null) {
      return df;
    }

    for (String ruleStr : ruleStrs) {
      df = pc.apply(df, ruleStr);
      show(df);
    }
    return df;
  }

  private static void show(DataFrame df) {
    if (verbose) {
      df.show();
    }
  }

  private static void show(String dsId) {
    show(pc.fetch(dsId));
  }
}
