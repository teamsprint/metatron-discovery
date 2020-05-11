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

import app.metatron.dataprep.SourceDesc;
import app.metatron.dataprep.TargetDesc;
import app.metatron.dataprep.util.GlobalObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

public class RunnerUtil {

  public static Options prepareOptions() {
    Options options = new Options();

    Option verbose = Option.builder("v")
            .longOpt("verbose")
            .build();

    Option dryRun = Option.builder("d")
            .longOpt("dry-run")
            .build();

    Option spark = Option.builder("S")
            .longOpt("spark")
            .build();

    Option dop = Option.builder("p")
            .longOpt("dop")
            .build();

    Option srcType = Option.builder()
            .longOpt("src-type")
            .hasArg()
            .build();

    Option srcLimit = Option.builder()
            .longOpt("src-limit")
            .hasArg()
            .build();

    Option srcUri = Option.builder()
            .longOpt("src-uri")
            .hasArg()
            .build();

    Option srcDriver = Option.builder()
            .longOpt("src-driver")
            .hasArg()
            .build();

    Option srcConnStr = Option.builder()
            .longOpt("src-conn-str")
            .hasArg()
            .build();

    Option srcUser = Option.builder()
            .longOpt("src-user")
            .hasArg()
            .build();

    Option srcPw = Option.builder()
            .longOpt("src-pw")
            .hasArg()
            .build();

    Option srcDb = Option.builder()
            .longOpt("src-db")
            .hasArg()
            .build();

    Option srcTbl = Option.builder()
            .longOpt("src-tbl")
            .hasArg()
            .build();

    Option srcQueryStmt = Option.builder()
            .longOpt("src-query-stmt")
            .hasArg()
            .build();

    Option targetType = Option.builder()
            .longOpt("target-type")
            .hasArg()
            .build();

    Option targetAppend = Option.builder()
            .longOpt("target-append")
            .hasArg()
            .build();

    Option targetUri = Option.builder()
            .longOpt("target-uri")
            .hasArg()
            .build();

    Option targetDriver = Option.builder()
            .longOpt("target-driver")
            .hasArg()
            .build();

    Option targetConnStr = Option.builder()
            .longOpt("target-conn-str")
            .hasArg()
            .build();

    Option targetUser = Option.builder()
            .longOpt("target-user")
            .hasArg()
            .build();

    Option targetPw = Option.builder()
            .longOpt("target-pw")
            .hasArg()
            .build();

    Option targetDb = Option.builder()
            .longOpt("target-db")
            .hasArg()
            .build();

    Option targetTbl = Option.builder()
            .longOpt("target-tbl")
            .hasArg()
            .build();

    Option srcDescFile = Option.builder("s")
            .longOpt("src-desc-file")
            .hasArg()
            .build();

    Option targetDescFile = Option.builder("t")
            .longOpt("target-desc-file")
            .hasArg()
            .build();

    Option ruleListFile = Option.builder("r")
            .longOpt("rule-list-file")
            .hasArg()
            .build();

    return options
            .addOption(verbose)
            .addOption(dryRun)
            .addOption(spark)
            .addOption(dop)
            .addOption(srcType)
            .addOption(srcLimit)
            .addOption(srcUri)
            .addOption(srcDriver)
            .addOption(srcConnStr)
            .addOption(srcUser)
            .addOption(srcPw)
            .addOption(srcDb)
            .addOption(srcTbl)
            .addOption(srcQueryStmt)
            .addOption(targetType)
            .addOption(targetAppend)
            .addOption(targetUri)
            .addOption(targetDriver)
            .addOption(targetConnStr)
            .addOption(targetUser)
            .addOption(targetPw)
            .addOption(targetDb)
            .addOption(targetTbl)
            .addOption(srcDescFile)
            .addOption(targetDescFile)
            .addOption(ruleListFile);
  }

  public static Map<String, Object> getMapFromJsonFile(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    String json = br.lines().collect(Collectors.joining());
    return GlobalObjectMapper.getDefaultMapper().readValue(json, new TypeReference<Map<String, Object>>() {
    });
  }

  public static List<String> getLinesFromFile(String path) throws IOException {
    List<String> strs = new ArrayList<>();
    BufferedReader br = new BufferedReader(new FileReader(path));

    String line = br.readLine();
    while (line != null) {
      if (line.charAt(0) != '#') {
        strs.add(line);
      }
      line = br.readLine();
    }
    return strs;
  }

  private static String getIfDefined(CommandLine cmd, String opt, String orig) {
    if (cmd.getOptionValue(opt) != null) {
      return cmd.getOptionValue(opt);
    }
    return orig;
  }

  public static SourceDesc buildSourceDesc(CommandLine cmd) throws IOException {
    String srcType = null;
    String srcLimit = null;
    String srcUri = null;
    String srcDriver = null;
    String srcConnStr = null;
    String srcUser = null;
    String srcPw = null;
    String srcDb = null;
    String srcTbl = null;
    String srcQueryStmt = null;

    String srcDescFile = cmd.getOptionValue("src-desc-file");
    if (srcDescFile != null) {
      Map<String, Object> map = getMapFromJsonFile(srcDescFile);
      srcType = ((String) map.get("type"));
      srcLimit = String.valueOf(map.get("limit"));
      srcUri = (String) map.get("strUri");
      srcDriver = (String) map.get("driver");
      srcConnStr = (String) map.get("connStr");
      srcUser = (String) map.get("user");
      srcPw = (String) map.get("pw");
      srcDb = (String) map.get("db");
      srcTbl = (String) map.get("tbl");
      srcQueryStmt = (String) map.get("queryStmt");
    }

    srcType      = getIfDefined(cmd, "src-type"       , srcType);
    srcLimit     = getIfDefined(cmd, "src-limit"      , srcLimit);
    srcUri       = getIfDefined(cmd, "src-uri"        , srcUri);
    srcDriver    = getIfDefined(cmd, "src-driver"     , srcDriver);
    srcConnStr   = getIfDefined(cmd, "src-conn-str"   , srcConnStr);
    srcUser      = getIfDefined(cmd, "src-user"       , srcUser);
    srcPw        = getIfDefined(cmd, "src-pw"         , srcPw);
    srcDb        = getIfDefined(cmd, "src-db"         , srcDb);
    srcTbl       = getIfDefined(cmd, "src-tbl"        , srcTbl);
    srcQueryStmt = getIfDefined(cmd, "src-query-stmt" , srcQueryStmt);

    SourceDesc src = new SourceDesc(srcType);
    if (srcLimit != null) {
      src.setLimit(Integer.valueOf(srcLimit));
    }

    switch (src.getType()) {
      case URI:
        src.setStrUri(srcUri);
        break;
      case DATABASE:
        src.setDriver(srcDriver);
        src.setConnStr(srcConnStr);
        src.setUser(srcUser);
        src.setPw(srcPw);

        if (srcQueryStmt == null) {
          src.setDbName(srcDb);
          src.setTblName(srcTbl);
        } else {
          src.setQueryStmt(srcQueryStmt);
        }
        break;
      case STAGE_DB:
        assert false;
        break;
    }

    return src;
  }

  public static TargetDesc buildTargetDesc(CommandLine cmd) throws IOException {
    String targetType = null;
    String targetAppend = null;
    String targetUri = null;
    String targetDriver = null;
    String targetConnStr = null;
    String targetUser = null;
    String targetPw = null;
    String targetDb = null;
    String targetTbl = null;

    String targetDescFile = cmd.getOptionValue("target-desc-file");

    if (targetDescFile != null) {
      Map<String, Object> map = getMapFromJsonFile(targetDescFile);
      targetType = (String) map.get("type");
      targetAppend = (String) map.get("append");
      targetUri = (String) map.get("strUri");
      targetDriver = (String) map.get("driver");
      targetConnStr = (String) map.get("connStr");
      targetUser = (String) map.get("user");
      targetPw = (String) map.get("pw");
      targetDb = (String) map.get("db");
      targetTbl = (String) map.get("tbl");
    }

    targetType    = getIfDefined(cmd, "target-type", targetType);
    targetAppend  = getIfDefined(cmd, "target-append", targetAppend);
    targetUri     = getIfDefined(cmd, "target-uri", targetUri);
    targetDriver  = getIfDefined(cmd, "target-driver", targetDriver);
    targetConnStr = getIfDefined(cmd, "target-conn-str", targetConnStr);
    targetUser    = getIfDefined(cmd, "target-user", targetUser);
    targetPw      = getIfDefined(cmd, "target-pw", targetPw);
    targetDb      = getIfDefined(cmd, "target-db", targetDb);
    targetTbl     = getIfDefined(cmd, "target-tbl", targetTbl);

    TargetDesc target = new TargetDesc(targetType);
    target.setAppend(Boolean.valueOf(targetAppend));

    switch (target.getType()) {
      case URI:
        target.setStrUri(targetUri);
        break;
      case DATABASE:
        target.setDriver(targetDriver);
        target.setConnStr(targetConnStr);
        target.setUser(targetUser);
        target.setPw(targetPw);
        target.setDbName(targetDb);
        target.setTblName(targetTbl);
        break;
      case STAGING_DB:
        assert false;
        break;
    }

    return target;
  }

  public static void printArguments(CommandLine cmd, SourceDesc src, TargetDesc target, List<String> ruleStrs) {
    System.out.println("srcDescFile=" + cmd.getOptionValue("src-desc-file"));
    System.out.println("targetDescFile=" + cmd.getOptionValue("target-desc-file"));
    System.out.println("ruleListFile=" + cmd.getOptionValue("rule-list-file"));

    System.out.println("srcType=" + src.getType());
    System.out.println("srcLimit=" + src.getLimit());
    System.out.println("srcUri=" + src.getStrUri());
    System.out.println("srcDriver=" + src.getDriver());
    System.out.println("srcConnStr=" + src.getConnStr());
    System.out.println("srcUser=" + src.getUser());
    System.out.println("srcPw=" + src.getPw());
    System.out.println("srcDb=" + src.getDbName());
    System.out.println("srcTbl=" + src.getTblName());
    System.out.println("srcQueryStmt=" + src.getQueryStmt());

    System.out.println("targetType=" + target.getType());
    System.out.println("targetAppend=" + target.isAppend());
    System.out.println("targetUri=" + target.getStrUri());
    System.out.println("targetDriver=" + target.getDriver());
    System.out.println("targetConnStr=" + target.getConnStr());
    System.out.println("targetUser=" + target.getUser());
    System.out.println("targetPw=" + target.getPw());
    System.out.println("targetDb=" + target.getDbName());
    System.out.println("targetTbl=" + target.getTblName());

    for (int i = 0; i < ruleStrs.size(); i++) {
      System.out.println(String.format("Rule #%d: %s", i, ruleStrs.get(i)));
    }
  }
}
