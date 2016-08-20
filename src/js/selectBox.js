/**
 * Created by Anton on 02.01.2015.
 */
var selectBox = {
    arrowHeight: 24,
    optionsOver: function(currentBox, isNext) {
        var options = currentBox.options;

        var nextOver = null;
        var currentSelect = options.querySelector('.over');
        if (!currentSelect) {
            if (isNext) {
                nextOver = options.firstChild;
            } else {
                nextOver = options.lastChild;
            }
        } else
        if (isNext) {
            nextOver = currentSelect.nextElementSibling;
        } else {
            nextOver = currentSelect.previousElementSibling;
        }
        if (nextOver === null) {
            return;
        }
        currentSelect && currentSelect.classList.remove('over');
        nextOver.classList.add('over');
    },
    hideOptions: function(currentBox) {
        currentBox.isOpen = false;
        currentBox.options.style.display = 'none';
        currentBox.control.classList.remove('is-open');
    },
    openOptions: function(currentBox) {
        var control = currentBox.control;
        var options = currentBox.options;

        var docHeight = document.body.clientHeight;
        options.style.display = 'block';
        var pos = control.getBoundingClientRect();
        var topPos = pos.top + window.pageYOffset + control.clientHeight;//control.clientTop + control.clientHeight;
        options.style.top = (topPos) + 'px';
        options.style.height = 'initial';
        if (topPos + options.clientHeight > docHeight) {
            options.style.height = (docHeight - topPos - 1 - 1) + 'px';
        }
        options.style.left = pos.left+'px';
        currentBox.isOpen = true;
        currentBox.control.classList.add('is-open');

        var currentOver = options.querySelector('.over');
        currentOver && currentOver.classList.remove('over');
        options.childNodes[currentBox.selectedIndex].classList.add('over');

        var hideOnClick = function hideOnClick(e) {
            if (currentBox.control.contains(e.target)) return;
            document.body.removeEventListener('click', hideOnClick);
            selectBox.hideOptions(currentBox);
        };
        document.body.addEventListener('click', hideOnClick);
    },
    select: function(currentBox, index) {
        var control = currentBox.control;
        var options = currentBox.options;
        if (index === -1) {
            index = undefined;
        }
        if (index === undefined) {
            if (!currentBox.isOpen) {
                return;
            }
            var currentOver = currentBox.options.querySelector('.over');
            if (currentOver === null) {
                return;
            }
            var index = Array.prototype.indexOf.call(currentBox.options.childNodes, currentOver);
            if (index === -1) {
                return;
            }
        }
        if (control.lastChild !== null && control.lastChild.tagName === 'DIV') {
            control.removeChild(control.lastChild);
        }
        control.appendChild(options.childNodes[index].cloneNode(true));
        if (currentBox.selectedIndex !== index) {
            currentBox.selectedIndex = index;

            currentBox.select.selectedIndex = index;
            currentBox.select.dispatchEvent(new CustomEvent('change'));
        }
        currentBox.isOpen && selectBox.hideOptions(currentBox);
    },
    update: function(currentBox) {
        var disaply = 'none';
        if (currentBox.options !== undefined) {
            disaply = currentBox.options.style.display || disaply;
            currentBox.options.parentNode.removeChild(currentBox.options);
        }

        currentBox.options = mono.create('div', {
            class: 'simple-select-box-menu',
            style: {
                display: disaply,
                position: 'absolute',
                width: currentBox.control.clientWidth+'px'
            },
            on: ['click', function(e) {
                e.stopPropagation();
            }],
            append: (function() {
                var optionList = [];
                var optionElList = currentBox.select.childNodes;
                for (var i = 0, item; item = optionElList[i]; i++) {
                    if (item.tagName !== 'OPTION') {
                        continue;
                    }
                    optionList.push(mono.create('div', {
                        class: 'item',
                        data: {
                            value: item.value,
                            index: i
                        },
                        append: [
                            item.dataset.image ? mono.create('span', {
                                class: 'image'
                            }) : undefined,
                            mono.create('span', {
                                text: item.textContent,
                                title: item.textContent
                            })
                        ],
                        on: ['click', function() {
                            selectBox.select(currentBox, this.dataset.index);
                        }],
                        onCreate: function() {
                            for (var key in item.dataset) {
                                this.dataset[key] = item.dataset[key];
                            }
                        }
                    }));
                }
                return optionList;
            })()
        });
        document.body.appendChild(currentBox.options);
        selectBox.select(currentBox, currentBox.select.selectedIndex);
    },
    wrap: function(select) {
        var currentBox = {
            select: select,
            isOpen: false
        };
        currentBox.selectedIndex = select.selectedIndex;
        var self = {
            select: selectBox.select.bind(selectBox, currentBox),
            update: selectBox.update.bind(selectBox, currentBox),
            openOptions: selectBox.openOptions.bind(selectBox, currentBox),
            optionsOver: selectBox.optionsOver.bind(selectBox, currentBox),
            hideOptions: selectBox.hideOptions.bind(selectBox, currentBox)
        };

        currentBox.control = mono.create('a', {
            href: '#',
            class: 'simple-select-box',
            style: {
                width: (select.clientWidth + selectBox.arrowHeight) + 'px',
                display: 'inline-block'
            },
            append: [
                mono.create('span', {
                    class: 'arrow',
                    append: mono.create('span')
                })
            ],
            on: [
                ['click', function (e) {
                    e.preventDefault();
                    if (currentBox.isOpen) {
                        return self.select();
                    }
                    self.openOptions();
                }],
                ['keydown', function (e) {
                    if (e.keyCode === 40) {
                        if (!currentBox.isOpen) {
                            return self.openOptions();
                        }
                        self.optionsOver(1);
                    } else if (e.keyCode === 38) {
                        if (!currentBox.isOpen) {
                            return self.openOptions();
                        }
                        self.optionsOver();
                    } else if (e.keyCode === 27) {
                        if (!currentBox.isOpen) {
                            return;
                        }
                        e.preventDefault();
                        self.hideOptions();
                    }
                }]
            ]
        });
        select.style.display = 'none';
        var nextElement = select.nextElementSibling;
        if (nextElement !== null) {
            select.parentNode.insertBefore(currentBox.control, nextElement);
        } else {
            select.parentNode.appendChild(currentBox.control);
        }
        self.update();

        return self;
    }
};