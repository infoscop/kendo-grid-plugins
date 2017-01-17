(function ($) {
    $.fn.addGridFilterInput = function (containerId, data, rb, l) {
        if (!$("#" + containerId).length) return this;

        var verbs = rb;
        var lists = l;
        var initData = data;
        var gridId = this.attr('id');
        var filterGrid = function (field, value, operator, add) {
            var ds = $("#" + gridId).data("kendoGrid").dataSource;
            var filter = ds.filter();
            var filters = filter ? filter.filters : [];
            var addIsProcessed = false;

            if (filters && filters.length > 0) {
                for (var i = filters.length - 1; i >= 0; i--) {
                    var filter = filters[i];
                    if (filter.logic == "or" && filter.filters.length && filter.filters[0].field == field) {
                        if (add) {
                            var isAdded = false;
                            for (var j = filter.filters.length - 1; j >= 0; j--) {
                                var subFilter = filter.filters[j];
                                if (subFilter.value == value) {
                                    addIsProcessed = isAdded = true;
                                    break;
                                }
                            }
                            if (!isAdded) {
                                if (value) filter.filters.push({ field: field, operator: operator, value: value });
                                addIsProcessed = true;
                            }
                        } else {
                            filters.splice(i, 1);
                        }
                    } else if (filter.field == field) {
                        if (add) {
                            if ((value || value === false) && filter.value != value) {
                                filters.splice(i, 1);
                                filters.push({ logic: "or", filters: [filter, { field: field, operator: operator, value: value }] });
                            }
                            addIsProcessed = true;
                        } else {
                            filters.splice(i, 1);
                        }
                    }
                }
            }

            if (!(add && addIsProcessed) && (value || value === false)) filters.push({ field: field, operator: operator, value: value });
            ds.filter({ logic: "and", filters: filters });
        }

        var getFieldData = function (field) {
            var fieldData = { input: 'input', operators: ['contains'] };
            if (initData) {
                $.each(initData, function (index, value) {
                    if (value && value.data == field) {
                        var operators = value.operators ? value.operators : value.input == 'input' ? ['contains'] : ['eq'];
                        fieldData = { input: value.input, operators: operators };
                        return false;
                    }
                });
            }

            return fieldData;
        }

        var html = '<select>';
        $.each(data, function (index, value) {
            if (value && (value.input != 'select' || !!lists[value.data]))
                html += '<option value="' + value.data + '">' + value.label + '</option>';
        });
        html += '</select><select></select><div></div><button><span class="k-icon k-i-funnel" title="' + verbs.add + '"></span></button><button><span class="k-icon k-i-plus" title="' + verbs.append + '"></span></button>';
        $('#' + containerId).html(html);

        $(document).ready(function () {
            $("#" + containerId + " button").kendoButton().on("click", function (e) {
                var field = $("#" + containerId + " select:first").val();
                var select = $("#" + containerId + " div").find("select");
                var input = $("#" + containerId + " div").find("input");
                var dp = input.data("kendoDatePicker");

                var value = select.length ? select.data("kendoDropDownList").value() : dp ? dp.value() : input.val();
                if (value === "true" || value === "false") value = value === "true";
                var operator = $("#" + containerId + " select:eq(1)").data("kendoDropDownList").value();
                filterGrid(field, value, operator, $(this).html().indexOf("k-i-plus") > 0);
            });

            $("#" + containerId + " select:first").kendoDropDownList({
                animation: false,
                cascade: function (e) {
                    var fieldData = getFieldData(this.value());
                    var data = fieldData.input == 'select' && lists ? lists[this.value()] : null;
                    var dropDownOptions = { animation: false, dataSource: { data: data }, width: 200 };
                    if (data && data.length && typeof data[0] == "object") {
                        dropDownOptions.dataValueField = "Id";
                        dropDownOptions.dataTextField = "Name";
                    }
                    var operatorData = [];
                    $.each(fieldData.operators, function (index, operator) {
                        if (operator) {
                            var label = operator + (fieldData.input == 'datePicker' && (operator == 'gt' || operator == 'lt') ? '_date' : '');
                            operatorData.push({ Id: operator, Name: verbs[label] });
                        }
                    });

                    $("#" + containerId + " select:eq(1)").kendoDropDownList({
                        dataSource: operatorData,
                        dataValueField: "Id",
                        dataTextField: "Name",
                    });
                    $("#" + containerId + " div").html(data ? "<select></select>" : "<input class='k-input k-textbox' />");
                    $("#" + containerId + " div select").kendoDropDownList(dropDownOptions);
                    if (fieldData.input == 'datePicker') $("#" + containerId + " div input").kendoDatePicker({ animation: false, format: "dd/MM/yyyy" });

                    var dropdownlist = $("#" + containerId + " div select").data("kendoDropDownList");
                    var filterValue = $("#" + containerId + " select:first").data("filterValue");
                    var operatorValue = $("#" + containerId + " select:first").data("filterOperator");
                    if (operatorValue) {
                        $("#" + containerId + " select:eq(1)").data("kendoDropDownList").value($("#" + containerId + " select:first").data("filterOperator"));
					}
                    if (dropdownlist) {
                        $("#" + containerId + " div select").closest(".k-dropdown.k-widget").on("keypress", function (e) {
                            if (e.which == 10 || e.which == 13) {
                                var operator = $("#" + containerId + " select:eq(1)").data("kendoDropDownList").value();
                                filterGrid($("#" + containerId + " select:first").val(), dropdownlist.value(), operator, e.which == 10);
                            }
                        });
                        if (filterValue) dropdownlist.value(filterValue);
                        dropdownlist.focus();
                    } else {
                        if (filterValue) $("#" + containerId + " div input").val(filterValue);
                        $("#" + containerId + " div input").select().focus();
                        if (!filterValue && fieldData.input == 'datePicker') $("#" + containerId + " div input").data("kendoDatePicker").open();
                    }
                    $("#" + containerId + " select:first").data("filterValue", null);
                    $("#" + containerId + " select:first").data("filterOperator", null);
                    $("#" + containerId + " div input").on("keypress", function (e) {
                        if (e.which == 10 || e.which == 13) {
                            var dp = $("#" + containerId + " div input").data("kendoDatePicker");
                            var operator = $("#" + containerId + " select:eq(1)").data("kendoDropDownList").value();
                            filterGrid($("#" + containerId + " select:first").val(), dp ? dp.value() : $(e.target).val(), operator, e.which == 10);
                        }
                    });
                }
            });
        });

        return this;
    };
}(jQuery));