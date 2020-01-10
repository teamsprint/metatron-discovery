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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import com.google.common.collect.Sets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrepKafkaService {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepKafkaService.class);

  @Autowired(required = false)
  PrepProperties prepProperties;

  @Autowired
  PrDatasetRepository datasetRepository;

  ExecutorService poolExecutorService = null;
  Set<Future<Integer>> futures = null;

  public PrepKafkaService() {
    this.poolExecutorService = Executors.newCachedThreadPool();
    this.futures = Sets.newHashSet();
  }

  // Kafka should be running on the URI stored as "dbName".
  public DataFrame createDataFrame(PrDataset dataset, int size) {
    List<String[]> grid = new ArrayList(size);
    DataFrame df = new DataFrame();

    Properties prop = new Properties();
    prop.put("bootstrap.servers", dataset.getDbName());  // "localhost:9092"
    prop.put("session.timeout.ms", "10000");
    prop.put("max.poll.records", String.valueOf(size));
    prop.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");    // key deserializer
    prop.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");  // value deserializer
    KafkaConsumer consumer = new KafkaConsumer(prop);

    List<TopicPartition> topicPartitions = new ArrayList();
    List<PartitionInfo> partitionInfos = consumer.partitionsFor(dataset.getTblName());  // "test"
    for (PartitionInfo partitionInfo : partitionInfos) {
      topicPartitions.add(new TopicPartition(partitionInfo.topic(), partitionInfo.partition()));
    }
    consumer.assign(topicPartitions);

    Map<TopicPartition, Long> offsets = consumer.endOffsets(topicPartitions);
    for (TopicPartition key : offsets.keySet()) {
      long offset = offsets.get(key);
      consumer.seek(key, Math.max(0, offset - size));
    }

    ConsumerRecords<String, String> records = consumer.poll(500);
    for (ConsumerRecord<String, String> record : records) {
      grid.add(new String[]{record.value()});
    }

    return df.setByGrid(grid, null);
  }
}

