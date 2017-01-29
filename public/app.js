var TWIDTH = 1.5;
function createElement(data) {
    var e = document.createElement(data.tag);
    if (data.idbase) {
        e.id = data.idbase + this.id;
    }
    if (data.contents !== undefined) {
        e.innerHTML = data.contents;
    }
    if (data.class !== undefined) {
        e.classList.add(data.class);
    }
    if (data.draggable) {
        e.draggable = true;
    }
    return e;
}
var DragElement = (function () {
    function DragElement(grabElement, move, begin) {
        var _this = this;
        this.setVariation(1);
        this._move = move;
        this._begin = begin;
        grabElement.addEventListener('dragstart', function (e) { _this.begin(e); }, false);
        grabElement.addEventListener('drag', function (e) { _this.drag(e); }, false);
        grabElement.addEventListener('dragend', function (e) { _this.end(e); }, false);
    }
    DragElement.prototype.setVariation = function (variation) { this.variation = variation; };
    DragElement.prototype.getVariation = function () { return this.variation; };
    DragElement.prototype.begin = function (e) {
        this.x = this.vx = e.x;
        this.y = this.vy = e.y;
        if (this._begin) {
            this._begin(e, this);
        }
    };
    DragElement.prototype.drag = function (e) {
        if (e.x === 0 && e.y === 0) {
            return;
        }
        if (Math.abs(this.vx - e.x) < this.variation && Math.abs(this.vy - e.y) < this.variation) {
            return;
        }
        this.vx = e.x;
        this.vy = e.y;
        this._move(e.x - this.x, e.y - this.y, e, this);
    };
    DragElement.prototype.end = function (e) {
        this._move(e.x - this.x, e.y - this.y, e, this);
    };
    return DragElement;
}());
var TaskHeader = (function () {
    function TaskHeader(parent, name) {
        var _this = this;
        this.parent = parent;
        this.header = createElement({ tag: 'h3' });
        this.h = createElement({ tag: 'input', idbase: 'h', draggable: true });
        this.h.addEventListener('dblclick', function () { _this.h.readOnly = false; _this.h.draggable = false; }, false);
        new DragElement(this.h, function (x, y, e, d) { _this.move(x, e, d); }, function (e, d) { _this.setVariation(d); });
        this.setName(name);
        this.h.readOnly = true;
        var toggle = createElement({ tag: 'span', class: 'toggleOpen' });
        toggle.addEventListener('click', function () { parent.getElement().classList.toggle('open'); }, false);
        var grip = createElement({ tag: 'span', draggable: true, class: 'grip' });
        new DragElement(grip, function (x, y, e, d) { _this.resize(x, e, d); }, function (e, d) { _this.setVariation(d); });
        this.header.appendChild(this.h);
        this.header.appendChild(toggle);
        this.header.appendChild(grip);
    }
    TaskHeader.prototype.setName = function (name) {
        if (name !== undefined) {
            this.name = name;
        }
        this.h.value = this.name;
    };
    TaskHeader.prototype.setVariation = function (d) {
        d.setVariation(parseInt(document.documentElement.style.fontSize || '10') * TWIDTH);
    };
    TaskHeader.prototype.move = function (x, e, d) {
        if (!this.h.readOnly) {
            return;
        }
        var size = d.getVariation();
        if (e.type === 'dragend') {
            this.parent.move(this.parent.getBegin() + Math.floor(x / size), true);
        }
        else {
            this.parent.move(this.parent.getBegin() + Math.floor(x / size));
        }
    };
    TaskHeader.prototype.resize = function (x, e, d) {
        if (!this.h.readOnly) {
            return;
        }
        var size = d.getVariation();
        console.log(this.parent.getLength() + Math.abs(x / size), x, size);
        if (e.type === 'dragend') {
            this.parent.setWidth(this.parent.getLength() + Math.floor(x / size), true);
        }
        else if (1 < this.parent.getLength() + Math.abs(x / size)) {
            this.parent.setWidth(this.parent.getLength() + Math.floor(x / size));
        }
    };
    TaskHeader.prototype.getElement = function () { return this.header; };
    return TaskHeader;
}());
var TaskData = (function () {
    function TaskData(id, name, days) {
        this.id = id;
        this.m = createElement({ tag: 'div', idbase: 't' });
        this.m.dataset['id'] = this.id;
        this.move(0, true);
        this.setWidth(days, true);
        this.h = new TaskHeader(this, name);
        this.m.appendChild(this.h.getElement());
    }
    TaskData.prototype.getID = function () { return this.id; };
    TaskData.prototype.setName = function (name) { this.h.setName(name); };
    TaskData.prototype.setWidth = function (days, update) {
        if (update === void 0) { update = false; }
        if (update) {
            this.days = days;
        }
        this.m.style.width = (days * TWIDTH) + 'rem';
    };
    TaskData.prototype.move = function (days, update) {
        if (update === void 0) { update = false; }
        if (update) {
            this.begin = days;
        }
        this.m.style.marginLeft = (days * TWIDTH) + 'rem';
    };
    TaskData.prototype.render = function () {
        return this.m;
    };
    TaskData.prototype.getElement = function () { return this.m; };
    TaskData.prototype.getBegin = function () { return this.begin; };
    TaskData.prototype.getLength = function () { return this.days; };
    return TaskData;
}());
var TaskLine = (function () {
    function TaskLine(begin, end) {
        this.tasks = [];
        this.begin = begin || new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);
        this.end = end || new Date(this.begin.getTime() + 31 * 24 * 60 * 60 * 1000);
    }
    TaskLine.prototype._setDate = function (e, value, length) {
        if (length === void 0) { length = 0; }
        e.innerHTML = value;
        if (length <= 0) {
            return;
        }
        e.style.width = (length * TWIDTH) + 'rem';
    };
    TaskLine.prototype.setDate = function (id, list) {
        var e = document.getElementById(id);
        if (!e) {
            return;
        }
        while (e.children.length <= list.length) {
            e.appendChild(document.createElement('li'));
        }
        while (list.length < e.children.length) {
            e.removeChild(e.children[list.length]);
        }
        for (var i = 0; i < e.children.length; ++i) {
            if (typeof list[i] === 'string') {
                this._setDate(e.children[i], list[i]);
            }
            else {
                this._setDate(e.children[i], list[i].label, list[i].length);
            }
        }
    };
    TaskLine.prototype.addTask = function (data) {
        if (data instanceof Array) {
            (_a = this.tasks).push.apply(_a, data);
        }
        else {
            this.tasks.push(data);
        }
        var _a;
    };
    TaskLine.prototype.renderDate = function () {
        var date = new Date(this.begin.getTime());
        var m = this.begin.getMonth();
        var mlist = [{ label: (m + 1) + '', length: 1 }];
        var dlist = [this.begin.getDate() + ''];
        while (date.getTime() <= this.end.getTime()) {
            date.setDate(date.getDate() + 1);
            if (m !== date.getMonth()) {
                m = date.getMonth();
                mlist.push({ label: (m + 1) + '', length: 1 });
            }
            else {
                ++mlist[mlist.length - 1].length;
            }
            dlist.push(date.getDate() + '');
        }
        var e = document.getElementById('date');
        if (!e) {
            return;
        }
        e.style.width = (dlist.length * TWIDTH) + 'rem';
        this.setDate('month', mlist);
        this.setDate('day', dlist);
    };
    TaskLine.prototype.renderTasks = function () {
        var e = document.getElementById('tasks');
        if (!e) {
            return;
        }
        this.tasks.forEach(function (task) {
            e.appendChild(task.render());
        });
    };
    TaskLine.prototype.render = function (updateDate) {
        if (updateDate === void 0) { updateDate = true; }
        if (updateDate) {
            this.renderDate();
        }
        this.renderTasks();
    };
    return TaskLine;
}());
var lfetch;
(function (lfetch) {
    function createRequest(success, failure) {
        loading(false);
        try {
            var req = new XMLHttpRequest();
            req.onreadystatechange = changeState(req, success, failure);
            return req;
        }
        catch (e) { }
        return null;
    }
    function changeState(req, success, failure) {
        return function () {
            if (req.readyState !== 4) {
                return;
            }
            if (req.status == 0) {
                if (failure) {
                    failure({}, req);
                }
                return;
            }
            if ((200 <= req.status && req.status < 300) || (req.status == 304)) {
                if (success) {
                    try {
                        var data = JSON.parse(req.responseText);
                        success(data, req);
                    }
                    catch (e) {
                        if (failure) {
                            failure({}, req);
                        }
                    }
                }
            }
            else {
                if (failure) {
                    try {
                        var data = JSON.parse(req.responseText);
                        failure(data, req);
                    }
                    catch (e) {
                        if (failure) {
                            failure({}, req);
                        }
                    }
                }
            }
        };
    }
    function loading(begin) {
        var e = document.getElementById('loading');
        if (!e) {
            return;
        }
        e.classList[begin ? 'remove' : 'add']('hidden');
    }
    lfetch.loading = loading;
    function get(url, success, failure) {
        loading(true);
        var req = createRequest(success, failure);
        if (!req) {
            return false;
        }
        req.open('GET', url);
        req.send(null);
    }
    lfetch.get = get;
    function post(url, data, success, failure) {
        loading(true);
        var req = createRequest(success, failure);
        if (!req) {
            return false;
        }
        req.open('POST', url);
        req.send(JSON.stringify(data));
    }
    lfetch.post = post;
})(lfetch || (lfetch = {}));
var App;
(function (App) {
    function hidden(id, hide) {
        var e = document.getElementById(id);
        if (!e) {
            return false;
        }
        e.classList[hide ? 'add' : 'remove']('hidden');
        return true;
    }
    function setContents(id, content) {
        var e = document.getElementById(id);
        if (!e) {
            return;
        }
        e.innerHTML = content;
    }
    function error(title, message) {
        if (title === void 0) { title = ''; }
        if (message === void 0) { message = ''; }
        if (!title && !message) {
            hidden('error', false);
            return;
        }
        hidden('error', true);
        setContents('emessage', message || '');
    }
    function afterLogin(data) {
        console.log(data);
        window.history.replaceState(null, '', '/');
        hidden('main', false);
        hidden('login', true);
        var tl = new TaskLine();
        tl.addTask(new TaskData('1', 'test', 7));
        tl.addTask(new TaskData('1', 'test2', 7));
        tl.render();
    }
    function init() {
        lfetch.get('/api/user', afterLogin, function (data) {
            var message = data.message || 'Unknown error.';
        });
    }
    App.init = init;
})(App || (App = {}));
