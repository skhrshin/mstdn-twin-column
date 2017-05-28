# Mastodon Twin-column Timeline Extension
A web extension demo which revises the user interface of Mastodon.

Tested on Mastodon version 1.3.3 with Firefox 53 and Chrome 58 only.

# The twin-column timeline
The main feature of this extension is that a timeline flows in two columns.

If you had a large display, you would want to look many items at a time. The default interface of Mastodon arranges the items vertically, so the number of the items you can look increases as much as the window gets taller and taller. However, for the horizontal direction, the things won't work fine. One of the reasons is that the columns have fixed widths in the default interface. But even if you injected some simple stylesheets and make widths you want variable, you wouldn't get satisfied. Because, as much as the column gets wider and wider, the maximal length of each line increases, but each item won't be shrinked more than a limit because it has several elements stacked vertically. Also, some lines could be too long to read.

The solution against the issue above is the twin-column timeline. With this extension, the bottom of the first timeline column continues toward the top of the second timeline column. When you scroll down either one of the columns, items scrolled out from the second column are scrolled in to the first column. As far as the author understand, CSS3 multicol doesn't support such behavior, so it is implemented by complicated way.

The extension is difficult to implement and not a good way to revise the interface, but as a design, this approach is scalable. The display area gets more useful if it can have columns as many as the window is wide.

# How to install
You have to do the following things to apply this extension to your Mastodon interface.

1. Modify manifest.json file so that the URL pattern matches with the Mastodon instances you have joined.
1. Load the extension from about:debugging (Firefox) or chrome://extensions (Chrome)

# License
xregexp-all.js is distributed from http://xregexp.com/ and licensed under the terms of MIT License.

Everything else in this work is dedicated to the public domain.

# Notes
You would find some unexpected behaviors. e.g.:

- The interface is totally broken if the browser window is shrinked much enough.
- Same item is displayed in both columns if the timeline is short enough or scrolled to near to the end.
- Some click operations for timeline items works only on the right column.
- The easter egg works only with Japanese interface.

However, this extension is just a demonstration and not going to be maintained.
