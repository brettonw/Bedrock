"use strict";

let Html = Bedrock.Html;

let pagedTable = function (container, records, fieldNames) {
    let recordCount = records.length;

    // size the pages a bit larger than the actual view so that there can't be
    // more than two pages visible at any one time. this is also a bit of a
    // compromise as larger pages means more populated lines for display per
    // page, so we don't want to just blow the size way up.
    const displayLineSize = parseInt (Html.getCssSelectorStyle (".bedrock-database-line", "height"));
    const pageSize = Math.floor ((container.offsetHeight / displayLineSize) * 1.25);
    const pageHeight = displayLineSize * pageSize;
    let pageCount;

    let pageIsVisible = function (page, view) {
        let pageInfo = page.id.split (/-/);
        let start = (parseInt (pageInfo[1]) * displayLineSize) - view.scrollTop;
        let end = (parseInt (pageInfo[2]) * displayLineSize) - view.scrollTop;
        return (end >= 0) && (start <= view.clientHeight);
    };

    let lastVisiblePages = [];

    container.onscroll = function (/* event */) {
        let visiblePages = [];

        // clear the lastVisiblePages
        for (let page of lastVisiblePages) {
            if (pageIsVisible (page, container)) {
                visiblePages.push (page);
            } else {
                Html.removeAllChildren (page);
            }
        }

        // figure out which pages to make visible
        let start = Math.floor (container.scrollTop / pageHeight);
        let end = Math.min (pageCount, start + 2);
        let pages = container.children;
        for (let i = start; i < end; ++i) {
            let page = pages[i];
            if ((page.children.length === 0) && pageIsVisible (page, container)) {
                visiblePages.push (page);
                populatePage (page);
            }
        }

        // reset the visible pages for the next time
        lastVisiblePages = visiblePages;
    };

    // function to populate a page
    let populatePage = function (pageElement) {
        let pageInfo = pageElement.id.split (/-/);
        let start = parseInt (pageInfo[1]);
        let end = parseInt (pageInfo[2]);
        for (let j = start; j < end; ++j) {
            try {
                let record = records[j];
                let lineElement = Html.addElement(pageElement, "div", {classes: ((j & 0x01) === 1) ? ["bedrock-database-line", "odd"] : ["bedrock-database-line"]});
                for (let fieldName of fieldNames) {
                    let value = (fieldName in record) ? record[fieldName] : "";
                    let styleName = fieldName.replace (/ /g, "-").toLowerCase ();
                    let entryElement = Html.addElement(lineElement, "div", {class: "bedrock-database-entry"});
                    Html.addElement(entryElement, "div", {classes: [styleName, "bedrock-database-entry-text"]}).innerHTML = value;
                }
            } catch (exception) {
                console.log(exception);
            }
        }
    };

    // reset everything
    Html.removeAllChildren (container);
    container.scrollTop = 0;

    // build out the paging flow, computing the page height such that it would be impossible to have more than 2
    // pages visible at any one time
    pageCount = Math.floor (recordCount / pageSize) + (((recordCount % pageSize) > 0) ? 1 : 0);

    // loop over all of the records, page by page
    for (let pageIndex = 0; pageIndex < pageCount; ++pageIndex) {
        let start = pageIndex * pageSize;
        let end = Math.min(start + pageSize, recordCount);
        let count = end - start;
        Html.addElement (container, "div", { id: "page-" + start + "-" + end, style: { height: (count * displayLineSize) + "px" } });
    }
    container.onscroll (null);
};

let now = new Date ().getTime ();
Bedrock.Http.get ("bsc5-short.json?" + now, function (records) {
    console.log ("Database loaded.");

    // might want to condition the input here...

    // identify all the fields, and make a few adjustments
    let fields = Object.create (null);
    for (let record of records) {
        let keys = Object.keys(record);
        for (let key of keys) {
            fields[key] = key;
        }
    }
    let fieldNames = Object.keys (fields).sort();

    // add the header to the display
    let bedrockDatabaseDisplay = document.getElementById ("bedrock-database-display");
    let headerLineElement = Html.addElement (bedrockDatabaseDisplay, "div", { id: "bedrock-header-line" });
    for (let fieldName of fieldNames) {
        let headerElement = Html.addElement (headerLineElement, "div", { class: "bedrock-header-entry" });
        let styleName = fieldName.replace (/ /g, "-").toLowerCase ();
        Html.addElement (headerElement, "div", { classes: [ styleName, "bedrock-header-entry-text" ] }).innerHTML = fieldName;
    }
    let bedrockDatabaseDisplayList = Html.addElement (bedrockDatabaseDisplay, "div", { id:"bedrock-database-display-list" });

    // build the database filter
    Bedrock.Database.Container.new ({
        database: records,
        onUpdate: function (db) {
            pagedTable(bedrockDatabaseDisplayList, db, fieldNames);
        }
    });
});
