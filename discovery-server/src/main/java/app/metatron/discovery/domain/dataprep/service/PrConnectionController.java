package app.metatron.discovery.domain.dataprep.service;

import com.google.common.collect.Maps;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping(value = "/api/preparationconnections")
@RepositoryRestController
public class PrConnectionController {

    private static Logger LOGGER = LoggerFactory.getLogger(PrConnectionController.class);

    @RequestMapping(value = "/{connectionId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getConnection(
            @PathVariable("connectionId") String connectionId
    ) {
        Map<String,String> result = Maps.newHashMap();

        try {
            result.put("conn_id","test_id");
            result.put("host","localhost");
            result.put("port","3306");
            result.put("username","user");
            result.put("password","pass");
            result.put("name","test");
            result.put("desc","desc");
        } catch (Exception e) {
            LOGGER.error("getConnection(): caught an exception: ", e);
            throw e;
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(result);
    }

    @RequestMapping(value = "", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> postConnection(
            @RequestBody Map<String,Object> connection
    ) {
        Map<String,Object> result = Maps.newHashMap();

        try {
            for(String key : connection.keySet()) {
                result.put(key, connection.get(key));
            }
            result.put("conn_id","test_id");
        } catch (Exception e) {
            LOGGER.error("postConnection(): caught an exception: ", e);
            throw e;
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(result);
    }
}

