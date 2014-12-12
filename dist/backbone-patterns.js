( function( root, factory ) {
    // Set up Ahold-Backbone for the environment. Start with AMD.
    if ( typeof define === 'function' && define.amd ) {
        define( [ 'exports', 'backbone', 'underscore' ], factory );
    }
    // Next for Node.js or CommonJS.
    else if ( typeof exports !== 'undefined' ) {
        factory( exports, require( 'backbone' ), require( 'underscore' ) );
    }
    // Finally, as a browser global. Use `root` here as it references `window`.
    else {
        factory( root, root.Backbone, root._ );
    }
}( this, function( exports, Backbone, _ ) {;Backbone.utils = {};
Backbone.utils.readonly = (function (obj) {
    var descriptor;
    if (typeof Object.defineProperty !== "undefined") {
        descriptor = {
            writable: false,
            enumerable: true,
            configurable: false
        };

        var props = (arguments.length > 1) ? _.toArray(arguments).slice(1) : [];
        _.each(props, function (prop) {
            descriptor.value = obj[prop];
            try {
                Object.defineProperty(obj, prop, descriptor);
            } catch (error) {}
        });
        return true;
    }

    return false;
});;/*global Backbone, _ */

Backbone.mediator = function () {};

_.extend(Backbone.mediator.prototype, {
    subscribe: function (name, handler, scope) {
        Backbone.Events.on.apply(this, arguments);
    },

    subscribeOnce: function (name, handler, scope) {
        Backbone.Events.once.apply(this, arguments);
    },

    unsubscribe: function (name, handler, scope) {
        Backbone.Events.off.apply(this, arguments);
    },

    publish: function (name) {
        Backbone.Events.trigger.apply(this, arguments);
    },

    setResponder: function (name, responder, scope) {
        this.handlers || (this.handlers = []);
        this.handlers[name] = {
            responder: responder,
            scope: scope
        };
    },

    request: function (name) {
        var handler;
        if (this.handlers) {
            handler = this.handlers[name] || this.handlers['catch-unregistered'];
        }
        if (handler) {
            var scope = handler.scope || null,
                props = (arguments.length > 1) ? _.toArray(arguments).slice(1) : [];

            return handler.responder.apply(scope, props);
        }
        throw Error('Backbone.mediator -> Response handler for (' + name + ') is not registered and there is no catch-unregistered handler registered');
    }
});

Backbone.mediator = new Backbone.mediator();
Backbone.utils.readonly(Backbone.mediator, 'subscibe', 'subscibeOnce', 'unsubscribe', 'publish');


;/*global Backbone, _ */
Backbone.decorators || (Backbone.decorators = {});
Backbone.decorators.PubSub = {
    subscribe: function (name, handler, scope) {
        Backbone.mediator.subscribe.apply(Backbone.mediator, arguments);
    },

    subscribeOnce: function (name, handler, scope) {
        Backbone.mediator.subscribeOnce.apply(Backbone.mediator, arguments);
    },

    unsubscribe: function (name, handler, scope) {
        Backbone.mediator.unsubscribe.apply(Backbone.mediator, arguments);
    },

    publish: function (name, value) {
        Backbone.mediator.publish.apply(Backbone.mediator, arguments);
    }
};;/*global Backbone, _ */
Backbone.decorators || (Backbone.decorators = {});
Backbone.decorators.RequestResponse = {
    setResponder: function (name, responder, scope) {
        Backbone.mediator.setResponder.apply(Backbone.mediator, arguments);
    },

    request: function (name) {
        return Backbone.mediator.request.apply(Backbone.mediator, arguments);
    }
};;Backbone.Collection.prototype.inspect = (function (attrs) {
    var results = [];
    _.each(this.models, function (model) {
        results = results.concat(model.inspect(attrs));
    });
    return results;
});
;Backbone.Collection.prototype.findModel = (function (attrs, first) {
    var results = this.inspect(attrs);
    return (first) ? results[0] || null : results;
});;Backbone.Model.prototype.inspectAttributes = (function (attrs) {
    var results = [];
    _.each(this.attributes, function (attribute) {
        if (attribute instanceof Backbone.Collection) {
            results = results.concat(attribute.inspect(attrs));
        } else if (attribute instanceof Backbone.Model) {
            results = results.concat(attribute.inspect(attrs));
        }
    });
    return results;
});
;Backbone.Model.prototype.inspect = (function (attrs) {
    var results = this.inspectAttributes(attrs),
        matches = true;

    for (var key in attrs) {
        if (this.get(key) !== attrs[key]) {
            matches = false;
            break;
        }
    }

    if (matches) {
        results.push(this);
    }

    return results;
});

;var oldProto = Backbone.View.prototype,
    extend = Backbone.View.extend,
    ctor = Backbone.View;

Backbone.View = function (options) {
    options || (options = {});
    if (this.optionNames) {
        _.extend(this, _.pick(options, this.optionNames));
    }

    ctor.apply(this, arguments);
    this._subscribeToEvents();
};

Backbone.View.prototype = oldProto;
Backbone.View.extend = extend;
;/*global Backbone, _ */

_.extend(Backbone.View.prototype, Backbone.decorators.PubSub, Backbone.decorators.RequestResponse);;Backbone.View.prototype.renderMethod = "append"; //append, replace, prepend
Backbone.View.prototype.templateEngine = "dust"; //dust

Backbone.View.prototype.render = (function () {
    if (typeof this.template !== 'function') {
        throw Error('Template is not a function!');
    }
    var appendView = (function (element) {
            if (this.renderMethod === 'replace') {
                this.setElement(element);
            } else {
                this.$el[this.renderMethod](
                    element
                );
            }
            this.trigger('render-complete');
        }.bind(this));

    if (this.templateEngine === 'dust') {
        this.template(this.getTemplateData(), function (err, out) {
            appendView(out);
        });
    } else {
        appendView(this.template(this.getTemplateData()));
    }

    return this;
});

Backbone.View.prototype.getTemplateData = (function () {
    return null;
});
;Backbone.View.prototype._subscribeToEvents = (function () {
    if (typeof this.subscriptions !== 'undefined') {
        for (var key in this.subscriptions) {
            if (typeof this[this.subscriptions[key]] === 'function') {
                this.subscribe(key, this[this.subscriptions[key]], this);
            }
        }
    }
});

Backbone.View.prototype._unSubscribeToEvents = (function () {
    if (typeof this.subscriptions !== 'undefined') {
        for (var key in this.subscriptions) {
            if (typeof this[this.subscriptions[key]] === 'function') {
                this.unsubscribe(key, this[this.subscriptions[key]], this);
            }
        }
    }
});
;Backbone.View.prototype.subview = function (name, instance) {
    if (typeof name === 'undefined') {
        throw new Error('Subview name is not defined');
    }

    this.subviews = this.subviews || {};

    if (typeof instance === 'undefined') {
        return this.subviews[name];
    }

    this.subviews[name] = instance;
    return this.subviews[name];
};

Backbone.View.prototype._removeSubviews = function () {
    _.invoke(this.subviews, 'remove');
};var oldRemove = Backbone.View.prototype.remove;
Backbone.View.prototype.remove = (function () {
    this._unSubscribeToEvents();
    this._removeSubviews();
    oldRemove.apply(this, arguments);
});
;return Backbone;

}));