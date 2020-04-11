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

package app.metatron.discovery.domain.dataprep.etl;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.TargetDesc;
import app.metatron.dataprep.teddy.DataFrame;
import java.io.IOException;
import java.util.concurrent.Future;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

@Service
public class PrepContextExecutor {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepContextExecutor.class);

  @Async("prepThreadPoolTaskExecutor")
  public Future<String> run(PrepContext pc, DataFrame df, TargetDesc target) throws IOException {
    LOGGER.debug("runPrepContext(): ssName={} ssType={}", df.dsName, target.getType().name());

    pc.save(df, target);

    return new AsyncResult<>(null);
  }

}