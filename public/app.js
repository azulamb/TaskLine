var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var API = (function () {
    function API() {
    }
    API.userInfo = function (success, failure) {
        lfetch.get('/api/user', success, failure);
    };
    return API;
}());
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
var TaskElement = (function () {
    function TaskElement() {
    }
    TaskElement.prototype.initElement = function (tag, idbase) {
        if (idbase === void 0) { idbase = ''; }
        this.element = createElement({ tag: tag, idbase: idbase });
    };
    TaskElement.prototype.getElement = function () { return this.element; };
    return TaskElement;
}());
var TaskHeader = (function (_super) {
    __extends(TaskHeader, _super);
    function TaskHeader(parent, name) {
        var _this = _super.call(this) || this;
        _this.initElement('h3');
        _this.parent = parent;
        _this.h = createElement({ tag: 'input', idbase: 'h', draggable: true });
        _this.h.addEventListener('dblclick', function () { _this.h.readOnly = false; _this.h.draggable = false; }, false);
        _this.setName(name);
        _this.h.readOnly = true;
        new DragElement(_this.h, function (x, y, e, d) { _this.move(x, e, d); }, function (e, d) { _this.setVariation(d); });
        var toggle = createElement({ tag: 'span', class: 'toggleOpen' });
        toggle.addEventListener('click', function () { parent.getElement().classList.toggle('open'); }, false);
        var grip = createElement({ tag: 'span', draggable: true, class: 'grip' });
        new DragElement(grip, function (x, y, e, d) { _this.resize(x, e, d); }, function (e, d) { _this.setVariation(d); });
        _this.element.appendChild(_this.h);
        _this.element.appendChild(toggle);
        _this.element.appendChild(grip);
        return _this;
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
        if (e.type === 'dragend') {
            var days = this.parent.getLength() + Math.floor(x / size);
            this.parent.setWidth(days < 2 ? 2 : days, true);
        }
        else if (1 < this.parent.getLength() + Math.floor(x / size)) {
            this.parent.setWidth(this.parent.getLength() + Math.floor(x / size));
        }
    };
    return TaskHeader;
}(TaskElement));
var TaskFooter = (function (_super) {
    __extends(TaskFooter, _super);
    function TaskFooter() {
        var _this = _super.call(this) || this;
        _this.initElement('div');
        return _this;
    }
    return TaskFooter;
}(TaskElement));
var TaskWorker = (function (_super) {
    __extends(TaskWorker, _super);
    function TaskWorker(name, cls) {
        var _this = _super.call(this) || this;
        _this.cls = cls;
        _this.initElement('ul');
        _this.element.appendChild(createElement({ tag: 'li', contents: name }));
        return _this;
    }
    TaskWorker.prototype.setLength = function (days, update) {
        var _this = this;
        if (update === void 0) { update = false; }
        var _loop_1 = function () {
            var e = createElement({ tag: 'li' });
            e.addEventListener('click', function () {
                e.classList.toggle(_this.cls);
            }, false);
            this_1.element.appendChild(e);
        };
        var this_1 = this;
        while (this.element.children.length <= days) {
            _loop_1();
        }
    };
    return TaskWorker;
}(TaskElement));
var TaskWorkers = (function (_super) {
    __extends(TaskWorkers, _super);
    function TaskWorkers() {
        var _this = _super.call(this) || this;
        _this.initElement('div');
        _this.workers = [];
        return _this;
    }
    TaskWorkers.prototype.add = function (worker) {
        this.workers.push(worker);
        this.element.appendChild(worker.getElement());
    };
    TaskWorkers.prototype.setLength = function (days, update) {
        if (update === void 0) { update = false; }
        this.workers.forEach(function (w) { w.setLength(days, update); });
    };
    return TaskWorkers;
}(TaskElement));
var TaskData = (function (_super) {
    __extends(TaskData, _super);
    function TaskData(id, name, days) {
        var _this = _super.call(this) || this;
        _this.initElement('div', 't');
        _this.id = id;
        _this.element.dataset['id'] = _this.id;
        _this.move(0, true);
        _this.header = new TaskHeader(_this, name);
        _this.workers = new TaskWorkers();
        _this.footer = new TaskFooter();
        _this.workers.add(new TaskWorker('Plan', 'wc0'));
        _this.workers.add(new TaskWorker('Design', 'wc1'));
        _this.workers.add(new TaskWorker('Web', 'wc2'));
        _this.workers.add(new TaskWorker('Debug', 'wc3'));
        _this.element.appendChild(_this.header.getElement());
        _this.element.appendChild(_this.workers.getElement());
        _this.element.appendChild(_this.footer.getElement());
        _this.setWidth(days, true);
        return _this;
    }
    TaskData.prototype.getID = function () { return this.id; };
    TaskData.prototype.setName = function (name) { this.header.setName(name); };
    TaskData.prototype.setWidth = function (days, update) {
        if (update === void 0) { update = false; }
        if (update) {
            this.days = days;
        }
        this.element.style.width = (days * TWIDTH) + 'rem';
        this.workers.setLength(days, update);
    };
    TaskData.prototype.move = function (days, update) {
        if (update === void 0) { update = false; }
        if (update) {
            this.begin = days;
        }
        this.element.style.marginLeft = (days * TWIDTH) + 'rem';
    };
    TaskData.prototype.render = function () {
        return this.element;
    };
    TaskData.prototype.getBegin = function () { return this.begin; };
    TaskData.prototype.getLength = function () { return this.days; };
    return TaskData;
}(TaskElement));
var TaskLine = (function () {
    function TaskLine(begin, end) {
        this.tasks = [];
        this.begin = begin || new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);
        this.end = end || new Date(this.begin.getTime() + 31 * 24 * 60 * 60 * 1000);
        this.css = new TaskLineStyle();
        this.css.addColor('wc0', '#b0c4de');
        this.css.addColor('wc1', '#ffb6c1');
        this.css.addColor('wc2', '#f0e68c');
        this.css.addColor('wc3', '#9acd32');
    }
    TaskLine.prototype._setDate = function (e, value, week, length, holiday, today) {
        if (week === void 0) { week = -1; }
        if (length === void 0) { length = 0; }
        if (holiday === void 0) { holiday = false; }
        if (today === void 0) { today = false; }
        e.innerHTML = value;
        if (0 <= week) {
            e.classList.add('week' + week);
        }
        if (holiday) {
            e.classList.add('holiday');
        }
        if (today) {
            e.classList.add('today');
        }
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
            this._setDate(e.children[i], list[i].label, list[i].week, list[i].length, list[i].holiday, list[i].today);
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
    TaskLine.prototype.isToday = function (date, now) { return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate(); };
    TaskLine.prototype.renderDate = function () {
        var now = new Date();
        var date = new Date(this.begin.getTime());
        var m = this.begin.getMonth();
        var mlist = [{ label: (m + 1) + '', length: 1 }];
        var dlist = [{ label: this.begin.getDate() + '', week: this.begin.getDay(), holiday: false, today: this.isToday(this.begin, now) }];
        while (date.getTime() <= this.end.getTime()) {
            date.setDate(date.getDate() + 1);
            if (m !== date.getMonth()) {
                m = date.getMonth();
                mlist.push({ label: (m + 1) + '', length: 1 });
            }
            else {
                ++mlist[mlist.length - 1].length;
            }
            dlist.push({ label: date.getDate() + '', week: date.getDay(), holiday: false, today: this.isToday(date, now) });
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
        tl.addTask(new TaskData('1', 'test3', 7));
        tl.addTask(new TaskData('1', 'test4', 7));
        tl.render();
    }
    function init() {
        API.userInfo(afterLogin, function (data) {
            var message = data.message || 'Unknown error.';
        });
    }
    App.init = init;
})(App || (App = {}));
var TaskLineStyle = (function () {
    function TaskLineStyle() {
        var newStyle = document.createElement('style');
        newStyle.type = "text/css";
        document.getElementsByTagName('head').item(0).appendChild(newStyle);
        this.css = document.styleSheets.item(0);
    }
    TaskLineStyle.prototype.addColor = function (name, color) {
        var idx = document.styleSheets[0].cssRules.length;
        this.css.insertRule('.' + name + '{background-color:' + color + ';}', idx);
    };
    return TaskLineStyle;
}());
