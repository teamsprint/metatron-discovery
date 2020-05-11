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

import static app.metatron.dataprep.runner.RunnerUtil.buildSourceDesc;
import static app.metatron.dataprep.runner.RunnerUtil.buildTargetDesc;
import static app.metatron.dataprep.runner.RunnerUtil.getLinesFromFile;
import static app.metatron.dataprep.runner.RunnerUtil.prepareOptions;
import static app.metatron.dataprep.runner.RunnerUtil.printArguments;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.SourceDesc;
import app.metatron.dataprep.TargetDesc;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.io.IOException;
import java.util.Arrays;
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

    SourceDesc src = buildSourceDesc(cmd);
    TargetDesc target = buildTargetDesc(cmd);

    String ruleListFile = cmd.getOptionValue("rule-list-file");

    List<String> ruleStrs;
    if (ruleListFile != null) {
      ruleStrs = getLinesFromFile(ruleListFile);
    } else {
      ruleStrs = Arrays.asList(cmd.getArgs());
    }

    if (verbose) {
      printArguments(cmd, src, target, ruleStrs);
    }

    // Load source
    String dsId = pc.load(src, "runner");
    show(dsId);

    // Transform
    DataFrame df = process(dsId, ruleStrs);

    if (dryRun) {
      System.exit(0);
    }

    // Save to target
    pc.save(df, target);

    LOGGER.info(String.format("Runner: %d rows written.", df.rows.size()));
  }

  private static DataFrame process(String dsId, List<String> ruleStrs) throws TeddyException {
    DataFrame df = pc.fetch(dsId);
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
