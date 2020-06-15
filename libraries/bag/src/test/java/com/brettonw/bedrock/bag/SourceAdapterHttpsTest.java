package com.brettonw.bedrock.bag;

import org.junit.jupiter.api.Test;

import java.io.IOException;

public class SourceAdapterHttpsTest {

    @Test
    public void testSelfSignedHttps () throws IOException {
        SourceAdapterHttp.trustAllHosts ();
        /*
        //BagObject bagObject = BagObjectFrom.url ("https://subscriber.suretreat.suretreat.net/water/analysis.dll?tmw:admincalibrationdata:999999:standard=pH_All&dateformat=mmddyyyy&from=05/01/2016&to=08/30/2016&purpose=All&operator=All&deviceos=All&lighting=All&cv=CV2&teststriplistver=0004&mode=json&u=brettonwade@gmail.com&p=Kioskdesign2013");
        SourceAdapter sourceAdapter = new SourceAdapterHttp ("https://subscriber.suretreat.suretreat.net/water/analysis.dll?tmw:admincalibrationdata:999999:standard=pH_All&dateformat=mmddyyyy&from=05/01/2016&to=08/30/2016&purpose=All&operator=All&deviceos=All&lighting=All&cv=CV2&teststriplistver=0004&mode=json&u=brettonwade@gmail.com&p=Kioskdesign2013");
        AppTest.report (sourceAdapter.getStringData () != null, true, "Confirm actual string data was retrieved");
        sourceAdapter.setMimeType (MimeType.JSON);
        BagObject bagObject = new BagObject (sourceAdapter);
        AppTest.report (bagObject != null, true, "confirm a proper object was retrieved");
        BagObject calibrationData = bagObject.getBagObject ("calibrationData");
        AppTest.report (calibrationData != null, true, "confirm a proper object was retrieved");
        */
    }
}
