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

package app.metatron.dataprep.util;

import static app.metatron.dataprep.util.GlobalObjectMapper.getDefaultMapper;

import app.metatron.dataprep.SourceDesc;
import app.metatron.dataprep.TargetDesc;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.Serializable;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class JobSpec implements Serializable {

  private SourceDesc src;

  private EngineInfo engine;

  private TargetDesc target;
  private CallbackInfo callback;

  public SourceDesc getSrc() {
    return src;
  }

  public void setSrc(SourceDesc src) {
    this.src = src;
  }

  public EngineInfo getEngine() {
    return engine;
  }

  public void setEngine(EngineInfo engine) {
    this.engine = engine;
  }

  public TargetDesc getTarget() {
    return target;
  }

  public void setTarget(TargetDesc target) {
    this.target = target;
  }

  public CallbackInfo getCallback() {
    return callback;
  }

  public void setCallback(CallbackInfo callback) {
    this.callback = callback;
  }

  public JobSpec() {
    engine = new EngineInfo();
  }

  private void setByMap(Map<String, Object> map) {
    Map<String, Object> src = (Map<String, Object>) map.get("src");
    assert src != null;
    this.src = new SourceDesc();
    this.src.setByMap(src);

    Map<String, Object> engine = (Map<String, Object>) map.get("engine");
    if (engine != null) {
      setEngine(new EngineInfo(engine));
    }

    Map<String, Object> target = (Map<String, Object>) map.get("target");
    if (target != null) {
      setTarget(new TargetDesc(target));
    }

    Map<String, Object> callback = (Map<String, Object>) map.get("callback");
    if (callback != null) {
      setCallback(new CallbackInfo(callback));
    }
  }

  public static JobSpec readJson(String path) throws IOException, URISyntaxException {
    URI uri = new URI(path);
    BufferedReader br = new BufferedReader(new FileReader(uri.getPath()));
    String json = br.lines().collect(Collectors.joining());
    Map<String, Object> map = getDefaultMapper().readValue(json, new TypeReference<Map<String, Object>>() {
    });

    JobSpec job = new JobSpec();
    job.setByMap(map);
    return job;
  }

  @Override
  public String toString() {
    String str = null;
    try {
      str = getDefaultMapper().writeValueAsString(this);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }
    return str;
  }
}
