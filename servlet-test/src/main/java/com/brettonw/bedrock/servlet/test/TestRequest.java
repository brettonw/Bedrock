package com.brettonw.servlet.test;

import com.brettonw.bag.Bag;
import com.brettonw.bag.formats.MimeType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.*;

import static java.util.Collections.enumeration;

public class TestRequest implements HttpServletRequest {
    private static final Logger log = LogManager.getLogger (TestRequest.class);

    public static final String UTF_8 = StandardCharsets.UTF_8.name ();
    public static final String CONTENT_TYPE_KEY = "Content-Type";
    public static final String CONTENT_LENGTH_KEY = "Content-Length";

    private String queryString;
    private String postData;
    private Map<String, String> headers;

    public TestRequest (String queryString) {
        this (queryString, null);
    }

    public TestRequest (String queryString, Bag postData) {
        this (queryString, postData, MimeType.DEFAULT);
    }

    public TestRequest (String queryString, Bag postDataBag, String mimeType) {
        this.queryString = queryString;
        headers = new HashMap<> ();
        postData = null;
        if (postDataBag != null) {
            postData = postDataBag.toString (mimeType);
            addHeader (CONTENT_TYPE_KEY, mimeType + ";charset=" + UTF_8);
            try {
                byte[] bytes = postData.getBytes (UTF_8);
                addHeader (CONTENT_LENGTH_KEY, Integer.toString (bytes.length));
            } catch (UnsupportedEncodingException exception) {
                log.error (exception);
            }
        }
    }

    public void addHeader (String headerName, String headerValue) {
        headers.put (headerName, headerValue);
    }

    @Override
    public String getAuthType () {
        return "http";
    }

    @Override
    public Cookie[] getCookies () {
        return new Cookie[0];
    }

    @Override
    public long getDateHeader (String s) {
        return 0;
    }

    @Override
    public String getHeader (String s) {
        return headers.get (s);
    }

    @Override
    public Enumeration<String> getHeaders (String s) {
        return null;
    }

    @Override
    public Enumeration<String> getHeaderNames () {
        return enumeration (headers.keySet ());
    }

    @Override
    public int getIntHeader (String s) {
        return 0;
    }

    @Override
    public String getMethod () {
        return null;
    }

    @Override
    public String getPathInfo () {
        return null;
    }

    @Override
    public String getPathTranslated () {
        return null;
    }

    @Override
    public String getContextPath () {
        return null;
    }

    @Override
    public String getQueryString () {
        return queryString;
    }

    @Override
    public String getRemoteUser () {
        return null;
    }

    @Override
    public boolean isUserInRole (String s) {
        return false;
    }

    @Override
    public Principal getUserPrincipal () {
        return null;
    }

    @Override
    public String getRequestedSessionId () {
        return null;
    }

    @Override
    public String getRequestURI () {
        return null;
    }

    @Override
    public StringBuffer getRequestURL () {
        return null;
    }

    @Override
    public String getServletPath () {
        return null;
    }

    @Override
    public HttpSession getSession (boolean b) {
        return null;
    }

    @Override
    public HttpSession getSession () {
        return null;
    }

    @Override
    public String changeSessionId () {
        return null;
    }

    @Override
    public boolean isRequestedSessionIdValid () {
        return false;
    }

    @Override
    public boolean isRequestedSessionIdFromCookie () {
        return false;
    }

    @Override
    public boolean isRequestedSessionIdFromURL () {
        return false;
    }

    @Override
    public boolean isRequestedSessionIdFromUrl () {
        return false;
    }

    @Override
    public boolean authenticate (HttpServletResponse httpServletResponse) throws IOException, ServletException {
        return false;
    }

    @Override
    public void login (String s, String s1) throws ServletException {

    }

    @Override
    public void logout () throws ServletException {

    }

    @Override
    public Collection<Part> getParts () throws IOException, ServletException {
        return null;
    }

    @Override
    public Part getPart (String s) throws IOException, ServletException {
        return null;
    }

    @Override
    public <T extends HttpUpgradeHandler> T upgrade (Class<T> aClass) throws IOException, ServletException {
        return null;
    }

    @Override
    public Object getAttribute (String s) {
        return null;
    }

    @Override
    public Enumeration<String> getAttributeNames () {
        return null;
    }

    @Override
    public String getCharacterEncoding () {
        return UTF_8;
    }

    @Override
    public void setCharacterEncoding (String s) throws UnsupportedEncodingException {

    }

    @Override
    public int getContentLength () {
        return (getHeader (CONTENT_LENGTH_KEY) != null) ? new Integer (getHeader (CONTENT_LENGTH_KEY)) : null;
    }

    @Override
    public long getContentLengthLong () {
        return getContentLength ();
    }

    @Override
    public String getContentType () {
        return getHeader (CONTENT_TYPE_KEY);
    }

    @Override
    public ServletInputStream getInputStream () throws IOException {
        return new TestServletInputStream (postData, UTF_8);
    }

    @Override
    public String getParameter (String s) {
        return null;
    }

    @Override
    public Enumeration<String> getParameterNames () {
        return null;
    }

    @Override
    public String[] getParameterValues (String s) {
        return new String[0];
    }

    @Override
    public Map<String, String[]> getParameterMap () {
        return null;
    }

    @Override
    public String getProtocol () {
        return null;
    }

    @Override
    public String getScheme () {
        return null;
    }

    @Override
    public String getServerName () {
        return null;
    }

    @Override
    public int getServerPort () {
        return 0;
    }

    @Override
    public BufferedReader getReader () throws IOException {
        return new BufferedReader (new InputStreamReader (getInputStream ()));
    }

    @Override
    public String getRemoteAddr () {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException exception) {
            log.error (exception);
        }
        return "127.0.0.1";
    }

    @Override
    public String getRemoteHost () {
        return null;
    }

    @Override
    public void setAttribute (String s, Object o) {

    }

    @Override
    public void removeAttribute (String s) {

    }

    @Override
    public Locale getLocale () {
        return null;
    }

    @Override
    public Enumeration<Locale> getLocales () {
        return null;
    }

    @Override
    public boolean isSecure () {
        return false;
    }

    @Override
    public RequestDispatcher getRequestDispatcher (String s) {
        return null;
    }

    @Override
    public String getRealPath (String s) {
        return null;
    }

    @Override
    public int getRemotePort () {
        return 0;
    }

    @Override
    public String getLocalName () {
        return null;
    }

    @Override
    public String getLocalAddr () {
        return null;
    }

    @Override
    public int getLocalPort () {
        return 0;
    }

    @Override
    public ServletContext getServletContext () {
        return null;
    }

    @Override
    public AsyncContext startAsync () throws IllegalStateException {
        return null;
    }

    @Override
    public AsyncContext startAsync (ServletRequest servletRequest, ServletResponse servletResponse) throws IllegalStateException {
        return null;
    }

    @Override
    public boolean isAsyncStarted () {
        return false;
    }

    @Override
    public boolean isAsyncSupported () {
        return false;
    }

    @Override
    public AsyncContext getAsyncContext () {
        return null;
    }

    @Override
    public DispatcherType getDispatcherType () {
        return null;
    }
}
