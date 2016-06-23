/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
"use strict";

var summarizer = require('./lib/summarizer'),
    context = require('./lib/context'),
    watermarks = require('./lib/watermarks');

var summarizers = {
    /**
     * a summarizer that creates a flat tree with one root node and bunch of
     * files directly under it.
     */
    flat: summarizer.createFlatSummary,
    /**
     * a summarizer that creates a hierarchical tree where the coverage summaries
     * of each directly reflect the summaries of all subdirectories and files in it
     */
    nested: summarizer.createNestedSummary,
    /**
     * a summarizer that creates a tree in which directories are not nested.
     * Every subdirectory is a child of the root node and only reflects the
     * coverage numbers for the files in it (i.e. excludes subdirectories).
     * This is the default summarizer.
     */
    pkg: summarizer.createPackageSummary
};
/**
 * istanbul-lib-reports provides utilities for report writing.
 * It provides the notion of a coverage tree that has summary and
 * detail nodes and visitors that can visit this tree. A report is
 * a partial visitor for this coverage tree. It is passed in a context
 * that provides information about where reports need to be written,
 * the high/ low watermarks and so on.  The context also allows creation of
 * file and content writers that the report can use to write content to files
 * or the console.
 *
 * @name Exports
 */
var Exports = {
    /**
     * returns a reporting context for the supplied options
     * @param {Object} [opts=null] opts
     * @returns {Context}
     */
    createContext: function (opts) {
        return context.create(opts);
    },
    /**
     * returns the default watermarks that would be used when not
     * overridden
     * @returns {Object} an object with `statements`, `functions`, `branches`,
     *  and `line` keys. Each value is a 2 element array that has the low and
     *  high watermark as percentages.
     */
    getDefaultWatermarks: function () {
        return watermarks.getDefault();
    },
    /**
     * supported summarizers. Every summarizer is a function that accepts
     * a coverage object and returns a Tree.
     */
    summarizers: summarizers
};

module.exports = Exports;
