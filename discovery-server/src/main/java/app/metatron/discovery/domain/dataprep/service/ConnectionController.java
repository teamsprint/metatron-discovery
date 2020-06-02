package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.entity.ConnectionProjections;
import app.metatron.discovery.domain.dataprep.repository.ConnectionRepository;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.joda.time.DateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.projection.ProjectionFactory;

import java.util.Map;
import java.util.List;

@RequestMapping(value = "/connections")
@RepositoryRestController
public class ConnectionController {
    
    private static Logger LOGGER = LoggerFactory.getLogger(ConnectionController.class);

    @Autowired
    ConnectionService connectionService;

    @Autowired
    ConnectionRepository connectionRepository;

    @Autowired
    PagedResourcesAssembler pagedResourcesAssembler;

    @Autowired
    ProjectionFactory projectionFactory;


    @RequestMapping(value = "/{connectionId}", method = RequestMethod.PATCH)
    @ResponseBody
    public ResponseEntity<?> patchConnection(
            @PathVariable("connectionId") String connectionId,
            @RequestBody Resource<Connection> connectionResource
    ) {
        Connection connection;
        Connection patchConnection;
        Connection savedConnection;
        Resource<ConnectionProjections.DefaultProjection> projectedConnection;

        try {
            connection = this.connectionRepository.findOne(connectionId);
            patchConnection = connectionResource.getContent();
            this.connectionService.patchAllowedOnly(connection, patchConnection);
            savedConnection = this.connectionRepository.save(connection);
            this.connectionRepository.flush();
        } catch (Exception e) {
            LOGGER.error("patchConnection(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_CONNECTION_ERROR_CODE, e);
        }
        ConnectionProjections.DefaultProjection projection = this.projectionFactory
                .createProjection(ConnectionProjections.DefaultProjection.class, savedConnection);
        projectedConnection = new Resource<>(projection);
        return ResponseEntity.status(HttpStatus.SC_OK).body(projectedConnection);
    }



    @RequestMapping(value = "/query/check", method = RequestMethod.POST)
    public @ResponseBody ResponseEntity<?> queryForConnection(@RequestBody ConnectionRequest checkRequest) {
        // 추가 유효성 체크
        Map<String, Object> resultMap = connectionService.checkConnection(checkRequest.getConnection());
        return ResponseEntity.ok(resultMap);
    }


    @RequestMapping(value = "/query/databases", method = RequestMethod.POST)
    public @ResponseBody ResponseEntity<?> queryForListOfDatabases(@RequestBody ConnectionRequest checkRequest,
                                                                 Pageable pageable) {
        return ResponseEntity.ok(
                connectionService.getDatabases(checkRequest.getConnection())
        );
    }



    @RequestMapping(value = "/query/tables", method = RequestMethod.POST)
    public @ResponseBody ResponseEntity<?> queryForListOfTables(@RequestBody ConnectionRequest checkRequest,
                                                              Pageable pageable) {
        return ResponseEntity.ok(
            connectionService.getTableNames(checkRequest.getConnection(), checkRequest.getDatabase())
        );
    }


    @RequestMapping(value = "/query/data", method = RequestMethod.POST)
    public @ResponseBody ResponseEntity<?> queryBySelect(@RequestBody ConnectionRequest checkRequest,
                                                       @RequestParam(required = false, defaultValue = "50") int limit,
                                                       @RequestParam(required = false) boolean extractColumnName) {

        // 추가 유효성 체크
        SearchParamValidator.checkNull(checkRequest.getType(), "type");
        SearchParamValidator.checkNull(checkRequest.getQuery(), "query");

        ConnectionResultResponse resultSet =
        connectionService.selectQueryForPreview(checkRequest.getConnection(), checkRequest.getDatabase(),
                checkRequest.getType(),checkRequest.getQuery(), limit, extractColumnName);

        return ResponseEntity.ok(resultSet);
    }


      @RequestMapping(value = "/filter", method = RequestMethod.POST)
      public @ResponseBody ResponseEntity<?> filterDataConnection(@RequestBody ConnectionFilterRequest request,
                                                           Pageable pageable,
                                                           PersistentEntityResourceAssembler resourceAssembler) {

        List<String> implementors = request == null ? null : request.getImplementor();
        DateTime createdTimeFrom = request == null ? null : request.getCreatedTimeFrom();
        DateTime createdTimeTo = request == null ? null : request.getCreatedTimeTo();
        DateTime modifiedTimeFrom = request == null ? null : request.getModifiedTimeFrom();
        DateTime modifiedTimeTo = request == null ? null : request.getModifiedTimeTo();
        String containsText = request == null ? null : request.getContainsText();

        // Validate createdTimeFrom, createdTimeTo
        SearchParamValidator.range(null, createdTimeFrom, createdTimeTo);

        // Validate modifiedTimeFrom, modifiedTimeTo
        SearchParamValidator.range(null, modifiedTimeFrom, modifiedTimeTo);

        // 기본 정렬 조건 셋팅
        if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
          pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                  new Sort(Sort.Direction.DESC, "createdTime", "name"));
        }

        Page<Connection> connection = connectionService.findConnectionByFilter(implementors, createdTimeFrom, createdTimeTo, modifiedTimeFrom, modifiedTimeTo, containsText, pageable);
        return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(connection, resourceAssembler));
    }
}
