package app.metatron.discovery.domain.datasource.ingestion.job;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineException;
import app.metatron.discovery.domain.engine.EngineIngestionService;
import app.metatron.discovery.util.TimeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class EngineTaskLogThread {

  private static Logger LOGGER = LoggerFactory.getLogger(EngineTaskLogThread.class);

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;

  @Autowired
  private DruidEngineMetaRepository druidEngineMetaRepository;
  private int lastOffset = 0;

  public void start(String topicUri, String taskId, Long interval){
    String threadName = Thread.currentThread().getName();
    LOGGER.debug("Engine Task Log Thread Start : {} - {}", threadName, taskId);

    try {
      //max 1days
      long limit = TimeUtils.DAY_MS / interval;
      long loopCnt = 0;

      //first interval
      Thread.sleep(interval);

      while (loopCnt < limit) {
        try {
          Optional<String> taskLog = druidEngineMetaRepository.getIngestionTaskLog(taskId, lastOffset);
          LOGGER.debug("Engine Task Log - {} - taskLog.isPresent() : {}", taskId, taskLog.isPresent());
          if (taskLog.isPresent()) {
            String newTaskLog = taskLog.get();
            int newLogBytes = newTaskLog.getBytes().length;

            //send new task log
            sendTopic(topicUri, new EngineIngestionService.EngineTaskLog(lastOffset, newTaskLog));

            //increment log offset
            lastOffset = lastOffset + newLogBytes;
          }
        } catch (EngineException e) {
          sendTopic(topicUri, new EngineIngestionService.EngineTaskLog(null, e.getMessage()));
        }
        loopCnt++;
        Thread.sleep(interval);
      }
    } catch (InterruptedException e) {
      LOGGER.debug("Engine Task Log Thread Interrupted..maybe ingestion job is done.");
    } catch (Exception e) {
      LOGGER.debug("getting task log failed", e);
    }
  }

  public void sendTopic(String topicUri, EngineIngestionService.EngineTaskLog engineTaskLog) {
    try {
      Map<String, Object> logMap = new HashMap();
      logMap.put("command", "LOG");
      logMap.put("log", engineTaskLog);
      messagingTemplate.convertAndSend(topicUri,
              GlobalObjectMapper.writeValueAsString(logMap));
    } catch (Exception e) {
      LOGGER.error("Fail to send message : {}, {}", topicUri, engineTaskLog, e);
    }
  }
}
