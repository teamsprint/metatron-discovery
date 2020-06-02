package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.Dataset;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import javax.persistence.EntityManager;

public class DatasetRepositoryImpl implements DatasetRepositoryCustom {

    @Autowired
    private EntityManager entityManager;

    public DatasetRepositoryImpl() {
    }

    @Override
    public Page<Dataset> searchByQuery(String query, Pageable pageable) {
        final FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

        FullTextQuery fullTextQuery;
        try {
            final QueryParser queryParser = new QueryParser("content",
                    fullTextEntityManager.getSearchFactory().getAnalyzer(Dataset.class));
            fullTextQuery = fullTextEntityManager.createFullTextQuery(queryParser.parse(query), Dataset.class);

        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to search query : " + e.getMessage());
        }

        fullTextQuery.setFirstResult(pageable.getOffset());
        fullTextQuery.setMaxResults(pageable.getPageSize());

        return new PageImpl<>(fullTextQuery.getResultList(), pageable, fullTextQuery.getResultSize());
    }

    @Override
    public Dataset findRealOne(Dataset lazyOne) {
        Dataset realOne = null;
        Hibernate.initialize(lazyOne);
        if (lazyOne instanceof HibernateProxy) {
            realOne = (Dataset) ((HibernateProxy) lazyOne).getHibernateLazyInitializer().getImplementation();
        }
        if (realOne == null) {
            return lazyOne;
        }
        return realOne;
    }


}
