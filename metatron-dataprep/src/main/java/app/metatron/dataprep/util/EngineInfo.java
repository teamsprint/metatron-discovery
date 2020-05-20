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

import java.util.Map;

public class EngineInfo {

  public enum ENGINE_TYPE {
    EMBEDDED,
    SPARK
  }

  private ENGINE_TYPE type;
  private SparkEngineInfo spark;

  public EngineInfo() {
    type = ENGINE_TYPE.EMBEDDED;
    spark = new SparkEngineInfo();
  }

  public EngineInfo(Map<String, Object> map) {
    this();

    String type = (String) map.get("type");
    if (type != null) {
      this.type = ENGINE_TYPE.valueOf(type);
    }

    Map<String, Object> spark = (Map<String, Object>) map.get("spark");
    if (spark != null) {
      this.spark = new SparkEngineInfo(spark);
    }
  }

  public ENGINE_TYPE getType() {
    return type;
  }

  public void setType(ENGINE_TYPE type) {
    this.type = type;
  }

  public SparkEngineInfo getSpark() {
    return spark;
  }

  public void setSpark(SparkEngineInfo spark) {
    this.spark = spark;
  }
}
