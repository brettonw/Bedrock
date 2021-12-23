package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;
import com.brettonw.bedrock.logger.LogManager;
import com.brettonw.bedrock.logger.Logger;

import javax.net.ssl.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

public class SourceAdapterHttp extends SourceAdapter {
    private static final Logger log = LogManager.getLogger (SourceAdapterHttp.class);

    private static final String UTF_8 = StandardCharsets.UTF_8.name ();

    /**
     * Read string data from a remote source given as a URL string, using GET
     * @param urlString
     * @throws IOException
     */
    public SourceAdapterHttp (String urlString) throws IOException {
        this (new URL (urlString));
    }

    /**
     * Read string data from a remote source given as a URL, using GET
     * @param url
     * @throws IOException
     */
    public SourceAdapterHttp (URL url) throws IOException {
        this (url, null, null);
    }

    /**
     * Read string data from a remote source given as a URL string, using POST
     * @param urlString
     * @param postData
     * @param postDataMimeType
     * @throws IOException
     */
    public SourceAdapterHttp (String urlString, Bag postData, String postDataMimeType) throws IOException {
        this (new URL (urlString), postData, postDataMimeType);
    }

    /**
     * Read string data from a remote source given as a URL, using POST
     * @param url
     * @param postData
     * @param postDataMimeType
     * @throws IOException
     */
    public SourceAdapterHttp (URL url, Bag postData, String postDataMimeType) throws IOException {
        // create the connection, see if it was successful
        HttpURLConnection connection = (HttpURLConnection) url.openConnection ();
        if (connection != null) {
            // don't use the caches
            connection.setUseCaches(false);

            // set up the request, POST if there is post data, otherwise, GET
            if (postData != null) {
                // prepare the post data
                String postDataString = postData.toString (postDataMimeType);
                byte[] postDataBytes = postDataString.getBytes ();

                // setup the headers
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", postDataMimeType + ";charset=" + UTF_8); // "application/json"
                connection.setRequestProperty("Content-Length", Integer.toString(postDataBytes.length));

                // write out the request data
                connection.setDoOutput (true);
                OutputStream outputStream = connection.getOutputStream();
                DataOutputStream dataOutputStream = new DataOutputStream(outputStream);
                dataOutputStream.write(postDataBytes);
                dataOutputStream.close();
            } else {
                // setup the header
                connection.setRequestMethod("GET");
            }

            // get the response type (this will trigger the actual fetch), then tease out the
            // response type (use a default if it's not present) and the charset (if given,
            // otherwise default to UTF-8, because that's what it will be in Java)
            String contentTypeHeader = connection.getHeaderField("Content-Type");
            String charset = UTF_8;
            mimeType = MimeType.DEFAULT;
            if (contentTypeHeader != null) {
                String[] contentType = contentTypeHeader.replace (" ", "").split (";");
                mimeType = contentType[0];
                if (contentType.length > 1) {
                    charset = contentType[1].split ("=", 2)[1];
                }
                log.debug ("'Content-Type' is " + mimeType + " (charset: " + charset + ")");
            } else {
                log.warn ("'Content-Type' is not set at the host (" + url.toString () + ")");
            }

            // get the response data
            InputStream inputStream = connection.getInputStream();
            Reader inputStreamReader = new InputStreamReader (inputStream, charset);
            stringData = readString (inputStreamReader);
            connection.disconnect();
        }
    }

    /**
     * Sometimes a remote source is self-signed or not otherwise trusted
     */
    public static void trustAllHosts () {
        // Create a trust manager that does not validate certificate chains
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager () {
                    public X509Certificate[] getAcceptedIssuers () { return new X509Certificate[]{}; }

                    public void checkClientTrusted (X509Certificate[] chain, String authType) throws CertificateException {}

                    public void checkServerTrusted (X509Certificate[] chain, String authType) throws CertificateException {}
                }
        };

        // Install the all-trusting trust manager
        try {
            SSLContext sslContext = SSLContext.getInstance ("TLS");
            sslContext.init (null, trustAllCerts, new java.security.SecureRandom ());
            HttpsURLConnection.setDefaultSSLSocketFactory (sslContext.getSocketFactory ());
            HttpsURLConnection.setDefaultHostnameVerifier ((String var1, SSLSession var2) -> {
                return true;
            });
        } catch (Exception exception) {
            log.error (exception);
        }
    }
}
