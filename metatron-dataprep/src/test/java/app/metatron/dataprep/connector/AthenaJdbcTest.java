package app.metatron.dataprep.connector;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.SourceDesc;
import org.junit.BeforeClass;
import org.junit.Test;

import static app.metatron.dataprep.SourceDesc.Type.DATABASE;
import static app.metatron.dataprep.TestUtil.createSalesTbl;

public class AthenaJdbcTest {

    private static PrepContext pc;

    @BeforeClass
    public static void setUp() {
        pc = PrepContext.DEFAULT.withCacheMB(1000);
    }

    @Test
    public void loadFromAthena() {
      String dsId;
      SourceDesc src = new SourceDesc(DATABASE);
      src.setDriver("com.simba.athena.jdbc.Driver");
      src.setConnStr("jdbc:awsathena://AwsRegion=ap-northeast-2;User=AKIA32SJACMAZTMROY7Z;Password=pcsI4jYAiA8yKC7MAkElncTiXwnAeSFRvDgGNtjY;S3OutputLocation=s3://rialto-pipeline-athena/athena-query-results/");
//      src.setUser("polaris");
//      src.setPw("polaris");
      src.setDbName("rialto_mls_prd");
      src.setTblName("vw_mls_logs_rt_ps_ct_conv");

      dsId = pc.load(src, "select from athena");
      pc.fetch(dsId).show();
    }
}
