package com.brettonw.bedrock.servlet.test;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.*;
import javax.servlet.descriptor.JspConfigDescriptor;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.*;

public class TestServletContext implements ServletContext {
    private static final Logger log = LogManager.getLogger (TestServletContext.class);

    Map<String, Object> attributes;

    public TestServletContext () {
        attributes = new HashMap<> ();
    }

    @Override
    public String getContextPath () {
        return null;
    }

    @Override
    public ServletContext getContext (String s) {
        return null;
    }

    @Override
    public int getMajorVersion () {
        return 0;
    }

    @Override
    public int getMinorVersion () {
        return 0;
    }

    @Override
    public int getEffectiveMajorVersion () {
        return 0;
    }

    @Override
    public int getEffectiveMinorVersion () {
        return 0;
    }

    @Override
    public String getMimeType (String s) {
        return null;
    }

    @Override
    public Set<String> getResourcePaths (String s) {
        return null;
    }

    @Override
    public URL getResource (String s) throws MalformedURLException {
        return null;
    }

    @Override
    public InputStream getResourceAsStream (String s) {
        try {
            return new FileInputStream (new File (getRealPath (s)));
        } catch (FileNotFoundException exception) {
            log.error (exception);
            return null;
        }
    }

    @Override
    public RequestDispatcher getRequestDispatcher (String s) {
        return null;
    }

    @Override
    public RequestDispatcher getNamedDispatcher (String s) {
        return null;
    }

    @Override
    public Servlet getServlet (String s) throws ServletException {
        return null;
    }

    @Override
    public Enumeration<Servlet> getServlets () {
        return null;
    }

    @Override
    public Enumeration<String> getServletNames () {
        return null;
    }

    @Override
    public void log (String s) {

    }

    @Override
    public void log (Exception e, String s) {

    }

    @Override
    public void log (String s, Throwable throwable) {

    }

    @Override
    public String getRealPath (String s) {
        String root = Paths.get (".").toAbsolutePath ().normalize ().toString ();

        // the purpose of this library is to provide testing of live web servlets. They will be under
        // "src/main/webapp", but in some cases that location might not be part of the project, in
        // which case we want a reasonable fallback

        // first try to see if the requested reource is available in "src/main/webapp"
        File webappFile = new File (new File (root, "src/main/webapp"), s);
        if (webappFile.exists ()) {
            return webappFile.toString ();
        }

        // otherwise see if it's under "src/test" somewhere
        File testFile = new File (root, "src/test");
        String fullPath = new File (testFile, s).toString ();
        return fullPath;
    }

    @Override
    public String getServerInfo () {
        return null;
    }

    @Override
    public String getInitParameter (String s) {
        return null;
    }

    @Override
    public Enumeration<String> getInitParameterNames () {
        return null;
    }

    @Override
    public boolean setInitParameter (String s, String s1) {
        return false;
    }

    @Override
    public Object getAttribute (String s) {
        return attributes.get (s);
    }

    @Override
    public Enumeration<String> getAttributeNames () {
        return null;
    }

    @Override
    public void setAttribute (String s, Object o) {
        attributes.put (s, o);
    }

    @Override
    public void removeAttribute (String s) {
        attributes.remove (s);
    }

    @Override
    public String getServletContextName () {
        return null;
    }

    @Override
    public ServletRegistration.Dynamic addServlet (String s, String s1) {
        return null;
    }

    @Override
    public ServletRegistration.Dynamic addServlet (String s, Servlet servlet) {
        return null;
    }

    @Override
    public ServletRegistration.Dynamic addServlet (String s, Class<? extends Servlet> aClass) {
        return null;
    }

    @Override
    public <T extends Servlet> T createServlet (Class<T> aClass) throws ServletException {
        return null;
    }

    @Override
    public ServletRegistration getServletRegistration (String s) {
        return null;
    }

    @Override
    public Map<String, ? extends ServletRegistration> getServletRegistrations () {
        return null;
    }

    @Override
    public FilterRegistration.Dynamic addFilter (String s, String s1) {
        return null;
    }

    @Override
    public FilterRegistration.Dynamic addFilter (String s, Filter filter) {
        return null;
    }

    @Override
    public FilterRegistration.Dynamic addFilter (String s, Class<? extends Filter> aClass) {
        return null;
    }

    @Override
    public <T extends Filter> T createFilter (Class<T> aClass) throws ServletException {
        return null;
    }

    @Override
    public FilterRegistration getFilterRegistration (String s) {
        return null;
    }

    @Override
    public Map<String, ? extends FilterRegistration> getFilterRegistrations () {
        return null;
    }

    @Override
    public SessionCookieConfig getSessionCookieConfig () {
        return null;
    }

    @Override
    public void setSessionTrackingModes (Set<SessionTrackingMode> set) {

    }

    @Override
    public Set<SessionTrackingMode> getDefaultSessionTrackingModes () {
        return null;
    }

    @Override
    public Set<SessionTrackingMode> getEffectiveSessionTrackingModes () {
        return null;
    }

    @Override
    public void addListener (String s) {

    }

    @Override
    public <T extends EventListener> void addListener (T t) {

    }

    @Override
    public void addListener (Class<? extends EventListener> aClass) {

    }

    @Override
    public <T extends EventListener> T createListener (Class<T> aClass) throws ServletException {
        return null;
    }

    @Override
    public JspConfigDescriptor getJspConfigDescriptor () {
        return null;
    }

    @Override
    public ClassLoader getClassLoader () {
        return null;
    }

    @Override
    public void declareRoles (String... strings) {

    }

    @Override
    public String getVirtualServerName () {
        return null;
    }

    @Override
    public ServletRegistration.Dynamic addJspFile (String s, String s1) {
        return null;
    }

    @Override
    public int getSessionTimeout () {
        return 0;
    }

    @Override
    public void setSessionTimeout (int i) {
    }

    @Override
    public String getRequestCharacterEncoding () {
        return StandardCharsets.UTF_8.name ();
    }

    @Override
    public void setRequestCharacterEncoding (String s) {
    }

    @Override
    public String getResponseCharacterEncoding () {
        return StandardCharsets.UTF_8.name ();
    }

    @Override
    public void setResponseCharacterEncoding (String s) {
    }
}
