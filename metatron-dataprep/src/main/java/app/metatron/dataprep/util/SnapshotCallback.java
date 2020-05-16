package app.metatron.dataprep.util;

import static app.metatron.dataprep.util.GlobalObjectMapper.getDefaultMapper;

import app.metatron.dataprep.TargetDesc;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

public class SnapshotCallback {

  private static Logger LOGGER = LoggerFactory.getLogger(SnapshotCallback.class);

  private String strUrl;
  private String oauthToken;

  public SnapshotCallback() {
  }

  public SnapshotCallback(String strUrl, String oauthToken) {
    this.strUrl = strUrl;
    this.oauthToken = oauthToken;
  }

  public SnapshotCallback(TargetDesc target) {
    strUrl = target.getCallbackUrl();
    oauthToken = target.getOauthToken();
  }

  // GET http://host:port/api/{ssId} -> {"status": "RUNNING", "ruleCntTotal": 10, "ruleCntDone": 2}
  // PUT http://host:port/api/{ssId} + {"ruleCntDone": 3, "totalLines": 10000}

  public void updateSnapshot(String prop, String val) {
    LOGGER.debug("updateSnapshot(): strUrl={}", strUrl);

    URI uri = UriComponentsBuilder.newInstance().fromHttpUrl(strUrl).build().encode().toUri();

    LOGGER.debug("updateSnapshot(): REST URI=" + uri);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("Accept", "application/json, text/plain, */*");
    headers.add("Authorization", oauthToken);

    HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
    RestTemplate restTemplate = new RestTemplate(requestFactory);

    Map<String, String> patchItems = new HashMap<>();
    patchItems.put(prop, val);

    HttpEntity<Map<String, String>> entity2 = new HttpEntity<>(patchItems, headers);
    ResponseEntity<String> responseEntity;
    responseEntity = restTemplate.exchange(uri, HttpMethod.PATCH, entity2, String.class);

    LOGGER.debug("updateSnapshot(): done with statusCode " + responseEntity.getStatusCode());
  }

  public Map<String, Object> update(String prop, Object val) throws IOException {
    LOGGER.info("update(): strUrl={} prop={} val={}", strUrl, prop, val);
    Map<String, Object> responseMap;

    URL url = new URL(strUrl);
    HttpURLConnection con = (HttpURLConnection) url.openConnection();

    con.setRequestMethod("PATCH");
    con.setRequestProperty("Content-Type", "application/json; utf-8");
    con.setRequestProperty("Accept", "application/json");
    con.setRequestProperty("Authorization", oauthToken);
    con.setDoOutput(true);

    Map<String, Object> map = new HashMap<>();
    map.put(prop, val);
    String jsonArgs = getDefaultMapper().writeValueAsString(map);

    try (OutputStream os = con.getOutputStream()) {
      byte[] input = jsonArgs.getBytes("utf-8");
      os.write(input, 0, input.length);
    }

    InputStreamReader reader = new InputStreamReader(con.getInputStream(), "utf-8");
    try (BufferedReader br = new BufferedReader(reader)) {
      StringBuilder response = new StringBuilder();
      String responseLine;

      while (true) {
        responseLine = br.readLine();
        if (responseLine == null) {
          break;
        }
        response.append(responseLine.trim());
      }

      System.out.println(response.toString());

      responseMap = getDefaultMapper().readValue(response.toString(), HashMap.class);
    }

    LOGGER.info("update: responseMap={}", responseMap);
    return responseMap;
  }

  public void updateStatus(String status) throws IOException {
    status = status.toUpperCase();
    updateSnapshot("status", status);

    if (status.equals("SUCCEEDED") || status.equals("FAILED") || status.equals("CANCELED")) {
      updateSnapshot("finishTime", DateTime.now(DateTimeZone.UTC).toString());
    }
  }
}
