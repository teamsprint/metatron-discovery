(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Plugins": {
        "HeaderMenu": HeaderMenu
      }
    }
  });

  let menus;

  function HeaderMenu(options, data) {

    if (data && data.items) {
      menus = data.items;
    }

    let _grid;
    const _self = this;
    const _handler = new Slick.EventHandler();
    const _defaults = {};

    let $activeHeaderColumn;

    let $layer;
    const LAYER_WIDTH = 160;

    const classs = {
      parent: {
        header: {
          target: 'slick-header-column'
        }
      },
      header: {
        button: 'slick-header-menubutton'
      },
      layer: {
        warpDiv: 'pb-component-grid-popup slickgrid-type-grid',
        div: 'pb-component-grid-popup',
        ul: 'pb-list-grid',
        hasIcons: 'slickgrid-grid-type',
        moreIcon: 'slickgrid-icon-gird-view'
      },
    };

    const state = {
      parent: {
        header: {
          active: 'slick-header-column-active'
        }
      },
      layer: {
        ul: {
          disabled: "is-disabled",
          hasChild: "pb-list-select"
        }
      },
    };

    function destroy() {
      _handler.unsubscribeAll();
      $(document.body).off("mousedown", handleBodyMouseDown);
      $(window).off("resize", hideMenu);
    }

    function init(grid) {

      options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      _handler
        .subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
        .subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

      _grid.setColumns(_grid.getColumns());

      $(document.body).on("mousedown", handleBodyMouseDown);
      $(window).on("resize", hideMenu);
    }

    function handleHeaderCellRendered(e, args) {

      const menu = menus;
      const column = args.column;

      if (menu) {
        const $layerActiveHeaderButton = $("<div></div>")
          .addClass(classs.header.button)
          .data("column", column)
          .data("data", menu);

        if (menu.tooltip) {
          $layerActiveHeaderButton
            .attr("title", menu.tooltip);
        }

        $layerActiveHeaderButton
          .on("click", showMenu)
          .appendTo(args.node);
      }
    }

    function handleBeforeHeaderCellDestroy(e, args) {
      const column = args.column;
      if (column.header && column.header.menu) {
        $(args.node)
          .find(`.${classs.header.button}`)
          .remove();
      }
    }

    function hideMenu() {
      if ($layer) {
        $layer.remove();
        $layer = null;
        if ($activeHeaderColumn && $activeHeaderColumn.hasClass(state.parent.header.active)) {
          $activeHeaderColumn.removeClass(state.parent.header.active)
        }
      }
    }

    function showMenu(event) {
      const $menuButton = $(this);
      const menu = $menuButton.data("data");
      const columnDef = $menuButton.data("column");

      // noinspection EqualityComparisonWithCoercionJS
      if (_self.onBeforeMenuShow.notify({
        "grid": _grid,
        "column": columnDef,
        "data": menu
      }, event, _self) == false) {
        return;
      }

      if ($layer) {
        $layer.empty();
      }

      $layer = $("<div></div>")
        .addClass(classs.layer.warpDiv)
        .appendTo(_grid.getContainerNode());

      const $ul = addUlElementToDiv($layer);

      menu.forEach(item => {
        if (item.iconClass && !$layer.hasClass(classs.layer.hasIcons)) $layer.addClass(classs.layer.hasIcons);
        createMenu(item, $ul);
      });

      toCalculateLayerOffset.call(this);
      saveActiveHeaderColumn($menuButton);
      addClassToActiveHeaderColumn();

      event.preventDefault();
      event.stopPropagation();
    }

    function createMenu(item, $ul) {

      if (item.divider) {
        createDividerElement(item, $ul);
        return;
      }

      const $li = createLiElement(item, $ul);
      const $a = createAtagElement(item, $li);

      if (item.disabled) changeLiElementDisabledState($li);
      if (item.iconClass) addIconToAElementTag(item, $a);

      if (hasChild(item)) {
        addClassToHasChildren($li);
        addMoreIconToAtag($a);
        createChildMenu($a, item.child);
      }
    }

    function createChildMenu(node, child) {

      const $div = $("<div></div>").addClass(classs.layer.div);
      const $ul = addUlElementToDiv($div);
      node.after($div);

      child.forEach(item => {
        if (item.iconClass && !$div.hasClass(classs.layer.hasIcons)) $div.addClass(classs.layer.hasIcons);
        createMenu(item, $ul);
      });
    }

    function addClassToHasChildren($li) {
      $li.addClass(state.layer.ul.hasChild);
    }

    function addIconToAElementTag(item, $a) {
      $("<span class='pb-ui-icon'><em class=" + item.iconClass + "></em></span>")
        .prependTo($a);
    }

    function changeLiElementDisabledState($li) {
      $li.addClass(state.layer.ul.disabled);
    }

    function handleMenuItemClick(item, e) {

      if (item.disabled) {
        return;
      }

      hideMenu();

      e.preventDefault();
      e.stopPropagation();
    }

    function handleBodyMouseDown(event) {
      if ($layer && $layer[0] != event.target && !$.contains($layer[0], event.target)) {
        hideMenu();
      }
    }

    function addUlElementToDiv($div) {
      return $('<ul></ul>')
        .addClass(classs.layer.ul)
        .appendTo($div);
    }

    function hasChild(item) {
      return item && item.child.length > 0;
    }

    function toCalculateLayerOffset() {

      let leftPos = $(this).offset().left;
      const gridPos = _grid.getGridPosition();
      if ((leftPos + LAYER_WIDTH) >= gridPos.width) {
        leftPos = leftPos - LAYER_WIDTH;
      }

      $layer.offset({
        top: $(this).offset().top + $(this).height(),
        left: leftPos
      });
    }

    function findActiveHeaderColumn($menuButton) {
      return $menuButton.closest(`.${classs.parent.header.target}`);
    }

    function saveActiveHeaderColumn($menuButton) {
      $activeHeaderColumn = findActiveHeaderColumn($menuButton);
    }

    function addClassToActiveHeaderColumn() {
      $activeHeaderColumn.addClass(state.parent.header.active);
    }

    function createDividerElement(item, $ul) {
      return $("<li class='pb-line'></li>")
        .appendTo($ul);
    }

    function createLiElement(item, $ul) {
      return $("<li></li>")
        .on("click", !item.handler
          ? (event) => {
            event.stopPropagation();
            handleMenuItemClick(item, event);
          }
          : (event) => {
            event.stopPropagation();
            if (item.disabled) {
              handleMenuItemClick(item, event);
              return;
            }
            item.handler.call(handleMenuItemClick(item, event));
          })
        .appendTo($ul);
    }

    function createAtagElement(item, $li) {
      return $("<a></a>")
        .attr('href', 'javascript:')
        .text(item.title)
        .appendTo($li);
    }

    function addMoreIconToAtag($a) {
      $("<em></em>")
        .addClass(classs.layer.moreIcon)
        .appendTo($a);
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy,
      "pluginName": "HeaderMenu",
      "onBeforeMenuShow": new Slick.Event(),
      "onCommand": new Slick.Event()
    });
  }
})(jQuery);
