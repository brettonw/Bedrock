package com.brettonw.servlet.test;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import java.util.Enumeration;

public class TestServletConfig implements ServletConfig {
    TestServletContext servletContext;
    String name;

    public TestServletConfig () {
        this ("Test");
    }

    public TestServletConfig (String name) {
        this.name = name;
        servletContext = new TestServletContext ();
    }

    @Override
    public String getServletName () {
        return name;
    }

    @Override
    public ServletContext getServletContext () {
        return servletContext;
    }

    @Override
    public String getInitParameter (String s) {
        return null;
    }

    @Override
    public Enumeration<String> getInitParameterNames () {
        return null;
    }
}
