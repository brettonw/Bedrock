package com.brettonw.servlet;

import com.brettonw.bag.Bag;
import com.brettonw.bag.BagObject;
import com.brettonw.bag.BagObjectFrom;
import com.brettonw.bag.formats.MimeType;
import com.brettonw.servlet.test.TestRequest;
import com.brettonw.servlet.test.TestResponse;
import com.brettonw.servlet.test.TestServletConfig;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class ServletTester extends HttpServlet {
    private static final Logger log = LogManager.getLogger (ServletTester.class);

    public static final String TARGET_DIR = "target";
    public static final String TEST_DIR = "servlet-files";

    private File targetTestDir;
    private HttpServlet httpServlet;

    public ServletTester (HttpServlet httpServlet) {
        this.httpServlet = httpServlet;
        try {
            httpServlet.init (new TestServletConfig (getClass ().getName ()));
            targetTestDir = new File (TARGET_DIR, TEST_DIR);
            targetTestDir.mkdirs ();
        } catch (ServletException exception) {
            log.error (exception);
        }
    }

    private Method getFetchMethod (String name) {
        // work around the protected inheritance - this is for testing purposes anyway
        Method declaredMethod = null;
        Method method = null;
        try {
            //httpServlet.doGet (request, response);
            method = httpServlet.getClass ().getMethod (name, HttpServletRequest.class, HttpServletResponse.class);
        } catch (NoSuchMethodException exception) {}
        try {
            //httpServlet.doGet (request, response);
            declaredMethod = httpServlet.getClass ().getDeclaredMethod (name, HttpServletRequest.class, HttpServletResponse.class);
        } catch (NoSuchMethodException exception) {}
        return (method != null) ? method : declaredMethod;
    }

    private void callFetchMethod (String name, HttpServletRequest request, HttpServletResponse response) {
        Method method = getFetchMethod (name);
        if (method != null) {
            boolean accessible = method.isAccessible ();
            method.setAccessible (true);
            try {
                method.invoke (httpServlet, request, response);
            } catch (IllegalAccessException | InvocationTargetException exception) {
                log.error (exception);
            }
            method.setAccessible (accessible);
        }
    }

    public File fileFromGet (BagObject query) throws IOException {
        return fileFromGet (query.toString (MimeType.URL));
    }

    public File fileFromGet (String queryString) throws IOException {
        File outputFile = new File (targetTestDir, java.util.UUID.randomUUID().toString ());
        TestResponse response = new TestResponse (outputFile);
        TestRequest request = new TestRequest (queryString);
        callFetchMethod ("doGet", request, response);
        return outputFile;
    }

    public File fileFromPost (BagObject query, Bag postData) throws IOException {
        return fileFromPost (query.toString (MimeType.URL), postData);
    }

    public File fileFromPost (String queryString, Bag postData) throws IOException {
        File outputFile = new File (targetTestDir, java.util.UUID.randomUUID().toString ());
        TestResponse response = new TestResponse (outputFile);
        TestRequest request = new TestRequest (queryString, postData);
        callFetchMethod ("doPost", request, response);
        return outputFile;
    }

    private BagObject bagObjectFromFile (File outputFile) {
        BagObject bagObject = BagObjectFrom.file (outputFile);
        outputFile.delete ();
        return bagObject;
    }

    public BagObject bagObjectFromGet (BagObject query) throws IOException {
        return bagObjectFromFile (fileFromGet (query));
    }

    public BagObject bagObjectFromGet (String queryString) throws IOException {
        return bagObjectFromFile (fileFromGet (queryString));
    }

    public BagObject bagObjectFromPost (BagObject query, Bag postData) throws IOException {
        return bagObjectFromFile (fileFromPost (query, postData));
    }

    public BagObject bagObjectFromPost (String queryString, Bag postData) throws IOException {
        return bagObjectFromFile (fileFromPost (queryString, postData));
    }
}
