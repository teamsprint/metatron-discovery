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

package app.metatron.discovery.domain.dataprep.kafka;

import app.metatron.dataprep.file.PrepCsvUtil;
import app.metatron.dataprep.file.PrepParseResult;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class KafkaContext {

  private static final Logger LOGGER = LoggerFactory.getLogger(KafkaContext.class);

  private int topicOffset;

  private KafkaProducer producer;
  private KafkaConsumer consumer;

  List<TopicPartition> topicPartitions = new ArrayList();

  private DataFrame df;
  private int dfOffset;

  private static String TOPIC = "test";

  public KafkaContext() throws TeddyException, URISyntaxException {
    Properties prop = new Properties();
    prop.put("bootstrap.servers", "localhost:9092");
    prop.put("acks", "all");
    prop.put("block.on.buffer.full", "true");
    prop.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
    prop.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
    producer = new KafkaProducer(prop);

    prop = new Properties();
    prop.put("bootstrap.servers", "localhost:9092");
    prop.put("session.timeout.ms", "10000");
    prop.put("max.poll.records", 10000);
    prop.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");    // key deserializer
    prop.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");  // value deserializer
    consumer = new KafkaConsumer(prop);

    // Use assign() instead of subscribe() to seek easy.

    List<PartitionInfo> partitionInfos = consumer.partitionsFor(TOPIC);
    for (PartitionInfo partitionInfo : partitionInfos) {
      topicPartitions.add(new TopicPartition(partitionInfo.topic(), partitionInfo.partition()));
    }
    consumer.assign(topicPartitions);

    String strUri = "file://" + System.getProperty("user.dir") + "/src/test/resources/test_dataprep.csv";
    loadCsvFile(strUri, ",", null, 10000);
  }

  public void loadCsvFile(String strUri, String strDelim, String quoteChar, int limitRows) throws URISyntaxException {
    df = new DataFrame();

    LOGGER.debug("loadCsvFile(): strUri={} strDelim={} quoteChar={}", strUri, strDelim, quoteChar);

    PrepCsvUtil csvUtil = PrepCsvUtil.DEFAULT
            .withDelim(strDelim)
            .withQuoteChar(quoteChar)
            .withLimitRows(limitRows);

    PrepParseResult result = csvUtil.parse(strUri);
    df.setByGrid(result);

    LOGGER.debug("loadCsvFile(): done");
  }

  public int addMessages(int cnt) {
    for (int i = 0; i < cnt; i++) {
      if (dfOffset == df.rows.size()) {
        dfOffset = 0;
      }

      Row row = df.rows.get(dfOffset++);

      StringBuilder sb = new StringBuilder(i + "," + DateTime.now().toString() + ",");
      for (int colno = 0; colno < row.size(); colno++) {
        sb.append(row.get(colno)).append(",");
      }
      sb.setLength(sb.length() - 1);

      producer.send(new ProducerRecord<String, String>(TOPIC, sb.toString()));
    }

    producer.flush();
    return dfOffset;
  }

  public void printMessages(int cnt) {
    Map<TopicPartition, Long> offsets = consumer.endOffsets(topicPartitions);
    for (TopicPartition key : offsets.keySet()) {
      long offset = offsets.get(key);
      consumer.seek(key, offset - cnt);
    }

    ConsumerRecords<String, String> records = consumer.poll(500);
    for (ConsumerRecord<String, String> record : records) {
      System.out.println(String.format("key=%s value=%s", record.key(), record.value()));
    }
  }
}
