// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// adding missing .filter for IE8
if (!('filter' in Array.prototype)) {
  Array.prototype.filter= function(filter, that /*opt*/) {
    var other= [], v;
    for (var i=0, n= this.length; i<n; i++)
      if (i in this && filter.call(that, v= this[i], i, this))
        other.push(v);
    return other;
  };
}

/**
 * Registry of models
 *  - Each model should have an ID attribute.
 */
var RegistryModule = function($) {
  var module = function() {
    var self = this;

    self.nodes = {};

    module.prototype.initialize.apply(self, arguments);

    return self;
  };

  $.extend(module.prototype, {
    // Normal stuff
    initialize: function() {},

    toString: function() {
      var self = this;

      var s = $.map(self.nodes, function(node) {
        return node.id();
      }).join();
      return s;
    },

    add: function(id, node) {
      var self = this;
      $(self).trigger('registry:add');
      self.nodes[String(id)] = node;
    },

    remove: function(id) {
      var self = this;
      $(self).trigger('registry:remove');
      delete self.nodes[String(id)];
    },

    get: function(id) {
      var self = this;
      return self.nodes[id];
    },

    clear: function() {
      var self = this;

      delete self.nodes;
      self.nodes = {};
    }
  });

  return module;
};
var Registry = RegistryModule($);

/**
 * Modal Control
 * Displays a single node in a modal window of your choosing.
 * Make sure to update the 'context' member and 'template' members.
 * IMPORTANT: Use 'setTemplate', then 'show'.
 */
var ModalModule = function($, ko) {
  var module = function(modal, template) {
    var self = this;

    self.modal = $(modal);
    self.context = ko.observable();
    self.template = ko.observable(template || '');
    self.bound = false;
  };

  module.prototype.show = function(context) {
    var self = this;

    if (context) {
      self.context(context);
    }

    ko.applyBindings(self, self.modal[0]);
    self.modal.modal('show');
  };

  module.prototype.setTemplate = function(template) {
    var self = this;

    ko.cleanNode(self.modal[0]);
    self.template( template );
  };

  module.prototype.recenter = function(offset_x, offset_y) {
    var self = this;
    var top = ( ($(window).height() - self.modal.outerHeight(false)) / 2 );
    var left = ( ($(window).width() - self.modal.outerWidth(false)) / 2 );
    if (top < 0) {
      top = 0;
    }
    if (left < 0) {
      left = 0;
    }
    top += offset_y || 0;
    left += offset_x || 0;
    self.modal.css({top: top +'px', left:  left+'px'});
  };

  module.prototype.addDecorations = function () {
    $(".popover").remove();

    $("input[name='job_xml']:not(.pathChooser)").addClass("pathChooser").after(getFileBrowseButton($("input[name='job_xml']:not(.pathChooser)")));
    $("input[name='jar_path']").addClass("pathChooser").after(getFileBrowseButton($("input[name='jar_path']")));
    $("input[name='script_path']").addClass("pathChooser").after(getFileBrowseButton($("input[name='script_path']")));
    $("input[name='command']").addClass("pathChooser").after(getFileBrowseButton($("input[name='command']")));

    $("*[rel=popover]").popover({
      placement:'left',
      trigger:'hover'
    });
  }

  return module;
};
var Modal = ModalModule($, ko);

/**
 * ID Generator
 * Generate a new ID starting from 1.
 * - Accepts a prefix that will be prepended like so: <prefix>:<id number>
 */
var IdGeneratorModule = function($) {
  return function(options) {
    var self = this;
    $.extend(self, options);

    self.counter = 1;

    self.nextId = function() {
      return ((self.prefix) ? self.prefix + ':' : '') + self.counter++;
    };
  };
};
var IdGenerator = IdGeneratorModule($);

var ModelModule = function($) {
  var module = function(attrs) {
    var self = this;
    $.extend(self, attrs);

    module.prototype.initialize.apply(self, arguments);

    return self;
  };

  $.extend(module.prototype, {
    // Normal stuff
    initialize: function(){},

    toString: function() {
      var self = this;
      return JSON.stringify(self, null, '\t');
    }
  });

  return module;
};

var WorkflowModel = ModelModule($);
$.extend(WorkflowModel.prototype, {
  id: 0,
  name: '',
  description: '',
  start: 0,
  end: 0,
  schema_version: 0.4,
  deployment_dir: '',
  is_shared: true,
  parameters: '[]',
  job_xml: ''
});

var NodeModel = ModelModule($);
$.extend(NodeModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: '',
  workflow: 0,
  child_links: []
});

var ForkModel = ModelModule($);
$.extend(ForkModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'fork',
  workflow: 0,
  child_links: []
});

var DecisionModel = ModelModule($);
$.extend(DecisionModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'decision',
  workflow: 0,
  child_links: []
});

var DistCPModel = ModelModule($);
$.extend(DistCPModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'distcp',
  workflow: 0,
  job_properties: [],
  prepares: [],
  job_xml: '',
  params: [],
  child_links: []
});

var MapReduceModel = ModelModule($);
$.extend(MapReduceModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'mapreduce',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  jar_path: '',
  prepares: [],
  job_xml: '',
  child_links: []
});

var StreamingModel = ModelModule($);
$.extend(StreamingModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'streaming',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  mapper: '',
  reducer: '',
  child_links: []
});

var JavaModel = ModelModule($);
$.extend(JavaModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'java',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  jar_path: '',
  prepares: [],
  job_xml: '',
  main_class: '',
  args: '',
  java_opts: '',
  child_links: []
});

var PigModel = ModelModule($);
$.extend(PigModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'pig',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  prepares: [],
  job_xml: '',
  params: [],
  script_path: '',
  child_links: []
});

var HiveModel = ModelModule($);
$.extend(HiveModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'hive',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  prepares: [],
  job_xml: '',
  params: [],
  script_path: '',
  child_links: []
});

var SqoopModel = ModelModule($);
$.extend(SqoopModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'sqoop',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  prepares: [],
  job_xml: '',
  params: [],
  script_path: '',
  child_links: []
});

var ShellModel = ModelModule($);
$.extend(ShellModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'shell',
  workflow: 0,
  files: [],
  archives: [],
  job_properties: [],
  prepares: [],
  job_xml: '',
  params: [],
  command: '',
  capture_output: false,
  child_links: []
});

var SshModel = ModelModule($);
$.extend(SshModel.prototype, {
  id: 0,
  name: '',
  description: '',
  node_type: 'ssh',
  workflow: 0,
  user: '',
  host: '',
  params: [],
  command: '',
  capture_output: false,
  child_links: []
});

function nodeModelChooser(node_type) {
  switch(node_type) {
    case 'mapreduce':
      return MapReduceModel;
    case 'streaming':
      return StreamingModel;
    case 'java':
      return JavaModel;
    case 'pig':
      return PigModel;
    case 'hive':
      return HiveModel;
    case 'sqoop':
      return SqoopModel;
    case 'shell':
      return ShellModel;
    case 'ssh':
      return SshModel;
    case 'distcp':
      return DistCPModel;
    case 'fork':
      return ForkModel;
    case 'decision':
      return DecisionModel;
    default:
      return NodeModel;
  }
}

var IdGeneratorTable = {
  mapreduce: new IdGenerator({prefix: 'mapreduce'}),
  streaming: new IdGenerator({prefix: 'streaming'}),
  java: new IdGenerator({prefix: 'java'}),
  pig: new IdGenerator({prefix: 'pig'}),
  hive: new IdGenerator({prefix: 'hive'}),
  sqoop: new IdGenerator({prefix: 'sqoop'}),
  shell: new IdGenerator({prefix: 'shell'}),
  ssh: new IdGenerator({prefix: 'ssh'}),
  distcp: new IdGenerator({prefix: 'distcp'}),
  fork: new IdGenerator({prefix: 'fork'}),
  decision: new IdGenerator({prefix: 'decision'}),
  join: new IdGenerator({prefix: 'join'})
};

var NodeModule = function($, IdGeneratorTable) {
  var META_LINKS = ['related', 'default', 'error'];

  var linkTypeChooser = function(parent, child) {
    if (child.node_type() == 'kill') {
      return 'error';
    }
    switch(parent.node_type()) {
      case 'start':
        return (child.node_type() == 'end') ? 'related' : 'to';
      case 'fork':
        return (child.node_type() == 'join') ? 'related' : 'start';
      case 'decision':
        return 'start';
      case 'join':
        return 'to';
      default:
        return 'ok';
    };
  };

  var module = function(workflow, model, registry) {
    var self = this;

    self.map(model);

    self.links = ko.computed(function() {
      var links = self.child_links().filter(function(element, index, arr) {
        return $.inArray(element.name(), META_LINKS) == -1;
      });
      return links;
    });

    self.meta_links = ko.computed(function() {
      var links = self.child_links().filter(function(element, index, arr) {
        return $.inArray(element.name(), META_LINKS) != -1;
      });
      return links;
    });

    self._workflow = workflow;

    self.registry = registry;
    self.children = ko.observableArray([]);
    self.model = model;

    self.edit_template = model.node_type + 'EditTemplate';
    switch(model.node_type) {
    case 'start':
      self.view_template = ko.observable('startTemplate');
    break;

    case 'kill':
    case 'end':
      self.view_template = ko.observable('emptyTemplate');
    break;

    case 'fork':
      self.view_template = ko.observable('forkTemplate');
    break;

    case 'decision':
      self.view_template = ko.observable('decisionTemplate');
    break;

    case 'join':
      self.view_template = ko.observable('joinTemplate');
    break;

    default:
      self.view_template = ko.observable('nodeTemplate');
    break;
    }

    // Data manipulation
    if ('job_properties' in model) {

      self.addProp = function() {
        var prop = { name: ko.observable(""), value: ko.observable("") };
        prop.name.subscribe(function(value) {
          self.job_properties.valueHasMutated();
        });
        prop.value.subscribe(function(value) {
          self.job_properties.valueHasMutated();
        });
        self.job_properties.push(prop);
        // $(".propKey:last").each(addAutoComplete);
      };

      self.removeProp = function(val) {
        self.job_properties.remove(val);
      };
    }

    if ('files' in model) {

      self.addFile = function() {
        var prop = { name: ko.observable(""), dummy: ko.observable("") };
        prop.name.subscribe(function(value) {
          self.files.valueHasMutated();
        });
        prop.dummy.subscribe(function(value) {
          self.files.valueHasMutated();
        });
        self.files.push(prop);
      };

      self.removeFile = function(val) {
        self.files.remove(val);
      };
    }

    if ('archives' in model) {

      self.addArchive = function() {
        var prop = { name: ko.observable(""), dummy: ko.observable("") };
        prop.name.subscribe(function(value) {
          self.archives.valueHasMutated();
        });
        prop.dummy.subscribe(function(value) {
          self.archives.valueHasMutated();
        });
        self.archives.push(prop);
      };

      self.removeArchive = function(val) {
        self.archives.remove(val);
      };
    }

    if ('params' in model) {

      self.addParam = function() {
        var prop = { value: ko.observable(""), type: ko.observable("param") };
        prop.value.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        prop.type.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        self.params.push(prop);
      };

      self.addArgument = function() {
        var prop = { value: ko.observable(""), type: ko.observable("argument") };
        prop.value.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        prop.type.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        self.params.push(prop);
      };

      self.addArg = function() {
        var prop = { value: ko.observable(""), type: ko.observable("arg") };
        prop.value.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        prop.type.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        self.params.push(prop);
      };

      self.addEnvVar = function() {
        var prop = { value: ko.observable(""), type: ko.observable("env-var") };
        prop.value.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        prop.type.subscribe(function(value) {
          self.params.valueHasMutated();
        });
        self.params.push(prop);
      };

      self.removeParam = function(val) {
        self.params.remove(val);
      };
    }

    if ('prepares' in model) {

      self.addPrepareDelete = function() {
        var prop = { value: ko.observable(""), type: ko.observable("delete") };
        prop.value.subscribe(function(value) {
          self.prepares.valueHasMutated();
        });
        prop.type.subscribe(function(value) {
          self.prepares.valueHasMutated();
        });
        self.prepares.push(prop);
      };

      self.addPrepareMkdir = function() {
        var prop = { value: ko.observable(""), type: ko.observable("mkdir") };
        prop.value.subscribe(function(value) {
          self.prepares.valueHasMutated();
        });
        prop.type.subscribe(function(value) {
          self.prepares.valueHasMutated();
        });
        self.prepares.push(prop);
      };

      self.removePrepare = function(val) {
        self.prepares.remove(val);
      };
    }

    self.initialize.apply(self, arguments);

    return self;
  };

  $.extend(module.prototype, {
    // Data.
    children: null,
    model: null,

    // Normal stuff
    /**
     * Called when creating a new node
     */
    initialize: function(workflow, model, registry) {},

    toString: function() {
      return '';
    },

    /**
     * Fetches registry
     */
    getRegistry: function() {
      return registry;
    },

    /**
     * Maps a model to self
     * Called when creating a new node before any thing else
     */
    map: function(model) {
      var self = this;

      var map_params = function(options, subscribe) {
        options.data = ($.type(options.data) == "string") ? $.parseJSON(options.data) : options.data;
        if ($.isArray(options.data)) {
          var mapping =  ko.mapping.fromJS(options.data);
          $.each(mapping(), function(index, value) {
            subscribe(value);
          });
          return mapping;
        } else {
          var mapping =  ko.mapping.fromJS(options.data, {});
          subscribe(mapping);
          return mapping;
        }
      };

      // @see http://knockoutjs.com/documentation/plugins-mapping.html
      var mapping = ko.mapping.fromJS(model, {
        ignore: ['initialize','toString'],
        job_properties: {
          create: function(options) {
            var parent = options.parent;
            var subscribe = function(mapping) {
              mapping.name.subscribe(function(value) {
                parent.job_properties.valueHasMutated();
              });
              mapping.value.subscribe(function(value) {
                parent.job_properties.valueHasMutated();
              });
            };

            return map_params(options, subscribe);
          }
        },
        files: {
          create: function(options) {
            return map_params(options, function() {});
          }
        },
        archives: {
          create: function(options) {
            var parent = options.parent;
            var subscribe = function(mapping) {
              mapping.name.subscribe(function(value) {
                parent.archives.valueHasMutated();
              });
              mapping.dummy.subscribe(function(value) {
                parent.archives.valueHasMutated();
              });
            };

            return map_params(options, subscribe);
          }
        },
        params: {
          create: function(options) {
            var parent = options.parent;
            var subscribe = function(mapping) {
              mapping.value.subscribe(function(value) {
                parent.params.valueHasMutated();
              });
              mapping.type.subscribe(function(value) {
                parent.params.valueHasMutated();
              });
            };

            return map_params(options, subscribe);
          }
        },
        prepares: {
          create: function(options) {
            var parent = options.parent;
            var subscribe = function(mapping) {
              mapping.value.subscribe(function(value) {
                parent.prepares.valueHasMutated();
              });
              mapping.type.subscribe(function(value) {
                parent.prepares.valueHasMutated();
              });
            };

            return map_params(options, subscribe);
          }
        }
      });

      $.extend(self, mapping);
      $.each(mapping, function(key, value) {
        var key = key;
        if (ko.isObservable(self[key])) {
          self[key].subscribe(function(value) {
            model[key] = ko.mapping.toJS(value);
          });
        }
      });

      $.each(self.child_links(), function(index, link) {
        var $index = index;
        link.comment.subscribe(function(value) {
          self.model.child_links[$index].comment = value;
        });

        link.child.subscribe(function(value) {
          self.model.child_links[$index].child = value;
        });
      });

    },

    // Hierarchy manipulation.
    /**
     * Append node to self
     * Does not support multiple children.
     * Ensures single child.
     * Ensures no cycles.
     * 1. Finds all children and attaches them to node (cleans node first).
     * 2. Remove all children from self.
     * 3. Attach node to self.
     */
    append: function(node) {
      var self = this;

      // Not fork nor decision nor self
      if ($.inArray(self.node_type(), ['fork', 'decision']) == -1 && node.id() != self.id()) {
        node.removeAllChildren();
        $.each(self.links(), function(index, link) {
          node.addChild(registry.get(link.child()));
        });
        self.removeAllChildren();
        self.addChild(node);
      }
    },

    /**
     * Find all parents of current node
     */
    findParents: function() {
      var self = this;

      var parents = [];
      $.each(registry.nodes, function(id, node) {
        $.each(node.links(), function(index, link) {
          if (link.child() == self.id()) {
            parents.push(node);
          }
        });
      });
      return parents;
    },

    /**
     * Find all children of current node
     */
    findChildren: function() {
      var self = this;

      var children = [];
      $.each(self.links(), function(index, link) {
        children.push(registry.get(link.child()));
      });

      return children;
    },

    /**
     * Detach current node from the graph
     * 1. Takes children of self node, removes them from self node, and adds them to each parent of self node.
     * 2. The self node is then removed from every parent.
     * 3. Does not support multiple children since we do not automatically fork.
     */
    detach: function() {
      var self = this;

      $.each(self.findParents(), function(index, parent) {
        $.each(self.links(), function(index, link) {
          var node = registry.get(link.child());
          parent.replaceChild(self, node);
        });
      });

      $(self).trigger('detached');

      self.removeAllChildren();
    },

    /**
     * Add child
     * Update child links for this node.
     */
    addChild: function(node) {
      var self = this;
      var link = {
        parent: ko.observable(self.id()),
        child: ko.observable(node.id()),
        name: ko.observable(linkTypeChooser(self, node)),
        comment: ko.observable('')
      };
      self.child_links.unshift(link);
    },

    /**
     * Remove child node
     * 1. Find child node link
     * 2. Remove child node link
     */
    removeChild: function(node) {
      var self = this;
      var spliceIndex = -1;

      $.each(self.child_links(), function(index, link) {
        if (link.child() == node.id()) {
          spliceIndex = index;
        }
      });

      if (spliceIndex > -1) {
        self.child_links.splice(spliceIndex, 1);
      }

      return spliceIndex != -1;
    },

    /**
     * Remove all children
     * Removes all children except for related, default, and error links
     * Note: we hold on to related, default, and error links because
     *  we have to.
     */
    removeAllChildren: function() {
      var self = this;
      var keep_links = [];

      $.each(self.child_links(), function(index, link) {
        if ($.inArray(link.name(), META_LINKS) > -1) {
          keep_links.push(link);
        }
      });

      self.child_links.removeAll();
      $.each(keep_links, function(index, link) {
        self.child_links.push(link);
      });
    },

    /**
     * Replace child node with another node in the following way:
     * 1. Find child index
     * 2. Remove child index
     * 3. Remove and remember every element after child
     * 4. Add replacement node
     * 5. Add every child that was remembered
     */
    replaceChild: function(child, replacement) {
      var self = this;
      var index = -1;

      $.each(self.child_links(), function(i, link) {
        if (link.child() == child.id()) {
          index = i;
        }
      });

      if (index > -1) {
        self.child_links.splice(index, 1);
        var links = self.child_links.splice(index);
        var link = {
          parent: ko.observable(self.id()),
          child: ko.observable(replacement.id()),
          name: ko.observable(linkTypeChooser(self, replacement)),
          comment: ko.observable(''),
        };
        self.child_links.push(link);

        $.each(links, function(index, link) {
          self.child_links.push(link);
        });
      }

      return index != -1;
    },

    isChild: function(node) {
      var self = this;
      var res = false;
      $.each(self.links(), function(index, link) {
        if (link.child() == node.id()) {
          res = true;
        }
      });
      return res;
    },

    erase: function() {
      var self = this;
      self.registry.remove(self.id());
    }
  });

  return module;
};

var Node = NodeModule($, IdGeneratorTable);

var ForkNode = NodeModule($, IdGeneratorTable);
$.extend(ForkNode.prototype, Node.prototype, {
  // Join nodes are connected through 'related' links
  join: function() {
    var self = this;

    var join = null;
    $.each(self.child_links(), function(index, link) {
      if (link.name() == 'related') {
        join = self.registry.get(link.child());
      }
    });
    return join;
  },

  /**
   * Append a node to the current fork
   * Also adds join node to node.
   * When adding the join node, append will remove all the children from the join!
   * We need to make sure the join remembers its children.
   * NOTE: Cannot append a fork! Use addChild or replaceChild instead!
   */
  append: function(node) {
    var self = this;

    if (node.node_type() != 'fork') {
      var join = self.join();
      if (join.id() != node.id()) {
        var children = join.findChildren();

        self.addChild(node);
        node.append(join);

        // remember children
        $.each(children, function(index, child) {
          join.addChild(child);
        });
      }
    }
  },

  /**
   * Replace child node with another node
   * 1. Remove child if the replacement is related join
   * 2. Apply Node.replaceChild for all other causes
   * NOTE: can assume the only join this fork will ever see is the related join!
   * This is because the related will always be the closest join for children.
   * Also, the operations allowed that would make this all possible: detach, append;
   * are inherently going to remove any other joins if they exist.
   * This is also easier given nodes are contained within Forks!
   */
  replaceChild: function(child, replacement) {
    var self = this;

    var ret = true;
    if (self.join().id() == replacement.id()) {
      ret = self.removeChild(child);
    } else {
      ret = Node.prototype.replaceChild.apply(self, arguments);
    }

    var links = self.links().filter(function(element, index, arr) {
      return self.registry.get(element.child()).node_type() != 'join';
    });

    if (links.length < 2) {
      self.detach();
      self.join().detach();

      self.erase();
      self.join().erase();
    }

    return ret;
  },

  /**
   * Converts fork node into decision node in the following way:
   * 1. Copies contents of current fork node into a new decision node
   * 2. Detach fork node
   * 3. Erase fork node
   * 4. Append decision node to parent
   */
  convertToDecision: function() {
    var self = this;
    var join = self.join();
    var end = null;
    var child = join.findChildren()[0];

    if (child.findParents().length == 1) {
      end = child;
    }

    // Attaches child of join to parents of join
    join.detach();

    var decision_model = new DecisionModel({
      id: IdGeneratorTable['decision'].nextId(),
      name: self.name(),
      description: self.description(),
      node_type: 'decision',
      workflow: self.workflow(),
      child_links: self.model.child_links
    });

    var default_link = {
      parent: decision_model.id,
      child: self._workflow.end(),
      name: 'default',
      comment: ''
    };

    decision_model.child_links.push(default_link);

    $.each(decision_model.child_links, function(index, link) {
      link.parent = decision_model.id;
    });

    var decision_node = new DecisionNode(self._workflow, decision_model, self.registry);
    if (end) {
      decision_node.addEnd(end);
    }
    var parents = self.findParents();
    decision_node.removeChild(join);

    join.erase();
    self.erase();

    self.registry.add(decision_node.id(), decision_node);

    $.each(parents, function(index, parent) {
      parent.replaceChild(self, decision_node);
    });

  }
});

var DecisionNode = NodeModule($, IdGeneratorTable);
$.extend(DecisionNode.prototype, ForkNode.prototype, {
  initialize: function(workflow, model, registry) {
    var self = this;
    var registry = registry;

    var end = null;

    $.each(self.child_links(), function(index, link) {
      if (link.name() == 'related') {
        $(registry).bind('registry:add', function(e) {
          var end = self.end();
          if (end) {
            self.removeEnd();
            self.addEnd(end);
            $(registry).unbind(e);
          }
        });
      }
    });
  },

  // Only a single end allowed for now!
  // Finds end for branch
  findEnd: function( ) {
    var self = this;

    var end = self.end();

    if (!end) {
      return self._findEnd( self, 0 );
    }

    return end;
  },

  _findEnd: function( node, count ) {
    var self = this;

    var end = null;

    if (node.findParents().length > 1 && --count == 0) {
      return node;
    }

    if (node.node_type() == 'decision' || node.node_type() == 'fork') {
      count++;
    }

    $.each(node.findChildren(), function(index, node) {
      if (end == null) {
        end = self._findEnd(node, count);
      }
    });

    return end;
  },

  end: function() {
    var self = this;

    var end = null;

    $.each(self.child_links(), function(index, link) {
      if (link.name() == 'related') {
        end = self.registry.get(link.child());
      }
    });

    return end;
  },

  addEnd: function(node) {
    var self = this;

    self.child_links.push({
      parent: ko.observable(self.id()),
      child: ko.observable(node.id()),
      name: ko.observable('related'),
      comment: ko.observable(''),
    });

    $(node).one('detached', function(e) {
      var end = self.end();

      if (end.links().length == 1) {
        self.removeEnd();
        var new_end = self.findEnd();
        self.addEnd(new_end);
      } else {
        // Should never hit this case.
        self.removeEnd();
      }
    });
  },

  removeEnd: function() {
    var self = this;

    var spliceIndex = -1;

    $.each(self.child_links(), function(index, link) {
      if (link.name() == 'related') {
        spliceIndex = index;
      }
    });

    if (spliceIndex > -1) {
      var end = registry.get(self.child_links()[spliceIndex].child());

      self.child_links.splice(spliceIndex, 1);
      return true;
    }

    return false;
  },

  isChild: function(node) {
    var self = this;

    return self._isChild(node, self, 0);
  },

  _isChild: function( test_child, node, count ) {
    var self = this;

    var result = node.id() == test_child.id();

    if (node.findParents().length > 1 && --count == 0) {
      return result;
    }

    if (node.node_type() == 'decision' || node.node_type() == 'fork') {
      count++;
    }

    $.each(node.findChildren(), function(index, node) {
      if (!result) {
        result = self._isChild(test_child, node, count);
      }
    });

    return result;
  },

  /**
   * Append a node to the current decision
   * Also appends end node to node.
   * NOTE: Cannot append a decision! Use addChild or replaceChild instead!
   */
  append: function(node) {
    var self = this;

    var end = self.findEnd();

    if (end.id() == node.id()) {
      return false;
    }

    self.addChild(node);
    node.append(end);

    return true;
  },

  /**
   * Replace child node with another node
   * 1. Remove child if the replacement is end
   * 2. Apply Node.replaceChild for all other causes
   */
  replaceChild: function(child, replacement) {
    var self = this;

    var ret = true;
    var end = self.findEnd();

    if (end && end.id() == replacement.id()) {
      ret = self.removeChild(child);
    } else {
      ret = Node.prototype.replaceChild.apply(self, arguments);
    }

    if (self.links().length < 2) {
      self.detach();
      self.erase();
    }

    return ret;
  }
});

/**
 * Workflow module
 */
var WorkflowModule = function($, NodeModelChooser, Node, ForkNode, DecisionNode, IdGeneratorTable) {
  var module = function(options) {
    var self = this;

    // @see http://knockoutjs.com/documentation/plugins-mapping.html
    var mapping = ko.mapping.fromJS(options.model, {
      ignore: ['initialize','toString'],
      job_properties: {
        create: function(options) {
          var mapping = ko.mapping.fromJS($.parseJSON(options.data) || options.data);
          var parent = options.parent;
          mapping.name.subscribe(function(value) {
            parent.job_properties.valueHasMutated();
          });
          mapping.value.subscribe(function(value) {
            parent.job_properties.valueHasMutated();
          });
          return mapping;
        }
      },
      parameters: {
        // Will receive individual objects to subscribe.
        // Containing array is mapped automagically
        create: function(options) {
          var mapping =  ko.mapping.fromJS($.parseJSON(options.data) || options.data);
          var parent = options.parent;
          mapping.name.subscribe(function(value) {
            parent.parameters.valueHasMutated();
          });
          mapping.value.subscribe(function(value) {
            parent.parameters.valueHasMutated();
          });
          return mapping;
        }
      }
    });

    $.extend(self, mapping);
    $.each(mapping['__ko_mapping__'].mappedProperties, function(key, value) {
      var key = key;
      self[key].subscribe(function(value) {
        workflow.model.is_dirty = true;
        self.model[key] = ko.mapping.toJS(value);
      });
    });

    self.model = options.model;
    self.registry = options.registry;
    self.options = options;
    self.el = $('#workflow');
    self.nodes = ko.observableArray([]);
    self.kill = null;

    self.url = ko.computed(function() {
      return '/oozie/workflows/' + self.id()
    });

    // Events
    self.el.on('workflow:rebuild', function() {
      self.rebuild();
    });
    self.el.on('workflow:events:load', function() {
      self.dragAndDropEvents();
    });
    self.el.on('workflow:droppables:load', function() {
      self.droppables();
    });
    self.el.on('workflow:draggables:load', function() {
      self.draggables();
    });

    self.dragAndDropEvents();
    self.el.trigger('workflow:events:loaded');

    module.prototype.initialize.apply(self, arguments);

    return self;
  };

  $.extend(module.prototype, {
    // Normal stuff
    initialize: function(options) {
      var self = this;

      if ('data' in options) {

        // Initialize nodes
        if (options.data.nodes) {
          self.registry.clear();

          $.each(options.data.nodes, function(index, node) {
            var NodeModel = NodeModelChooser(node.node_type);
            var model = new NodeModel(node);
            var temp = null;
            switch(node.node_type) {
              case 'fork':
                temp = new ForkNode(self, model, self.registry);
              break;
              case 'decision':
                temp = new DecisionNode(self, model, self.registry);
              break;
              case 'kill':
                temp = self.kill = new Node(self, model, self.registry);
              break;
              default:
                temp = new Node(self, model, self.registry);
              break;
            }

            if ('main_class' in temp) {
              console.log(temp.main_class());
            }
            self.registry.add(temp.id(), temp);
          });
        }

        // Update data
        $.each(options.data, function (key, value) {
          if (key in self) {
            switch(key) {
              case 'job_properties':
              case 'parameters':
                // These may be serialized JSON data since that is how they are stored
                self[key].removeAll();
                var arr = $.parseJSON(value) || value;

                $.each(arr, function(index, obj) {
                  var mapping = ko.mapping.fromJS(obj);
                  mapping.name.subscribe(function(value) {
                    self[key].valueHasMutated();
                  });
                  mapping.value.subscribe(function(value) {
                    self[key].valueHasMutated();
                  });
                  self[key].push(mapping);
                });
              break;

              case 'nodes':
              break;

              default:
                self[key](value);
              break;
            }
          }
        });
        workflow.model.is_dirty = false;
      }
    },

    toString: function() {
      return '';
      var s = '[';
      $.each(self.registry.nodes, function(key, node) {
        s += node.model.toString() + ",\n";
      });
      return s + ']';
    },

    // Data manipulation
    cloneNode: function(node, event) {
      var self = this;

      var model_copy = $.extend(true, {}, node.model);
      var template = model_copy.node_type + 'EditTemplate';
      var NodeModel = NodeModelChooser(node.node_type());

      model_copy.id = IdGeneratorTable[model_copy.node_type].nextId();
      model_copy.name += '-copy';
      model_copy.child_links = [];

      var model = new NodeModel(model_copy);
      var new_node = new Node(self, model, self.registry);

      self.registry.add(new_node.id(), new_node);

      new_node.addChild(self.kill);
      node.append(new_node);

      self.rebuild();

      modal.setTemplate(template);
      modal.show(new_node);
      modal.recenter(280, 250);
      modal.addDecorations();

      // $(".propKey").each(addAutoComplete);

      workflow.model.is_dirty = true;
    },

    removeNode: function(node, event) {
      var self = this;

      node.detach();
      node.erase();

      self.rebuild();

      workflow.model.is_dirty = true;
    },

    save: function( options ) {},

    load: function() {
      var self = this;

      $.getJSON(self.url(), function(data) {
        if (data.status == 0) {
          self.reload(data.data);
        } else {
          $.jHueNotify.error("${ _('Received invalid response from server: ') }" + JSON.stringify(data));
        }
      });
    },

    reload: function(data) {
      var self = this;

      // Clear all children
      $.each(self.registry.nodes, function(index, node) {
        node.children.removeAll();
      });
      self.nodes.removeAll();

      self.initialize({data: data});
      self.rebuild();
      self.el.trigger('workflow:loaded');
    },

    addParameter: function(data, event) {
      var self = this;
      var prop = { name: ko.observable(""), value: ko.observable("") };
      // force bubble up to containing observable array.
      prop.name.subscribe(function(){
        self.parameters.valueHasMutated();
      });
      prop.value.subscribe(function(){
        self.parameters.valueHasMutated();
      });
      self.parameters.push(prop);
    },

    removeParameter: function(data, event) {
      var self = this;
      self.parameters.remove(data);
    },

    addJobProperty: function(data, event) {
      var self = this;
      var prop = { name: ko.observable(""), value: ko.observable("") };
      // force bubble up to containing observable array.
      prop.name.subscribe(function(){
        self.parameters.valueHasMutated();
      });
      prop.value.subscribe(function(){
        self.parameters.valueHasMutated();
      });
      self.job_properties.push(prop);
    },

    removeJobProperty: function(data, event) {
      var self = this;
      self.job_properties.remove(data);
    },

    // Workflow UI
    // Function to build nodes... recursively.
    build: function() {
      var self = this;

      var maximum = 50;
      var count = 0;

      var methodChooser = function(node, collection, skip_parents_check) {
        if (count++ >= maximum) {
          if (window.error) {
            console.error('Hit maximum number of node recursion: ' + maximum);
          }
          return null;
        }

        if (!node) {
          return node;
        }

        var parents = node.findParents();

        // Found end of decision node or found join!
        if (parents.length > 1 && !skip_parents_check) {
          return node;
        }

        switch(node.node_type()) {
        case 'start':
        case 'end':
        case 'kill':
        case 'fork':
        case 'decision':
        case 'join':
          return control(node, collection);
        default:
          return normal(node, collection);
        }
      };

      var normal = function(node, collection) {
        collection.push(node);

        var retNode = null;
        $.each(node.links(), function(index, link) {
          var next_node = self.registry.get(link.child());
          retNode = methodChooser(next_node, collection, false, true);
        });
        return retNode;
      };

      var control = function(node, collection, skip_parents_check) {
        switch(node.node_type()) {
          case 'start':
          case 'end':
          case 'kill':
          case 'join':
            return normal(node, collection, false, true);

          case 'fork':
            collection.push(node);

            // Wait for join.
            // Iterate through all children and add them to child collection.
            var join = null;
            $.each(node.links(), function(index, link) {
              var next_node = self.registry.get(link.child());
              var collection = ko.observableArray([]);
              node.children.push(collection);
              join = methodChooser(next_node, collection, false, true);
            });

            // Add join to collection, then find its single child.
            return methodChooser(join, collection, true, true);

          case 'decision':
            collection.push(node);

            // Waits for end, then runs through children of end node
            var end = null;
            $.each(node.links(), function(index, link) {
              var next_node = self.registry.get(link.child());
              var collection = ko.observableArray([]);
              node.children.push(collection);
              end = methodChooser(next_node, collection, true, true);
            });

            // Add end
            if (node.end() && end.id() == node.end().id()) {
              return methodChooser(end, collection, true, true);
            } else {
              return end;
            }

          default:
            // Should never get here.
            return node;
        }
      };

      methodChooser(self.registry.get(self.start()), self.nodes, false, true);
    },

    rebuild: function() {
      var self = this;

      // Clear all children
      $.each(self.registry.nodes, function(index, node) {
        node.children.removeAll();
      });
      self.nodes.removeAll();

      // Rebuild
      self.build();
      self.draggables();
      self.droppables();

      self.el.trigger('workflow:rebuilt');
    },

    draggables: function() {
      var self = this;

      self.el.find('.node-action').each(function(index, el) {
        if (!$(el).hasClass('ui-draggable')) {
          $(el).draggable({
            containment: [ self.el.offset().left - 10, self.el.offset().top - 10,
                           self.el.offset().left + self.el.outerWidth(), self.el.offset().top + self.el.outerHeight() ],
            handle: '.node',
            refreshPositions: true,
            revert: true
          });
        }
      });
    },

    droppables: function() {
      var self = this;

      self.el.find('.node-link').each(function(index, el) {
        $(el).droppable({
          'hoverClass': 'node-link-hover',
          'greedy': true,
          'accept': '.node-action',
          'tolerance': 'pointer'
        });
      });

      self.el.find('.node-decision-end').each(function(index, el) {
        $(el).droppable({
          'hoverClass': 'node-link-hover',
          'greedy': true,
          'accept': '.node-action',
          'tolerance': 'pointer'
        });
      });

      self.el.find('.node-fork .action').each(function(index, el) {
        $(el).droppable({
          'hoverClass': 'node-fork-hover',
          'greedy': true,
          'accept': '.node-action',
          'tolerance': 'pointer'
        });
      });

      self.el.find('.node-decision .action').each(function(index, el) {
        $(el).droppable({
          'hoverClass': 'node-fork-hover',
          'greedy': true,
          'accept': '.node-action',
          'tolerance': 'pointer'
        });
      });

      self.el.find('.node-action .action').each(function(index, el) {
        $(el).droppable({
          'hoverClass': 'node-action-hover',
          'greedy': true,
          'accept': '.node-action',
          'tolerance': 'pointer'
        });
      });
    },

    dragAndDropEvents: function() {
      var self = this;

      // Build event delegations.
      // Drop on node link
      self.el.on('drop', '.node-link', function(e, ui) {
        // draggable should be a node.
        // droppable should be a link.
        var draggable = ko.contextFor(ui.draggable[0]).$data;
        var droppable = ko.contextFor(this).$data;

        // If newParent is fork, prepend to child instead.
        // This will make it so that we can drop and drop to the top of a node list within a fork.
        var newParent = self.registry.get(droppable.parent());

        if (newParent.id() != draggable.id()) {
          if (newParent.isChild(draggable)) {
            if (draggable.findParents().length > 1) {
              // End of decision tree is being dragged to the bottom of a branch
              draggable.detach();
              newParent.append(draggable);
              workflow.model.is_dirty = true;
              self.rebuild();
            }
          } else {
            switch(newParent.node_type()) {
            case 'fork':
            case 'decision':
              draggable.detach();

              var child = self.registry.get(droppable.child());
              newParent.replaceChild(child, draggable);
              draggable.addChild(child);
            break;

            case 'join':
              // Join may disappear when we detach...
              // Remember its children and append to child.
              var parents = newParent.findParents();
              draggable.detach();

              if (newParent.findParents().length < 2) {
                $.each(parents, function(index, parent) {
                  parent.append(draggable);
                });
              } else {
                newParent.append(draggable);
              }
            break;

            default:
              draggable.detach();
              newParent.append(draggable);
            break;
            }
            workflow.model.is_dirty = true;
            self.rebuild();
          }
        }

        // Prevent bubbling events
        return false;
      });

      // Drop on fork
      self.el.on('drop', '.node-fork', function(e, ui) {
        // draggable should be a node.
        // droppable should be a fork.
        var draggable = ko.contextFor(ui.draggable[0]).$data;
        var droppable = ko.contextFor(this).$data;

        if (!droppable.isChild(draggable) && droppable.id() != draggable.id()) {
          draggable.detach();
          droppable.append(draggable);

          self.rebuild();
        }

        // Prevent bubbling events
        return false;
      });

      // Drop on decision
      self.el.on('drop', '.node-decision', function(e, ui) {
        // draggable should be a node.
        // droppable should be a fork.
        var draggable = ko.contextFor(ui.draggable[0]).$data;
        var droppable = ko.contextFor(this).$data;

        if (!droppable.isChild(draggable) && droppable.id() != draggable.id()) {
          draggable.detach();
          droppable.append(draggable);

          self.rebuild();
        }

        // Prevent bubbling events
        return false;
      });

      // Drop on decision end link
      self.el.on('drop', '.node-decision-end', function(e, ui) {
        // draggable should be a node.
        // droppable should be a decision end link... which should give us the decision node.
        var draggable = ko.contextFor(ui.draggable[0]).$data;
        var droppable = ko.contextFor(this).$data;
        var end = droppable.findEnd(droppable);

        if (end.id() != draggable.id()) {
          draggable.detach();

          $.each(end.findParents(), function(index, parent) {
            if (droppable.isChild(parent)) {
              parent.append(draggable);
            }
          });

          droppable.removeEnd();
          droppable.addEnd(draggable);

          self.rebuild();
        }

        // Prevent bubbling events
        return false;
      });

      // Drop on action
      self.el.on('drop', '.node-action', function(e, ui) {
        // draggable should be a node.
        // droppable should be a node.
        var draggable = ko.contextFor(ui.draggable[0]).$data;
        var droppable = ko.contextFor(this).$data;

        // Create a fork and join programatically.
        var newParents = droppable.findParents();

        // skip forking beneathe a decision node
        if (droppable.id() != draggable.id() && newParents.length == 1 && draggable.findParents().length == 1) {
          var ForkModel = NodeModelChooser('fork');
          var JoinModel = NodeModelChooser('join');

          var fork = new ForkModel({
            id: IdGeneratorTable['fork'].nextId(),
            description: "",
            workflow: self.id,
            node_type: "fork",
            child_links: []
          });
          var forkNode = new ForkNode(self, fork, self.registry);

          var join = new JoinModel({
            id: IdGeneratorTable['join'].nextId(),
            description: "",
            workflow: self.id,
            node_type: "join",
            child_links: []
          });
          var joinNode = new Node(self, join, self.registry);

          self.registry.add(forkNode.id(), forkNode);
          self.registry.add(joinNode.id(), joinNode);

          forkNode.addChild(joinNode);

          // Handles fork creation.
          $.each(newParents, function(index, parent) {
            parent.replaceChild(droppable, forkNode);
          });
          draggable.detach();
          forkNode.append(draggable);
          forkNode.append(droppable);

          self.rebuild();
        }

        // Prevent bubbling events.
        return false;
      });
    }
  });

  return module;
};
var Workflow = WorkflowModule($, nodeModelChooser, Node, ForkNode, DecisionNode, IdGeneratorTable);