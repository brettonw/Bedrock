Bedrock.PagedDisplay = function () {
    let $ = Object.create (null);

    // using
    let Html = Bedrock.Html;
    let Enum = Bedrock.Enum;

    /*
    $.Select = function () {
        let _ = Object.create(Bedrock.Base);

        _.init = function (parameters) {
            this.name = parameters.name;
        };

        return _;
    };
    */

    // 2 - encapsulate

    // 3 - dynamically compute the column widths

    // 4 - user selectable style classes based on input parameters

    let getAllFieldNames = $.getAllFieldNames = function (records) {
        let fields = Object.create (null);
        for (let record of records) {
            let keys = Object.keys (record);
            for (let key of keys) {
                fields[key] = key;
            }
        }
        return Object.keys (fields).sort ();
    };

    // entry types
    const EntryType = $.EntryType = Enum.create ([
        "LEFT_JUSTIFY",         // left-justified
        "CENTER_JUSTIFY",       // centered
        "RIGHT_JUSTIFY",        // right-justified
        "IMAGE"                 // a url for an image (center justified)
    ]);

    // style names and the default style names object
    const Style = $.Style = Enum.create ([
        "HEADER_ROW",
        "HEADER_ENTRY",
        "HEADER_ENTRY_TEXT",
        "TABLE",
        "TABLE_ROW",
        "TABLE_ROW_ENTRY",
        "TABLE_ROW_ENTRY_TEXT",
        "ODD",
        "HOVER"
    ]);

    const defaultStyles = Object.create (null);
    defaultStyles[Style.HEADER_ROW] = "bedrock-paged-display-header-row";
    defaultStyles[Style.HEADER_ENTRY] = "bedrock-paged-display-header-entry";
    defaultStyles[Style.HEADER_ENTRY_TEXT] = "bedrock-paged-display-header-entry-text";
    defaultStyles[Style.TABLE] = "bedrock-paged-display-table";
    defaultStyles[Style.TABLE_ROW] = "bedrock-paged-display-table-row";
    defaultStyles[Style.TABLE_ROW_ENTRY] = "bedrock-paged-display-table-row-entry";
    defaultStyles[Style.TABLE_ROW_ENTRY_TEXT] = "bedrock-paged-display-table-row-entry-text";
    defaultStyles[Style.ODD] = "bedrock-paged-display-odd";
    defaultStyles[Style.HOVER] = "bedrock-paged-display-hover";
    defaultStyles[EntryType.LEFT_JUSTIFY] = "bedrock-paged-display-entry-left-justify";
    defaultStyles[EntryType.CENTER_JUSTIFY] = "bedrock-paged-display-entry-center-justify";
    defaultStyles[EntryType.RIGHT_JUSTIFY] = "bedrock-paged-display-entry-right-justify";
    defaultStyles[EntryType.IMAGE] = "bedrock-paged-display-entry-image";

    $.Table = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            const records = this.records = parameters.records;

            // save the container that is passed in - it could be an element or
            // a valid elementId, which we reduce to an element (can get its id
            // from it at any time thereafter if we need it)
            if (parameters.container !== undefined) {
                const container = this.container = (typeof (parameters.container) === "string") ? document.getElementById (parameters.container) : parameters.container;
                if ((container.tagName.toLowerCase () === "div") && (container.id !== undefined)) {

                    // "select" should be an array of objects specifying the name
                    // of the field, its display name, and its type (in desired
                    // display order)
                    let select;
                    if (parameters.select === undefined) {
                        select = this.select = [];
                        for (let selectName of getAllFieldNames (records)) {
                            select.push ({ name: selectName });
                        }
                    } else {
                        select = this.select = parameters.select;
                    }

                    // validate the entry names and the types
                    for (let entry of select) {
                        if (entry.displayName === undefined) {
                            entry.displayName = entry.name;
                        }
                        if ((entry.type === undefined) || (EntryType[entry.type] === undefined)) {
                            entry.type = EntryType.CENTER_JUSTIFY;
                        }
                    }

                    // "styles" should be an object containing style names that will be
                    // applied to the components - it's treated as an override of a default
                    // set of values, so not all values must be supplied
                    this.styles = Object.create (defaultStyles);
                    if (parameters.styles !== undefined) {
                        for (let style of Object.keys (defaultStyles)) {
                            if (parameters.styles[style] !== undefined) {
                                this.styles[style] = parameters.styles[style];
                            }
                        }
                    }

                    // "callback" is a way for the display to send an event if a row is
                    // clicked on or selected by the user
                    if (parameters.onclick !== undefined) {
                        this.onclick = parameters.onclick;
                    }

                    // start off with no selected row, allowing mouseover
                    this.currentRow = null;
                    this.allowMouseover = true;
                } else {
                    console.log ("'container' must be a valid element with an id (which is used as the base name for rows).");
                }
            } else {
                console.log ("'container' is a required parameter. it may be an element or a valid element id.");
            }

            return this;
        };

        _.makeTable = function (container = this.container) {
            const select = this.select;
            const styles = this.styles;
            const self = this;

            // capture some keys (up/down, for instance)
            container.onkeydown = function (event) {
                switch (event.key) {
                    case "ArrowUp": {
                        /*
                        if (self.currentRow != null) {
                            self.currentRow.classList.remove (styles[Style.HOVER]);
                            if (self.currentRow.previousSibling != null) {
                                self.currentRow = self.currentRow.previousSibling;
                            } else {
                                self.currentRow = optionsElement.lastChild.lastChild;
                            }
                        } else {
                            self.currentRow = optionsElement.lastChild;
                        }
                        self.currentRow.classList.add (styles[Style.HOVER]);

                        // if the newly selected current option is not visible, set the scroll
                        // pos to make it visible, and tell the options not to respond to
                        // mouseover events until the mouse moves
                        if (!Html.elementIsInView (self.currentRow, optionsElement)) {
                            self.allowMouseover = false;
                            optionsElement.scrollTop = self.currentRow.offsetTop;
                        }
                        */
                        break;
                    }
                    case "ArrowDown": {
                        goNext();
                        break;
                    }
                    case "Enter": {
                        /*
                        if (self.currentRow != null) {
                            inputElement.value = self.currentRow.getAttribute ("data-value");
                        }
                        self.callOnChange ();
                        inputElement.blur ();
                        */
                        break;
                    }
                    case "Escape": {
                        //inputElement.blur ();
                        break;
                    }
                    default:
                        return true;
                }
                return false;
            };
            
            // utility function to compute the container height, just helps keep
            // the code a bit cleaner when I use it
            let getContainerHeight = (rowHeight) => {
                let containerHeight = container.offsetHeight;
                if ((parseInt (containerHeight.toString ()) >= rowHeight) === false) {
                    containerHeight = window.getComputedStyle (container).getPropertyValue ("height");
                }
                if ((parseInt (containerHeight.toString ()) >= rowHeight) === false) {
                    containerHeight = window.getComputedStyle (container).getPropertyValue ("max-height");
                }
                if ((parseInt (containerHeight.toString ()) >= rowHeight) === false) {
                    containerHeight = rowHeight;
                }
                return parseInt (containerHeight.toString ());
            };

            // size the pages a bit larger than the actual view so that there can't be
            // more than two pages visible at any one time. this is also a bit of a
            // compromise as larger pages means more populated lines for display per
            // page, so we don't want to just blow the size way up.
            const records = this.records;
            const recordCount = records.length;
            const rowHeight = parseInt (Html.getCssSelectorStyle ("." + styles[Style.TABLE_ROW], "height"));
            const containerHeight = getContainerHeight (rowHeight);
            const pageSize = Math.max (Math.floor ((containerHeight / rowHeight) * 1.25), 1);
            const pageHeight = rowHeight * pageSize;
            const pageCount = Math.floor (recordCount / pageSize) + (((recordCount % pageSize) > 0) ? 1 : 0);

            // reset everything
            Html.removeAllChildren (container);
            container.scrollTop = 0;

            // utility functions that use special knowledge of the size of a
            // page to decide if the page or row is visible
            let rangeIsVisible = function (start, end) {
                const scrollTop = container.scrollTop;
                start = (start * rowHeight) - scrollTop;
                end = (end * rowHeight) - scrollTop;
                return (end >= 0) && (start <= container.clientHeight);
            };

            let getRowInfo = function (rowId) {
                return parseInt (rowId.toString ().split (/-/).slice(-1)[0]);
            };

            let rowIsVisible = function (rowId) {
                let row = getRowInfo (rowId);
                return rangeIsVisible (row, row + 1);
            };

            let getPageInfo = function (pageId) {
                // extract the page range that we encoded into the id, like
                // this:"blah-blah-32-85"
                let pageInfo = pageId.toString ().split (/-/);
                return {
                    start: parseInt (pageInfo[pageInfo.length - 2]),
                    end: parseInt (pageInfo[pageInfo.length - 1])
                };
            };

            let pageIsVisible = function (page) {
                let pageInfo = getPageInfo (page.id);
                return rangeIsVisible(pageInfo.start, pageInfo.end);
            };

            // go next, go prev... for key-press access
            let goNext = function () {
                // default to row 0
                let rowId = 0;

                // deselect the current row if there is one
                if (self.currentRow !== null) {
                    // update the next row...
                    rowId = (getRowInfo (self.currentRow.id) + 1) % records.length;
                    self.currentRow.remove (styles[Style.HOVER]);
                }

                // what page is the new element on, and is it populated?
                let pageId = Math.floor (rowId / pageSize);
                let page = container.children[0].children[pageId];
                if (page.children.length === 0) {
                    populatePage(page);
                }

                // get the relative offset and get the actual row
                let relativeIndex = rowId - (pageId * pageSize);
                let row = page.children[0].children[relativeIndex];
                row.classList.add (styles[Style.HOVER]);

                // and finally, check to see if the row is visible
                if (! rangeIsVisible(rowId, rowId + 1)) {
                    // gotta scroll to make it visible, and tell the rows not
                    // to respond to mouseover events until the mouse moves
                    self.allowMouseover = false;
                    container.scrollTop = rowId * rowHeight;
                }
            };

            // function to select a row
            let setCurrentRow = function (rowIndex) {
                // figure out what page the rowIndex refers to, check and see if it's
                // a populated page

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
                    if (pageIsVisible (page)) {
                        visiblePages.push (page);
                    } else {
                        Html.removeAllChildren (page);
                    }
                }

                // figure out which pages to make visible
                let start = Math.floor (container.scrollTop / pageHeight);
                let end = Math.min (pageCount, start + 2);
                let pages = container.children[0].children;
                for (let i = start; i < end; ++i) {
                    let page = pages[i];
                    if ((page.children.length === 0) && pageIsVisible (page)) {
                        visiblePages.push (page);
                        populatePage (page);
                    }
                }

                // reset the visible pages for the next time
                lastVisiblePages = visiblePages;
            };

            // function to populate a page - build it out from the records
            let populatePage = function (pageElement) {
                // create a filler object to make add/remove quick
                let pageBuilder = Html.Builder.begin ("div");

                // extract the page range that we encoded into the id, like
                // this:"blah-blah-32-85"
                let pageInfo = getPageInfo (pageElement.id);
                for (let j = pageInfo.start, end = pageInfo.end; j < end; ++j) {
                    let record = records[j];
                    let rowBuilder = pageBuilder.begin ("div", {
                        id: container.id + "-row-" + j,
                        class: ((j & 0x01) === 1) ? [styles[Style.TABLE_ROW], styles[Style.ODD]] : [styles[Style.TABLE_ROW]],
                        onmousedown: function () {
                            if (self.onclick !== undefined) {
                                if (self.onclick (self.records[j])) {
                                    // if the called function returns true, we reset the
                                    // selected element
                                    this.classList.remove (styles[Style.HOVER]);
                                    self.currentRow = null;
                                }
                                return true;
                            }
                            return false;
                        },
                        onmouseover: function () {
                            //console.log ("onmouseover (" + ((self.allowMouseover === true) ? "YES" : "NO") + ")");
                            if (self.allowMouseover === true) {
                                if (self.currentRow !== null) {
                                    this.classList.remove (styles[Style.HOVER]);
                                }
                                self.currentRow = this;
                                this.classList.add (styles[Style.HOVER]);
                            }
                            self.allowMouseover = true;
                        },
                        onmouseout: function () {
                            //console.log ("onmouseout (" + ((self.allowMouseover === true) ? "YES" : "NO") + ")");
                            if (self.allowMouseover === true) {
                                this.classList.remove (styles[Style.HOVER]);
                            }
                        }
                    });
                    for (let entry of select) {
                        let value = (entry.name in record) ? record[entry.name] : "";
                        value = (value !== undefined) ? value : "";
                        rowBuilder
                            .begin ("div", { class: styles[Style.TABLE_ROW_ENTRY] })
                            .add ("div", {
                                class: [styles[entry.type], styles[Style.TABLE_ROW_ENTRY_TEXT]],
                                innerHTML: value
                            })
                            .end ();
                    }
                    pageBuilder.end ();
                }
                pageElement.appendChild (pageBuilder.end ());
            };

            // loop over all of the records, page by page
            let pageContainerBuilder = Html.Builder.begin ("div");
            for (let pageIndex = 0; pageIndex < pageCount; ++pageIndex) {
                let start = pageIndex * pageSize;
                let end = Math.min (start + pageSize, recordCount);
                pageContainerBuilder.add ("div", {
                    id: container.id + "-page-" + start + "-" + end,
                    style: { height: ((end - start) * rowHeight) + "px" }
                });
            }
            container.appendChild (pageContainerBuilder.end ());
            container.onscroll (null);
            return container;
        };

        _.makeTableHeader = function () {
            const container = this.container;
            const select = this.select;
            const styles = this.styles;

            let headerBuilder = Html.Builder.begin ("div", { class: styles[Style.HEADER_ROW] });
            for (let entry of select) {
                headerBuilder
                    .begin ("div", { class: styles[Style.HEADER_ENTRY] })
                    .add ("div", { class: styles[Style.HEADER_ENTRY_TEXT], innerHTML: entry.displayName })
                    .end ();
            }
            container.appendChild (headerBuilder.end ());
        };

        _.makeTableWithHeader = function () {
            Html.removeAllChildren (this.container);

            // add the header
            this.makeTableHeader ();

            // add the table to a sub element
            let listContainer = Html.addElement (this.container, "div", { id: this.container.id + "-table", class: this.styles[Style.TABLE] });
            return this.makeTable (listContainer);
        };

        return _;
    } ();

    return $;
} ();
