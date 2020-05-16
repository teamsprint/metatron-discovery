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

package app.metatron.dataprep.db;

import static app.metatron.dataprep.SourceDesc.Type.DATABASE;
import static app.metatron.dataprep.SourceDesc.Type.URI;
import static app.metatron.dataprep.TestUtil.append;
import static app.metatron.dataprep.TestUtil.createSalesTbl;
import static app.metatron.dataprep.TestUtil.loadFromMySql;
import static app.metatron.dataprep.TestUtil.loadTblSales;
import static app.metatron.dataprep.TestUtil.saveToMySql;
import static org.junit.Assert.assertEquals;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.SourceDesc;
import app.metatron.dataprep.TargetDesc;
import app.metatron.dataprep.TargetDesc.Type;
import org.junit.BeforeClass;
import org.junit.Test;

public class JdbcTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);

    // Prepare a table with independent test code.
    createSalesTbl();
  }

  @Test
  public void loadByRealCode() {
    String dsId = loadTblSales(pc);
    pc.fetch(dsId).show();
  }

  @Test
  public void transform() {
    String dsId = loadTblSales(pc);
    pc.fetch(dsId).show();
    assertEquals(16, pc.fetch(dsId).getColCnt());
    append(pc, dsId, "drop col: due");
    assertEquals(15, pc.fetch(dsId).getColCnt());
  }

  @Test
  public void snapshot() {
    String dsId = loadTblSales(pc);
    pc.fetch(dsId).show();

    TargetDesc target = new TargetDesc(Type.DATABASE);
    target.setDriver("com.mysql.jdbc.Driver");
    target.setConnStr("jdbc:mysql://localhost:3306");
    target.setUser("polaris");
    target.setPw("polaris");
    target.setDbName("test");
    target.setTblName("snapshot");

    pc.save(dsId, target);
  }

  //  @Test
  public void loadWholeNestedCase() {
    SourceDesc src = new SourceDesc(DATABASE);
    src.setDriver("com.mysql.jdbc.Driver");
    src.setConnStr("jdbc:mysql://c5:3306");
    src.setUser("polaris");
    src.setPw("Metatron123$");
    src.setDbName("campaign");
    src.setTblName("nospcampaigns");

    String dsId = pc.load(src, "nosp list");
    pc.fetch(dsId).show();

    append(pc, dsId, "drop col: id, eventtime");
    append(pc, dsId, "settype col: content type: map");
    append(pc, dsId, "unnest col: content idx: 'result'");
    append(pc, dsId, "drop col: content");
    append(pc, dsId, "flatten col: result");
    pc.fetch(dsId).show();
  }

  //  @Test
  public void snapshotWholeNestedCase() {
    SourceDesc src = new SourceDesc(DATABASE);
    src.setDriver("com.mysql.jdbc.Driver");
    src.setConnStr("jdbc:mysql://c5:3306");
    src.setUser("polaris");
    src.setPw("Metatron123$");
    src.setDbName("campaign");
    src.setTblName("nospcampaigns");

    String dsId = pc.load(src, "nosp list");
    pc.fetch(dsId).show();

    append(pc, dsId, "drop col: id, eventtime");
    append(pc, dsId, "settype col: content type: map");
    append(pc, dsId, "unnest col: content idx: 'result'");
    append(pc, dsId, "drop col: content");
    append(pc, dsId, "flatten col: result");
    pc.fetch(dsId).show();

    TargetDesc target = new TargetDesc(Type.DATABASE);
    target.setDriver("com.mysql.jdbc.Driver");
    //    target.setConnStr("jdbc:mysql://localhost:3306");
    //    target.setUser("polaris");
    //    target.setPw("polaris");
    //    target.setDbName("test");
    //    target.setTblName("flat");
    target.setConnStr("jdbc:mysql://c5:3306");
    target.setUser("polaris");
    target.setPw("Metatron123$");
    target.setDbName("campaign");
    target.setTblName("flat");

    pc.save(dsId, target);
  }

  //  @Test
  public void loadWholeNestedCase2() {
    SourceDesc src = new SourceDesc(DATABASE);
    src.setDriver("com.mysql.jdbc.Driver");
    src.setConnStr("jdbc:mysql://c5:3306");
    src.setUser("polaris");
    src.setPw("Metatron123$");
    src.setQueryStmt("select n1.campaignid, n1.content from campaign.nospcampaign n1 left join campaign.nospcampaign n2"
            + " on (n1.campaignid = n2.campaignid and n1.id < n2.id) where n2.id is null");

    String dsId = pc.load(src, "nosp most recent campaign detail");
    pc.fetch(dsId).show();

    append(pc, dsId, "settype col: content type: map");
    append(pc, dsId, "unnest col: content idx: 'info', 'campaignReport'");
    append(pc, dsId, "drop col: content");
    append(pc, dsId, "flatten col: campaignReport");
    pc.fetch(dsId).show();
  }

  //  @Test
  public void snapshotWholeNestedCase2() {
    SourceDesc src = new SourceDesc(DATABASE);
    src.setDriver("com.mysql.jdbc.Driver");
    src.setConnStr("jdbc:mysql://c5:3306");
    src.setUser("polaris");
    src.setPw("Metatron123$");
    src.setQueryStmt("select n1.campaignid, n1.content from campaign.nospcampaign n1 left join campaign.nospcampaign n2"
            + " on (n1.campaignid = n2.campaignid and n1.id < n2.id) where n2.id is null");

    String dsId = pc.load(src, "nosp most recent campaign detail");
    pc.fetch(dsId).show();

    append(pc, dsId, "settype col: content type: map");
    append(pc, dsId, "unnest col: content idx: 'info', 'campaignReport'");
    append(pc, dsId, "drop col: content");
    append(pc, dsId, "flatten col: campaignReport");
    pc.fetch(dsId).show();

    TargetDesc target = new TargetDesc(Type.DATABASE);
    target.setDriver("com.mysql.jdbc.Driver");
    //        target.setConnStr("jdbc:mysql://localhost:3306");
    //        target.setUser("polaris");
    //        target.setPw("polaris");
    //        target.setDbName("test");
    //        target.setTblName("detail");
    target.setConnStr("jdbc:mysql://c5:3306");
    target.setUser("polaris");
    target.setPw("Metatron123$");
    target.setDbName("campaign");
    target.setTblName("recent_detail");

    pc.save(dsId, target);
  }

  //  @Test
  public void loadWholeNestedCaseFromFile() {
    SourceDesc src = new SourceDesc(URI);
    src.setStrUri("file:///tmp/facebook_ad_info.json");
    String dsId = pc.load(src, "fb ad list");
    pc.fetch(dsId).show();

    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile2() {
    SourceDesc src = new SourceDesc(URI);
    src.setStrUri("file:///tmp/facebook_ad_report.json");
    String dsId = pc.load(src, "fb ad report");
    pc.fetch(dsId).show();

    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile3() {
    SourceDesc src = new SourceDesc(URI);
    src.setStrUri("file:///tmp/fb_ad_info.json");
    String dsId = pc.load(src, "fb ad list");
    pc.fetch(dsId).show();

    append(pc, dsId, "settype col: whole type: array");
    append(pc, dsId, "flatten col: whole");
    append(pc, dsId, "settype col: whole type: map");
    append(pc, dsId, "unnest col: whole idx: 'table', 'rows'");
    append(pc, dsId, "drop col: whole");
    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");

    saveToMySql(pc, dsId, "localhost", "fb_info");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile3_1() {
    String dsId = loadFromMySql(pc, "localhost", "fb_info");

    append(pc, dsId, "keep row: table == 'Campaign'");
    append(pc, dsId, "drop col: table");
    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");
    append(pc, dsId, "settype col: rows type: map");
    append(pc, dsId, "unnest col: rows idx: 'id', 'account_id', 'bid_strategy', 'budget_remaining', 'buying_type'"
            + ", 'can_use_spend_cap', 'created_time', 'daily_budget', 'name', 'objective', 'source_campaign_id'"
            + ", 'spend_cap', 'start_time', 'stop_time', 'status'");
    append(pc, dsId, "drop col: rows");

    saveToMySql(pc, dsId, "c5", "fb_info_campaign");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile3_2() {
    String dsId = loadFromMySql(pc, "localhost", "fb_info");

    append(pc, dsId, "keep row: table == 'AdSet'");
    append(pc, dsId, "drop col: table");
    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");
    append(pc, dsId, "settype col: rows type: map");
    append(pc, dsId, "unnest col: rows idx: 'id', 'account_id', 'campaign_id', 'name', 'optimization_goal'"
            + ", 'optimization_sub_event', 'targeting', 'billing_event', 'start_time'");
    append(pc, dsId, "drop col: rows");
    append(pc, dsId, "settype col: targeting type: map");
    append(pc, dsId, "unnest col: targeting idx: 'age_max', 'age_min', 'geo_locations', 'user_device', 'user_os'"
            + ", 'brand_safety_content_filter_levels', 'publisher_platforms', 'facebook_positions', 'device_platforms'");
    append(pc, dsId, "drop col: targeting");
    append(pc, dsId, "settype col: geo_locations type: map");
    append(pc, dsId, "unnest col: geo_locations idx: 'countries', 'location_types'");
    append(pc, dsId, "drop col: geo_locations");
    append(pc, dsId, "settype col: countries, location_types, user_device, user_os, brand_safety_content_filter_levels"
            + ", publisher_platforms, device_platforms type: array");
    append(pc, dsId, "flatten col: countries");
    append(pc, dsId, "flatten col: location_types");
    append(pc, dsId, "flatten col: user_device");
    append(pc, dsId, "flatten col: user_os");
    append(pc, dsId, "flatten col: brand_safety_content_filter_levels");
    append(pc, dsId, "flatten col: publisher_platforms");
    append(pc, dsId, "flatten col: device_platforms");

    saveToMySql(pc, dsId, "localhost", "fb_info_adset");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile3_3() {
    String dsId = loadFromMySql(pc, "localhost", "fb_info");

    append(pc, dsId, "keep row: table == 'Ad'");
    append(pc, dsId, "drop col: table");
    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");
    append(pc, dsId, "settype col: rows type: map");
    append(pc, dsId, "unnest col: rows idx: 'id', 'account_id', 'adset_id', 'campaign_id', 'bid_type'"
            + ", 'configured_status', 'conversion_specs'");
    append(pc, dsId, "drop col: rows");
    append(pc, dsId, "settype col: conversion_specs type: array");
    append(pc, dsId, "flatten col: conversion_specs");
    append(pc, dsId, "settype col: conversion_specs type: map");
    append(pc, dsId, "unnest col: conversion_specs idx: 'action.type', 'post', 'post.wall'");
    append(pc, dsId, "drop col: conversion_specs");
    append(pc, dsId, "settype col: action_type, post, post_wall type: array");
    append(pc, dsId, "flatten col: action_type");
    append(pc, dsId, "flatten col: post");
    append(pc, dsId, "flatten col: post_wall");

    saveToMySql(pc, dsId, "c5", "fb_info_ad");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile4() {
    SourceDesc src = new SourceDesc(URI);
    src.setStrUri("file:///tmp/fb_ad_report.json");
    String dsId = pc.load(src, "fb ad report");
    pc.fetch(dsId).show();

    append(pc, dsId, "settype col: whole type: array");
    append(pc, dsId, "flatten col: whole");
    append(pc, dsId, "settype col: whole type: map");
    append(pc, dsId, "unnest col: whole idx: 'table', 'rows'");
    append(pc, dsId, "drop col: whole");
    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");

    saveToMySql(pc, dsId, "localhost", "fb_report");
  }

  //  @Test
  public void loadWholeNestedCaseFromFile4_1() {
    String dsId = loadFromMySql(pc, "localhost", "fb_report");

    append(pc, dsId, "keep row: table == 'CampaignInsight'");
    append(pc, dsId, "drop col: table");
    append(pc, dsId, "settype col: rows type: array");
    append(pc, dsId, "flatten col: rows");
    append(pc, dsId, "settype col: rows type: map");
    append(pc, dsId, "unnest col: `rows` into: MAP idx: 'account_currency','account_id','account_name','actions'"
            + ",'buying_type','campaign_id','campaign_name','clicks','cost_per_action_type'"
            + ",'cost_per_estimated_ad_recallers','cost_per_inline_link_click'"
            + ",'cost_per_inline_post_engagement','cost_per_outbound_click','cost_per_thruplay'"
            + ",'cost_per_unique_action_type','cost_per_unique_click','cost_per_unique_inline_link_click'"
            + ",'cost_per_unique_outbound_click','cpc','cpm','cpp','ctr','date_start','date_stop','impressions'"
            + ",'frequency','inline_link_click_ctr','inline_link_clicks','inline_post_engagement'"
            + ",'instant_experience_clicks_to_open','instant_experience_clicks_to_start'"
            + ",'instant_experience_outbound_clicks','objective','outbound_clicks','outbound_clicks_ctr'"
            + ",'reach','social_spend','spend','unique_actions','unique_clicks','unique_ctr'"
            + ",'unique_inline_link_click_ctr','unique_inline_link_clicks','unique_link_clicks_ctr'"
            + ",'unique_outbound_clicks','unique_outbound_clicks_ctr','video_30_sec_watched_actions'"
            + ",'video_avg_time_watched_actions','video_p100_watched_actions','video_p25_watched_actions'"
            + ",'video_p50_watched_actions','video_p75_watched_actions','video_p95_watched_actions'"
            + ",'video_play_actions','video_thruplay_watched_actions','website_ctr','estimated_ad_recallers'");

    append(pc, dsId, "drop col: rows");
    append(pc, dsId, "flatten col: actions");
    append(pc, dsId, "settype col: actions type: map");
    append(pc, dsId, "unnest col: `actions` into: MAP idx: 'action_type','value'");
    append(pc, dsId, "drop col: `actions`");

    append(pc, dsId, "flatten col: `cost_per_action_type`");
    append(pc, dsId, "settype col: `cost_per_action_type` type: map");
    append(pc, dsId, "unnest col: `cost_per_action_type` into: MAP idx: 'action_type','value'");
    append(pc, dsId, "drop col: `cost_per_action_type`");
    append(pc, dsId, "delete row: `action_type` != `action_type_1`");
    append(pc, dsId, "drop col: `action_type_1`");
    append(pc, dsId, "rename col: `value_1` to: 'cost_per_action'");
    append(pc, dsId, "settype col: `cost_per_action` type: double");

    saveToMySql(pc, dsId, "c5", "fb_report_campaign");
  }
}
