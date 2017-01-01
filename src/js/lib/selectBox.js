/**
 * Created by Anton on 02.01.2015.
 */
define(['./dom'], function (dom) {
    var SelectBox = function (select, details) {
        details = details || {};
        var self = this;
        self.isOpen = false;
        self.control = null;
        self.selected = null;
        self.menu = null;

        self.open = function () {
            if (!self.isOpen) {
                self.isOpen = true;
                self.control.classList.add('simple_select-open');
                self.menu.style.display = '';

                var pos = self.control.getBoundingClientRect();
                var topPos = pos.top + window.pageYOffset + self.control.clientHeight + 1;
                self.menu.style.top = topPos + 'px';
                self.menu.style.left = pos.left + 'px';
                self.menu.style.width = self.control.clientWidth + 'px';

                self.overItem(self.control.dataset.selectedIndex);

                if (!self.menu.parentNode) {
                    document.body.appendChild(self.menu);
                }
            }
        };

        self.hide = function () {
            if (self.isOpen) {
                self.isOpen = false;
                self.control.classList.remove('simple_select-open');
                self.menu.style.display = 'none';
            }
        };

        self.overItem = function (index) {
            var selectedOption = self.menu.querySelector('.simple_select__menu__item-selected');
            if (selectedOption) {
                selectedOption.classList.remove('simple_select__menu__item-selected');
            }

            var option = self.menu.childNodes[index];
            if (option) {
                option.classList.add('simple_select__menu__item-selected');
            }
        };

        self.overNextItem = function () {
            var selectedOption = self.menu.querySelector('.simple_select__menu__item-selected');
            var nextOption = null;
            if (selectedOption) {
                selectedOption.classList.remove('simple_select__menu__item-selected');
                nextOption = selectedOption.nextElementSibling;
            }
            if (!nextOption) {
                nextOption = self.menu.firstChild;
            }
            nextOption.classList.add('simple_select__menu__item-selected');
        };

        self.overPreviewItem = function () {
            var selectedOption = self.menu.querySelector('.simple_select__menu__item-selected');
            var prevOption = null;
            if (selectedOption) {
                selectedOption.classList.remove('simple_select__menu__item-selected');
                prevOption = selectedOption.previousElementSibling;
            }
            if (!prevOption) {
                prevOption = self.menu.lastChild;
            }
            prevOption.classList.add('simple_select__menu__item-selected');
        };

        self.select = function (index) {
            if (!index && index != 0) {
                var selectedOption = self.menu.querySelector('.simple_select__menu__item-selected');
                if (selectedOption) {
                    index = selectedOption.dataset.value;
                } else {
                    index = select.selectedIndex;
                }
            }
            if (self.control.dataset.selectedIndex != index) {
                self.control.dataset.selectedIndex = index;
                var option = select.childNodes[index];
                if (option) {
                    self.selected.textContent = option.textContent;
                    self.selected.dataset.index = index;
                }

                if (select.selectedIndex != index) {
                    select.selectedIndex = index;
                    select.dispatchEvent(new CustomEvent('change'));
                }
            }

            self.hide();
        };

        self.update = function () {
            var display = 'none';
            if (self.menu) {
                display = self.menu.style.display;
                self.menu.parentNode.removeChild(self.menu);
            }

            var options = [].slice.call(select.childNodes).filter(function (node) {
                return node.tagName === 'OPTION';
            }).map(function (optionNode, index) {
                return dom.el('a', {
                    class: 'simple_select__menu__item',
                    href: '#option',
                    data: {
                        value: optionNode.value,
                        index: index
                    },
                    text: optionNode.textContent,
                    on: ['click', function(e) {
                        e.preventDefault();
                        self.select(this.dataset.index);
                    }]
                });
            });

            self.menu = dom.el('div', {
                class: 'simple_select__menu',
                style: {
                    display: display,
                    position: 'absolute'
                },
                on: ['click', function(e) {
                    e.stopPropagation();
                }],
                append: options
            });
        };

        (function () {
            self.control = dom.el('a', {
                href: '#selectBox',
                class: ['simple_select'],
                append: [
                    self.selected = dom.el('span', {
                        class: ['simple_select__value']
                    }),
                    !details.editBtn ? '' : self.editBtn = dom.el('a', {
                        href: '#manageProfiles',
                        title: chrome.i18n.getMessage('manageProfiles'),
                        class: ['simple_select__btn', 'simple_select__btn-manage_profiles'],
                        append: [
                            dom.el('i', {
                                class: ['simple_select__btn__icon', 'simple_select__btn__icon-manage_profiles']
                            })
                        ],
                        on: ['click', function (e) {
                            e.stopPropagation();
                        }]
                    }),
                    self.arrowBtn = dom.el('a', {
                        href: '#open',
                        class: ['simple_select__btn', 'simple_select__btn-arrow'],
                        append: [
                            dom.el('i', {
                                class: ['simple_select__btn__icon', 'simple_select__btn__icon-arrow']
                            })
                        ]
                    })
                ],
                on: [
                    ['click', function (e) {
                        e.preventDefault();
                        if (self.isOpen) {
                            self.select();
                        } else {
                            self.open();
                        }
                    }],
                    ['keydown', function (e) {
                        if (e.keyCode === 40) {
                            if (!self.isOpen) {
                                self.open();
                            } else {
                                self.overNextItem();
                            }
                        } else if (e.keyCode === 38) {
                            if (!self.isOpen) {
                                self.open();
                            } else {
                                self.overPreviewItem();
                            }
                        } else if (e.keyCode === 27) {
                            if (self.isOpen) {
                                e.preventDefault();
                                self.hide();
                            }
                        }
                    }]
                ]
            });

            select.style.display = 'none';
            select.parentNode.insertBefore(self.control, select);

            self.update();
            self.select();
        })();
    };
    return SelectBox;
});