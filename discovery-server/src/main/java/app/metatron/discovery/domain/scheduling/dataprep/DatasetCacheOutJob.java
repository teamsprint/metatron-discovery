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

package app.metatron.discovery.domain.scheduling.dataprep;

import app.metatron.dataprep.PrepContext;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
public class DatasetCacheOutJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(DatasetCacheOutJob.class);

  PrepContext pc;

  public DatasetCacheOutJob() {
    pc = PrepContext.DEFAULT;
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking idle wrangled datasets.");
    pc.datasetCacheOut();
  }
}
