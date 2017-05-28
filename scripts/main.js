(function () {
    var columns;
    var synthesizing = false;

    function find_element_once(base, options, receiver) {
        let elements = base.querySelectorAll(options.selector);

        if (elements.length > 0) {
            receiver(elements[0]);
        } else {
            var finder = new MutationObserver((records, observer) => {
                observer.takeRecords();

                let elements = base.querySelectorAll(options.selector);

                if (elements.length > 0) {
                    finder.disconnect();
                    finder = null;

                    receiver(elements[0]);
                }
            });

            finder.observe(base, { childList: true, subtree: options.recursive });
        }
    }

    function adjust_scroll_height(first, second) {
        // FIXME : How can we adjust scrollHeight of the second element whose children are div.account elements?
    }

    function synthesize_scroll_forward(first, second, opposite_listener) {
        second.removeEventListener("scroll", opposite_listener);

        let new_position = Math.min(first.scrollTop + first.clientHeight, second.scrollHeight - second.clientHeight);

        if (second.scrollTop != new_position) {
            second.scrollTop = new_position;
        }

        var revive_opposite_listener = (ev) => {
            second.removeEventListener("scroll", revive_opposite_listener);
            second.addEventListener("scroll", opposite_listener, { passive: true });
        };

        second.addEventListener("scroll", revive_opposite_listener, { passive: true });
    }

    function synthesize_scroll_backward(first, second, opposite_listener) {
        first.removeEventListener("scroll", opposite_listener);

        if (second.scrollTop < first.clientHeight) {
            second.scrollTop = first.clientHeight;
        }

        let new_position = Math.max(0, second.scrollTop - first.clientHeight);

        if (first.scrollTop != new_position) {
            first.scrollTop = new_position;
        }

        var revive_opposite_listener = (ev) => {
            first.removeEventListener("scroll", revive_opposite_listener);
            first.addEventListener("scroll", opposite_listener, { passive: true });
        };

        first.addEventListener("scroll", revive_opposite_listener, { passive: true });
    }

    function create_proxy(original) {
        let new_node = original.cloneNode(false);

        if (new_node.nodeType == 1) {
            if (new_node.tagName == "A"
                    || new_node.tagName == "BUTTON"
                    || new_node.getAttribute("class") == "media-spoiler") {
                new_node.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    original.click();
                }, true);
            } /* else if (new_node.getAttribute("class") == "status__content") {
                new_node.addEventListener("click", (ev) => {
                    original.click();
                });
            } gave up! */
        }

        return new_node;
    }

    function mirror(dst, src) {
        let root = src;

        for (;;) {
            let src_next = src.firstChild;
            let dst_next;

            if (src_next) {
                dst_next = create_proxy(src_next);
                dst.appendChild(dst_next);
            } else {
                while (src !== root) {
                    src_next = src.nextSibling;

                    if (src_next) {
                        break;
                    } else {
                        src = src.parentNode;
                        dst = dst.parentNode;
                    }
                }

                if (src === root) {
                    break;
                } else {
                    dst_next = create_proxy(src_next);
                    dst.parentNode.appendChild(dst_next);
                }
            }

            src = src_next;
            dst = dst_next;
        }
    }

    var hook_navigator = (navigator) => {
        var is_start;
        var column = null;
        var original_content = null;
        var mirror_column = null;
        var mirror_content = null;

        var on_scroll_mirror_content;
        var on_scroll_original_content;

        on_scroll_mirror_content = (ev) => {
            synthesize_scroll_forward(mirror_content, original_content, on_scroll_original_content);
        };
        on_scroll_original_content = (ev) => {
            synthesize_scroll_backward(mirror_content, original_content, on_scroll_mirror_content);
        };

        var revise_content = () => {
            if (is_start) {
                let message = original_content.querySelectorAll(".getting-started > p > span");

                if (message.length > 0) {
                    message = message[0].parentNode;

                    if (!Tutturizer && !message.getAttribute("data-spamming")) {
                        message.setAttribute("data-spamming", "true");

                        let spam = document.createElement("span");
                        spam.innerHTML = "ところで、tutturizeしませんか？";

                        let btn = document.createElement("button");
                        btn.innerHTML = "tutturizeする";
                        btn.addEventListener("click", (ev) => {
                            start_tutturizer();
                            message.removeChild(spam);
                        });
                        spam.appendChild(btn);

                        message.appendChild(spam);
                    }
                }
            } else {
                if (mirror_content) {
                    if (mirror_content.innerHTML != original_content.innerHTML) {
                        while (mirror_content.firstChild) {
                            mirror_content.removeChild(mirror_content.firstChild);
                        }

                        mirror(mirror_content, original_content);
                    }
                } else {
                    mirror_column = column.cloneNode(false);
                    mirror_column.id = "ext-mirror-column";

                    mirror_content = original_content.cloneNode(false);
                    mirror_content.id = "ext-mirror-content";
                    mirror(mirror_content, original_content);

                    mirror_column.appendChild(mirror_content);
                    columns.appendChild(mirror_column);

                    mirror_content.addEventListener("scroll", on_scroll_mirror_content, { passive: true });
                    original_content.addEventListener("scroll", on_scroll_original_content, { passive: true });
                }

                adjust_scroll_height(mirror_content, original_content);
                on_scroll_original_content();
                on_scroll_mirror_content();
            }
        };

        var original_content_observer = new MutationObserver((records, observer) => {
            observer.takeRecords();
            revise_content();
        });

        var update_column = () => {
            if (column) {
                let parent = column.parentNode;

                if (!parent || parent.getAttribute("aria-hidden") == "true") {
                    if (original_content) {
                        if (mirror_content) {
                            original_content.removeEventListener("scroll", on_scroll_original_content);
                            columns.removeChild(mirror_column);
                            mirror_content = null;
                            mirror_column = null;
                        }

                        original_content_observer.disconnect();
                        original_content.id = "";
                        original_content = null;
                    }

                    column.id = "";
                    column = null;
                }
            }

            if (!column) {
                let elements = navigator.querySelectorAll(":scope > .column, .mastodon-column-container[aria-hidden=\"false\"] > .column");

                if (elements.length > 0) {
                    column = elements[0];
                    column.id = "ext-original-column";

                    find_element_once(column, {
                        selector: ":scope > .scrollable",
                        recursive: false
                    }, (content) => {
                        is_start = column.getElementsByClassName("getting-started__wrapper").length > 0;

                        if (is_start) {
                            column.firstElementChild.id = "ext-header-start";
                        }

                        original_content = content;
                        original_content.id = "ext-original-content";

                        original_content_observer.observe(original_content, { childList: true, attributes: true, subtree: true });
                        revise_content();
                    });
                }
            }
        };

        new MutationObserver((records, observer) => {
            observer.takeRecords();
            update_column();
        }).observe(navigator, { childList: true, attributes: true, subtree: true });

        update_column();
    }

    find_element_once(document, {
        selector: ".columns-area",
        recursive: true
    }, (found_element) => {
        columns = found_element;
        columns.id = "ext-columns";

        find_element_once(columns, {
            selector: ":scope > .drawer",
            recursive: false
        }, (column) => {
            column.id = "ext-compose-box";
        });

        find_element_once(columns, {
            selector: ":scope > div:nth-child(2)",
            recursive: false
        }, (column) => {
            column.id = "ext-home";
        });

        find_element_once(columns, {
            selector: ":scope > div:nth-child(3)",
            recursive: false
        }, (column) => {
            column.id = "ext-notifications";
        });

        find_element_once(columns, {
            selector: ":scope > div:nth-child(4)",
            recursive: false
        }, (navigator) => {
            navigator.id = "ext-navigator";
            hook_navigator(navigator);
        });
    });
})();
