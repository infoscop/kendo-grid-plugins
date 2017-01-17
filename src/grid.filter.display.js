(function ($) {
    $.fn.addGridFilterDisplay = function (id, inputContainerId, rb) {
        var gridId = '';
        var containerId = '';
        filterText = '';
        var filterLabels = {};
        var originalFilter;
        var methods = {
            afterFilter: function (params) {
                if (params !== null && params.hasOwnProperty('overrideEvent') && params.overrideEvent === true) {
                    //alert("after filter error");
                } else if (params !== null && $.isEmptyObject(params) === false && typeof params.filters != 'undefined' && typeof params.logic != 'undefined') {
                    filterText = "";
                    methods.renderFilterItem(params.filters, params.logic);
                    $("#" + containerId).toggle(!!filterText).html(filterText);

                    $("#" + containerId + " a").on("click", function (e) {
                        e.preventDefault();
                        var field = $(this).parent().attr("field");
                        var value = $(this).parent().attr("value");
                        var operator = $(this).parent().attr("operator");
                        if ($(this).hasClass("grid-filter-display-close")) {
                            if (typeof field == 'undefined' && typeof value == 'undefined') {
                                $("#" + containerId).hide();
                                $("#" + gridId).data("kendoGrid").dataSource.filter(null);
                                return;
                            }
                            var filter = $("#" + gridId).data("kendoGrid").dataSource._filter;
                            $.each(filter.filters, function (index, val) {
                                if (val) {
                                    if (val.hasOwnProperty('logic')) {
                                        if (typeof value == 'undefined') {
                                            if (val.filters[0].field == unescape(field)) {
                                                filter.filters.splice(index, 1);
                                                return false;
                                            }
                                        } else {
                                            $.each(val.filters, function (i, v) {
                                                if (v && v.field == unescape(field) && isEqual(v.value, value)) {
                                                    val.filters.splice(i, 1);
                                                    if (val.filters.length == 1) {
                                                        filter.filters[index] = val.filters[0];
                                                    }
                                                    return false;
                                                }
                                            });
                                        }
                                    } else {
                                        if (val.field == unescape(field) && (typeof value == 'undefined' || isEqual(val.value, value))) {
                                            filter.filters.splice(index, 1);
                                            return false;
                                        }
                                    }
                                }
                            });
                            $("#" + gridId).data("kendoGrid").dataSource.filter(filter);
                        } else {
                            if (inputContainerId) {
                                var elem = $("#" + inputContainerId + " select:first").data("kendoDropDownList");
                                if (elem) {
                                    if (elem.value() == unescape(field)) {
                                        var dropdownlist = $("#" + inputContainerId + " div select").data("kendoDropDownList");
                                        if (dropdownlist) {
                                            dropdownlist.value(unescape(value));
                                            dropdownlist.focus();
                                        } else {
                                            $("#" + inputContainerId + " div input").val(unescape(value));
                                            $("#" + inputContainerId + " div input").select().focus();
                                        }
                                        $("#" + inputContainerId + " select:eq(1)").data("kendoDropDownList").value(operator);
                                    } else {
                                        $("#" + inputContainerId + " select:first").data("filterValue", unescape(value));
                                        $("#" + inputContainerId + " select:first").data("filterOperator", operator);
                                        elem.value(field);
                                    }
                                }
                            }
                        }
                    });
                } else if (params === null || $.isEmptyObject(params) === true) {
                    $("#" + containerId).html("");
                }
            },

            renderFilterItem: function (filters, logic, field) {
                var o = kendo.ui.FilterMenu.prototype.options.operators;
                var f = $('#' + gridId).data('kendoGrid').dataSource.options.schema.model.fields;
                if (filters == null || $.isEmptyObject(filters)) return;
                var isRoot = false;
                filterText += "<div class='grid-filter-display-" + (filters.length > 1 ? (field ? "a" : "c") : "box") + "'" + (field ? " field='" + escape(field) + "'" : "") + ">";
                $.each(filters, function (index, value) {
                    if (value) {
                        try {
                            if (value.hasOwnProperty('logic')) {
                                isRoot = true;
                                if (value.filters.length == 1) {
                                    var fld = $('<div/>').text(methods.getGridColumnTitle(value.filters[0].field)).html();
                                    var v = methods.getValue(value.filters[0]);
                                    var op = value.filters[0].operator + (v.isDate && (value.filters[0].operator == 'gt' || value.filters[0].operator == 'lt') ? '_date' : '');
                                    var operator = filterLabels[op] ? filterLabels[op] : o[f[value.filters[0].field].type][value.filters[0].operator].toLowerCase();
                                    filterText += "<div class='grid-filter-display-b' field='" + escape(value.filters[0].field) + "'>" + (inputContainerId ? "<a href='#'>" : "") + fld + " <span>" + operator + ":</span> " + $('<div/>').text(v.value).html() + (inputContainerId ? "</a>" : "") + "<a class='grid-filter-display-close' href='#' title='" + filterLabels.remove + "'><span class='k-icon k-i-close'></span></a></div>";
                                } else {
                                    methods.renderFilterItem(value.filters, value.logic, value.filters[0].field);
                                }
                            } else {
                                var fld = $('<div/>').text(methods.getGridColumnTitle(value.field)).html();
                                var v = methods.getValue(value);
                                var op = value.operator + (v.isDate && (value.operator == 'gt' || value.operator == 'lt') ? '_date' : '');
                                var operator = filterLabels[op] ? filterLabels[op] : o[f[value.field].type][value.operator].toLowerCase();
                                filterText += "<div class='grid-filter-display-b' field='" + escape(value.field) + "' value='" + escape(value.value) + "' operator='" + value.operator + "'>" + (inputContainerId ? "<a href='#'>" : "") + fld + " <span>" + operator + ":</span> " + $('<div/>').text(v.value).html() + (inputContainerId ? "</a>" : "") + "<a class='grid-filter-display-close' href='#' title='" + filterLabels.remove + "'><span class='k-icon k-i-close'></span></a></div>";
                            }
                        } catch (e) {
                            var v = methods.getValue(value);
                            filterText += "<div class='grid-filter-display-b' field='" + escape(value.field) + "' value='" + escape(v.value) + "'>" + (inputContainerId ? "<a href='#'>" : "") + fld + " <span>:</span> " + $('<div/>').text(v.value).html() + (inputContainerId ? "</a>" : "") + "<a class='grid-filter-display-close' href='#' title='" + filterLabels.remove + "'><span class='k-icon k-i-close'></span></a></div>";
                        }
                        if (filterLabels[logic]) logic = filterLabels[logic];
                        if (index < filters.length - 1) filterText += " <span class='grid-filter-display-logic'>" + logic + "</span> ";
                    }
                });
                if (filters.length > 1) filterText += "<a class='grid-filter-display-close' href='#' field='" + escape(field) + "' title='" + (isRoot ? filterLabels.removeAll : filterLabels.removeGroup) + "'><span class='k-icon k-i-close'></span></a>";
                filterText += "</div>";
                if (typeof field == 'undefined') filterText = filterLabels.title + filterText;
            },

            getGridColumnTitle: function (field) {
                var columns = $('#' + gridId).data('kendoGrid').columns;
                var result = field;
                $.each(columns, function (index, value) {
                    if (value && (value.field == field || value.field + "Id" == field)) {
                        result = value.title;
                        return false;
                    }
                });
                return result;
            },

            getValue: function (field) {
                if (field.value instanceof Date)
                    return { value: ('0' + field.value.getDate()).slice(-2) + '/' + ('0' + (field.value.getMonth() + 1)).slice(-2) + '/' + field.value.getFullYear(), isDate: true };

                var customLists = $(document).data("customLists");
                var value = field.value;
                if (customLists) {
                    var customList = customLists[field.field];
                    if (customList && customList.length && typeof customList[0] == "object") {
                        $.each(customList, function (index, row) {
                            if (row && row.Id == field.value) {
                                value = row.Name;
                                return false;
                            }
                        });
                    }
                }

                return { value: value, isDate: false };
            },

            isEqual: function (val1, val2) {
			    return val1 === false && val2 === "false" || val1 == unescape(val2);
			}
        };

        if (!$("#" + id).length) return this;

        gridId = this.attr('id');
        containerId = id;
        filterLabels = rb;

        var ds = $("#" + gridId).data("kendoGrid").dataSource;
        originalFilter = ds.filter;
        ds.filter = function (e) {
            var result = originalFilter.apply(this, arguments);
            if (arguments.length > 0) methods.afterFilter(e);
            return result;
        };

        return this;
    };
}(jQuery));