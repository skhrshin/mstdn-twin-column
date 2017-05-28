var Tutturizer;

function start_tutturizer() {
    if (Tutturizer) {
        return;
    } else {
        Tutturizer = this;
    }

    var find_unhappy_people = new XRegExp("^((.*)([^\\p{Katakana}]+))?トゥート(([^\\p{Katakana}]+)(.*))?$");

    function tutturize_text(node) {
        let old_text = node.nodeValue;
        let new_text = XRegExp.replace(old_text, find_unhappy_people, "$1トゥットゥルー$4");

        if (old_text != new_text) {
            node.nodeValue = new_text;
        }
    }

    function tutturize_element(element) {
        for (let child = element.firstChild; child; child = child.nextSibling) {
            switch (child.nodeType) {
            case 1:
                tutturize_element(child);
                break;
            case 3:
                tutturize_text(child);
                break;
            }
        }
    }

    (function () {
        var button;

        function tutturize_button() {
            tutturize_element(button);
        }

        var button_finder;
        var button_modifier = new MutationObserver((records, observer) => {
            observer.takeRecords();
            tutturize_button();
        });

        function find_publish_button() {
            let wrapper = document.getElementsByClassName("compose-form__publish-button-wrapper");

            if (wrapper.length > 0) {
                let found = wrapper[0].getElementsByTagName("button");

                if (found.length > 0) {
                    button = found[0];
                }
            }

            if (button) {
                button_finder.disconnect();

                tutturize_button();

                button_modifier.observe(button, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }

        button_finder = new MutationObserver((records, observer) => {
            observer.takeRecords();
            find_publish_button();
        });

        button_finder.observe(document, {
            childList: true,
            subtree: true
        });

        find_publish_button();
    })();

    (function () {
        function tutturize_column(column) {
            let elements = column.querySelectorAll(".status__content, .notification__message");

            for (let index = 0; index < elements.length; ++index) {
                let element = elements[index];
                let flag = "data-tutturized";

                if (!element.getAttribute(flag)) {
                    element.setAttribute(flag, "true");
                    tutturize_element(element);
                }
            }
        }

        function tutturize_columns() {
            let columns = document.getElementsByClassName("column");

            for (let index = 0; index < columns.length; ++index) {
                tutturize_column(columns[index]);
            }
        }

        var message_modifier = new MutationObserver((records, observer) => {
            observer.takeRecords();
            tutturize_columns();
        });

        tutturize_columns();

        message_modifier.observe(document, {
            childList: true,
            subtree: true
        });
    })();
}
