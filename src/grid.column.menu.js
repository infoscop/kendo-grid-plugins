(function ($) {
    $.fn.addGridColumnMenu = function (containerId) {
        if (!$("#" + containerId).length) return this;

        var grid = this.data("kendoGrid");

        $(document).ready(function () {
            $("#" + containerId).kendoColumnMenu({
                filterable: false,
                sortable: false,
                dataSource: grid.dataSource,
                columns: grid.columns,
                owner: grid
            });
        });

        return this;
    };
}(jQuery));