/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerKey;
import org.quartz.impl.triggers.CronTriggerImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EngineMonitoringController {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineMonitoringController.class);

  @Autowired
  Scheduler scheduler;

  @Autowired
  EngineMonitoringService monitoringQueryService;

  @Autowired
  EngineMonitoringRepository monitoringRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  @RequestMapping(value = "/monitoring/query", method = RequestMethod.POST)
  public ResponseEntity<?> monitoringQuery(@RequestBody EngineMonitoringRequest queryRequest) {

    Object result = monitoringQueryService.search(queryRequest);

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/servers/health", method = RequestMethod.GET)
  public ResponseEntity<?> serverHealth() {
    List<Object[]> objects = monitoringRepository.findServerListByStatus();

    HashMap<String, String> result = new HashMap<>();

    for (Object[] row : objects) {
      if ( row.length == 3 ) {
        String type = (String) row[2];
        if ((Boolean) row[0]){
          result.put(type, "normal");
        } else if ((Boolean) row[1]){
          result.put(type, "warn");
        } else {
          result.put(type, "error");
        }
      }
    }


    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/{group}/{name}/modify/{expression}", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> findJob(@PathVariable("group") String group
      , @PathVariable("name") String name
      , @PathVariable("expression") String expression) throws SchedulerException, ParseException {

    TriggerKey triggerKey = new TriggerKey(name, group);
    CronTriggerImpl trigger = (CronTriggerImpl) scheduler.getTrigger(triggerKey);
    trigger.setCronExpression(expression);
    scheduler.rescheduleJob(triggerKey, trigger);

    return ResponseEntity.ok(scheduler);
  }

  @RequestMapping(value = "/monitoring/information/{name}", method = RequestMethod.GET)
  public ResponseEntity<?> findInformation(@PathVariable("name") String name) {
    Map<String, Object> result = Maps.newHashMap();
    List<EngineMonitoring> cluster = monitoringRepository.findByType(Lists.newArrayList("broker", "coordinator", "overlord"));
    result.put("cluster", cluster);

    HashMap configs = monitoringQueryService.getConfigs(name);
    LOGGER.debug(configs.toString());
    result.put("configs", configs);
    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/size", method = RequestMethod.GET)
  public ResponseEntity<?> findSize() {
    return ResponseEntity.ok(monitoringQueryService.getSize());
  }

}
