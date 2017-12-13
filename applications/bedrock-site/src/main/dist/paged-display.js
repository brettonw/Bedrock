Bedrock.PagedDisplay = function () {
    let $ = Object.create(null);

    let Html = Bedrock.Html;

    // 2 - encapsulate

    // 3 - dynamically compute the column widths

    // 4 - pagedTable, pagedTableWithHeader...

    $.getAllFieldNames = function (records) {
        let fields = Object.create (null);
        for (let record of records) {
            let keys = Object.keys(record);
            for (let key of keys) {
                fields[key] = key;
            }
        }
        return Object.keys (fields).sort();
    };

    $.makeTable = function (container, records, fieldNames) {

        fieldNames = (fieldNames !== undefined) ? fieldNames : this.getAllFieldNames(records);

        // size the pages a bit larger than the actual view so that there can't be
        // more than two pages visible at any one time. this is also a bit of a
        // compromise as larger pages means more populated lines for display per
        // page, so we don't want to just blow the size way up.
        let recordCount = records.length;
        const displayLineSize = parseInt(Html.getCssSelectorStyle(".bedrock-database-line", "height"));
        const pageSize = Math.floor((container.offsetHeight / displayLineSize) * 1.25);
        const pageHeight = displayLineSize * pageSize;
        const pageCount = Math.floor(recordCount / pageSize) + (((recordCount % pageSize) > 0) ? 1 : 0);

        // reset everything
        Html.removeAllChildren(container);
        container.scrollTop = 0;

        // utility function that uses special knowledge of the size of a page to
        // decide if the page is visible
        let pageIsVisible = function (page, view) {
            let pageInfo = page.id.split(/-/);
            let start = (parseInt(pageInfo[1]) * displayLineSize) - view.scrollTop;
            let end = (parseInt(pageInfo[2]) * displayLineSize) - view.scrollTop;
            return (end >= 0) && (start <= view.clientHeight);
        };

        // the main worker function - when the container is scrolled, figure out which
        // pages are visible and make sure they are populated. we try to do this in an
        // intelligent way, rather than iterate over all the pages. the point is to
        // reduce the amount of DOM manipulation we do, as those operations are VERY
        // slow.
        let lastVisiblePages = [];
        container.onscroll = function (/* event */) {
            let visiblePages = [];

            // clear the lastVisiblePages
            for (let page of lastVisiblePages) {
                if (pageIsVisible(page, container)) {
                    visiblePages.push(page);
                } else {
                    Html.removeAllChildren(page);
                }
            }

            // figure out which pages to make visible
            let start = Math.floor(container.scrollTop / pageHeight);
            let end = Math.min(pageCount, start + 2);
            let pages = container.children[0].children;
            for (let i = start; i < end; ++i) {
                let page = pages[i];
                if ((page.children.length === 0) && pageIsVisible(page, container)) {
                    visiblePages.push(page);
                    populatePage(page);
                }
            }

            // reset the visible pages for the next time
            lastVisiblePages = visiblePages;
        };

        // function to populate a page - build it out from the records
        let populatePage = function (pageElement) {
            // create a filler object to make add/remove quick
            let pageBulder = Html.Builder.begin("div");

            let pageInfo = pageElement.id.split(/-/);
            let start = parseInt(pageInfo[1]);
            let end = parseInt(pageInfo[2]);
            for (let j = start; j < end; ++j) {
                try {
                    let record = records[j];
                    let lineBuilder = pageBulder.begin("div", {class: ((j & 0x01) === 1) ? ["bedrock-database-line", "odd"] : ["bedrock-database-line"]});
                    for (let fieldName of fieldNames) {
                        let value = (fieldName in record) ? record[fieldName] : "";
                        let styleName = fieldName.replace(/ /g, "-").toLowerCase();
                        lineBuilder
                            .begin("div", {class: "bedrock-database-entry"})
                            .add("div", {class: [styleName, "bedrock-database-entry-text"], innerHTML: value})
                            .end();
                    }
                    pageBulder.end();
                } catch (exception) {
                    console.log(exception);
                }
            }
            pageElement.appendChild(pageBulder.end());
        };

        // loop over all of the records, page by page
        let pageContainer = Html.Builder.begin("div");
        for (let pageIndex = 0; pageIndex < pageCount; ++pageIndex) {
            let start = pageIndex * pageSize;
            let end = Math.min(start + pageSize, recordCount);
            pageContainer.add("div", {
                id: "page-" + start + "-" + end,
                style: {height: ((end - start) * displayLineSize) + "px"}
            });
        }
        container.appendChild(pageContainer.end());
        container.onscroll(null);
    };

    return $;
} ();
