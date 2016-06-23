/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
"use strict";

var util = require('util');
/**
 * An object with methods that are called during the traversal of the coverage tree.
 * A visitor has the following methods that are called during tree traversal.
 *
 *   * `onStart(root, state)` - called before traversal begins
 *   * `onSummary(node, state)` - called for every summary node
 *   * `onDetail(node, state)` - called for every detail node
 *   * `onSummaryEnd(node, state)` - called after all children have been visited for
 *      a summary node.
 *   * `onEnd(root, state)` - called after traversal ends
 * @name Visitor
 * @param {Object} delegate - a partial visitor that only implements the methods of interest
 *  The visitor object supplies the missing methods as noops. For example, reports
 *  that only need the final coverage summary need implement `onStart` and nothing
 *  else. Reports that use only detailed coverage information need implement `onDetail`
 *  and nothing else.
 * @constructor
 */
function Visitor(delegate) {
    this.delegate = delegate;
}

['Start', 'End', 'Summary', 'SummaryEnd', 'Detail' ].forEach(function (k) {
    var f = 'on' + k;
    Visitor.prototype[f] = function (node, state) {
        if (this.delegate[f] && typeof this.delegate[f] === 'function') {
            this.delegate[f].call(this.delegate, node, state);
        }
    };
});

function CompositeVisitor(visitors) {
    if (!Array.isArray(visitors)) {
        visitors = [visitors];
    }
    this.visitors = visitors.map(function (v) {
        if (v instanceof Visitor) {
            return v;
        }
        return new Visitor(v);
    });
}

util.inherits(CompositeVisitor, Visitor);

['Start', 'Summary', 'SummaryEnd', 'Detail', 'End'].forEach(function (k) {
    var f = 'on' + k;
    CompositeVisitor.prototype[f] = function (node, state) {
        this.visitors.forEach(function (v) {
            v[f](node, state);
        });
    };
});

/**
 * Node is a node in the coverage tree.
 * @constructor
 */
function Node() {
}
/**
 * returns the fully qualified name of the node.
 * @returns {string} the qualified name for the node.
 */
/* istanbul ignore next: abstract method */
Node.prototype.getQualifiedName = function () {
    throw new Error('getQualifiedName must be overridden');
};
/**
 * returns the name of the node relative to its parent.
 * @returns {string} the relative name for the node.
 */
/* istanbul ignore next: abstract method */
Node.prototype.getRelativeName = function () {
    throw new Error('getRelativeName must be overridden');
};
/**
 * returns if this node is the root of the tree.
 * @returns {boolean} true only for the root node.
 */
/* istanbul ignore next: abstract method */
Node.prototype.isRoot = function () {
    return !this.getParent();
};
/**
 * returns the parent node for this node.
 * @returns {Node|null} the parent node or null for the root node.
 */
/* istanbul ignore next: abstract method */
Node.prototype.getParent = function () {
    throw new Error('getParent must be overridden');
};
/**
 * returns the children of this node.
 * @returns {Array<Node>} the node's children or an empty list.
 */
/* istanbul ignore next: abstract method */
Node.prototype.getChildren = function () {
    throw new Error('getChildren must be overridden');
};

/**
 * returns true if the node is a summary node.
 * @returns {boolean} true for summary nodes, false for detail nodes
 */
/* istanbul ignore next: abstract method */
Node.prototype.isSummary = function () {
    throw new Error('isSummary must be overridden');
};

/**
 * returns the coverage summary for the node. For summary nodes,
 * this is the aggregate summary of nodes under it. For detail nodes,
 * it is just the file coverage expressed in summary form.
 * @param {boolean} filesOnly - when true only summarizes detail nodes
 *  under this node, ignoring summary children.
 * @returns {CoverageSummary} the coverage summary for this node.
 */
/* istanbul ignore next: abstract method */
Node.prototype.getCoverageSummary = function (/* filesOnly */) {
    throw new Error('getCoverageSummary must be overridden');
};

/* istanbul ignore next: abstract method */
/**
 * returns the file coverage for the node or null if the node is a summary
 * node.
 * @returns {FileCoverage|null}
 */
Node.prototype.getFileCoverage = function () {
    throw new Error('getFileCoverage must be overridden');
};
/**
 * visit all nodes depth-first from this node down. Note that `onStart`
 * and `onEnd` are never called on the visitor even if the current
 * node is the root of the tree.
 * @param {Object} visitor a full visitor that is called during tree traversal
 * @param {Object} [state=null] state that is passed around
 */
Node.prototype.visit = function (visitor, state) {

    var that = this,
        visitChildren = function () {
            that.getChildren().forEach(function (child) {
                child.visit(visitor, state);
            });
        };

    if (this.isSummary()) {
        visitor.onSummary(this, state);
    } else {
        visitor.onDetail(this, state);
    }

    visitChildren();

    if (this.isSummary()) {
        visitor.onSummaryEnd(this, state);
    }
};

/**
 * abstract base class for a coverage tree. A coverage tree has summary and
 * detail nodes representing "folder" and "file" coverage respectively.
 * Note that "folder" as defined here is just an abstract collection of other
 * nodes; it does not have to mimic the filesystem structure of the detail
 * nodes. Summarizers provided by this library return coverage trees.
 * @name Tree
 * @constructor
 */
function Tree() {
}

/**
 * returns the root node of the tree
 * @method getRoot
 * @returns {Node} the root node of the tree.
 */
/* istanbul ignore next: abstract method */
Tree.prototype.getRoot = function () {
    throw new Error('getRoot must be overridden');
};

/**
 * visits the tree depth-first with the supplied partial visitor
 * @method visit
 * @param {Object} visitor - a potentially partial visitor
 * @param {Object} state - the state to be passed around during tree traversal
 */
Tree.prototype.visit = function (visitor, state) {
    if (!(visitor instanceof Visitor)) {
        visitor = new Visitor(visitor);
    }
    visitor.onStart(this.getRoot(), state);
    this.getRoot().visit(visitor, state);
    visitor.onEnd(this.getRoot(), state);
};

module.exports = {
    Tree: Tree,
    Node: Node,
    Visitor: Visitor,
    CompositeVisitor: CompositeVisitor
};
