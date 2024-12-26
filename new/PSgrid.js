/** Functions Called from HTML  $(document).ready(function (){}) */
var psGridInitiator = {
    initGrid: function (config) {
        var $psgrid = $.extend(psGrid, psGridPager, psGridSorter, psGridSearcher, psGridFilter);
        $(this).data('psgrid', $psgrid);

        $psgrid.config = config;
        $psgrid.config.root = $(this);
        $psgrid.initGrid();
    },

    loadData: function () {
        var $psgrid = $(this).data('psgrid');
        $psgrid.loadData();
    }
}

$.fn.extend(psGridInitiator);

/** Main Class for Gris Behavior Management **/
var psGrid = {

    config: {},
    loadData: function () {
        var $cfg = this.config
        var $psgrid = this;

        if ($cfg.isfirstload == true && isEmpty($cfg.rows, false) == false) {
            this.loadRows();
            return;
        }

        // load data from server
        wsclient.GetParamApi($cfg.dataEndPoint,
            { page: $cfg.currentPage, sort_field: $cfg.sortField, sort_order: $cfg.sortOrder, search_text: $cfg.searchText, filter_value: $cfg.filterValue, data: $cfg.gridParams },
            function (result) {
                $cfg.totalRows = result.rows_total;
                $cfg.totalPages = result.pages_total;
                $cfg.currentPage = result.page;
                $cfg.rows = result.data;
                $psgrid.loadRows();      
            }
        );

    },
    /** Internal function trigerred from wsclient callback */
    loadRows: function () {
        var $cfg = this.config

        $cfg.isfirstload = false;
        // clean rows in table
        $cfg.tablebody.empty();
        // generate rows in bindData function
        $cfg.bindData($cfg.rows, $cfg.tablebody, $cfg.rowtemplate);

        this.createPager();
    },

    /** Save configuration data defined in HTML page $(document).ready(function ()) to the psgrid element as custom data attribute
     this is called from psgrid root element */
    initGrid: function () {
        $cfg = this.config;
        $cfg.tablebody = $cfg.root.find('[name="psgrid-table-body"]');
        $cfg.rowtemplate = $cfg.root.find('[name="psgrid-row-template"]').prop('content');
        $cfg.pager = $cfg.root.find('[name="psgrid-pager"]');
        $cfg.sorter = $cfg.root.find('[name="psgrid-header"]');
        $cfg.searcher = $cfg.root.find('[name="psgrid-search"]');
        $cfg.searchbtn = $cfg.root.find('[name="psgrid-search-button"]');
        $cfg.filterbtns = $cfg.root.find('[name="pstogglebutton-filter-button"]');
        $cfg.isfirstload = true;

        this.createSorter();
        this.createSearcher();
        this.createFilter();
    },
};

var psGridSearcher = {

    /** Triggered by search text changed */
    onSearchTextChanged: function (e) {
        var $cfg = this.config;
        $cfg.searchText = $cfg.searcher.val();
        $cfg.searchbtn.attr('data-isempty', isEmpty($cfg.searchText) ? "false" : "true");
    },
    /** Triggered by search text changed */
    onclickSearchButton: function () {
        var $cfg = this.config;
        $cfg.searcher.focus();
        if (isEmpty($cfg.searcher.val()) == true) return;

        $cfg.searcher.val('');
        this.onSearchTextChanged();
        this.loadData();
    },
    /** Triggered when Enter pressed */
    onSearchEnter: function (e) {
        if (e.keyCode !== 13) return;
        this.loadData();
    },
    /** Attach keypress and data changed handler */
    createSearcher: function () {
        var $cfg = this.config;
        var $psgrid = this;

        $cfg.searcher.on('input', function (e) { $psgrid.onSearchTextChanged(e) });
        $cfg.searcher.on('keydown', function (e) { $psgrid.onSearchEnter(e) });
        $cfg.searchbtn.click(function () { $psgrid.onclickSearchButton(); });
    },
};

var psGridFilter = {
    onclickFilterButton: function (i) {
        var $cfg = this.config;
        var $filterbtns = $cfg.filterbtns;

        var newFilterValue = $($filterbtns[i]).attr("value");
        if (newFilterValue == $cfg.filterValue) {
            return;
        }

        $cfg.filterValue= newFilterValue;
        this.loadData();
    },

    createFilter: function () {
        var $cfg = this.config;
        var $psgrid = this;
        var $filterbtns = $cfg.filterbtns;

        $('#pstogglebutton').initToggleButton()

        var selectedFilterIndex = parseInt($cfg.selectedFilterIndex) - 1;
        $cfg.filterValue = $($filterbtns[selectedFilterIndex]).attr("value");

        for (let i = 0; i < $filterbtns.length; i++) {
            $($filterbtns[i]).click(function () { $psgrid.onclickFilterButton(i)})
        }
    }
}

var psGridSorter = {
    /**Triggered by column header click */
    onclickSort: function (column) {
        var $cfg = this.config;
        const $cols = $cfg.sorter.find('[sortable]');
        $.each($cols, function (index, col) {
            var $colstatus = $(col).attr("sortable");
            var $colfield = $(col).data('field');

            // skip if column is not clicked one
            if ($colfield !== column) { $(col).attr("sortable", 'none'); return; }

            // toggle up and down status for clicked column
            var $order = ($colstatus === 'asc') ? 'desc' : 'asc';
            $(col).attr("sortable", $order);

            // Attach to config info and convert up to asc and down to desc
            $cfg.sortField = $colfield;
            $cfg.sortOrder = $order;
            $cfg.root.loadData();
        });
    },
    /** This is called from psgrid root element
    initialize event handler for sortable header columns */
    createSorter: function () {
        var $cfg = this.config;
        var $psgrid = this;

        const $cols = $cfg.sorter.find('[sortable]');
        $.each($cols, function (index, col) {
            $(col).click(function () { var colname = $(this).data('field'); $psgrid.onclickSort(colname) });
        });
    },
};

var psGridPager = {

    /** Triggered by pager button click.  
     Handle page navigation to keep currentPage pageidx in valid range */
    onClickPage: function (pageidx) {
        var $cfg = this.config;
        if (pageidx === $cfg.currentPage) return;

        $cfg.currentPage = pageidx;
        // if page changed, load data and update pager
        this.selectPage(pageidx);
        this.loadData();
    },
    /** Calculate page number when previous or next button clicked */
    onCalculatePage: function (pageidx) {
        var $cfg = this.config;
        // Get current page from config
        var $curpage = $cfg.currentPage;

        switch (pageidx) {
            case 0: // previous page
                $curpage--;
                break;
            case -1: // next page
                $curpage++;
                break;
            default:
                $curpage = pageidx;
                break;
        }

        // Validate is page number in valid range
        if ($curpage < 1) $curpage = 1;
        if ($curpage > $cfg.totalPages) $curpage = $cfg.totalPages;

        this.onClickPage($curpage);
    },
    /** Set correct style for active page button and load data */
    selectPage: function () {
        var $cfg = this.config;
        // Get current page from config
        var $curpage = $cfg.currentPage;

        // find page buttons (contains [data-index] attribute)
        const $pages = $cfg.pager.find('[data-index]');
        $.each($pages, function (index, row) {
            var $pageidx = $(row).data("index");
            var $status = ($pageidx === $curpage) ? 'active' : 'none';
            $(row).attr("status", $status);
        });

    },
    /** Adapt pager in relation to config totalPages after Data loaded */
    createPager: function () {
        var $cfg = this.config;
        var $psgrid = this;

        $cfg.pager.empty();
        $chunks = this.chunckCalculator();

        if (isEmpty($chunks) == true || $chunks[0].end == 1 || $chunks[0].end == 0) return;

        $($cfg.pager).addClass("psgrid-paginator-not-empty");

        var $prev = $('<div>').attr('status', 'none').click(function () { $psgrid.onCalculatePage(0); });
        $prev.append($('<img>'));
        $cfg.pager.append($prev);

        $.each($chunks, function (index, chunk) {
            for (var i = chunk.start; i <= chunk.end; i++) {
                var $page = $('<div>').attr('status', 'none').attr('data-index', i).text(i).click(function () { var index = $(this).data('index'); $psgrid.onClickPage(index); });
                $cfg.pager.append($page);
            }

            if($chunks.length === index + 1) return;
            var $page = $('<div>').attr('status', 'none').text('...');
            $cfg.pager.append($page);
        });

        var $next = $('<div>').attr('status', 'none').click(function () { $psgrid.onCalculatePage(-1); });
        $next.append($('<img>'));
        $cfg.pager.append($next);

        this.selectPage();
    },
    chunckCalculator: function () {
        var $cfg = this.config;

        if (isEmpty($cfg.totalRows) == true) return [];

        var $maxpages = 10;

        // Full range is visible
        if ($cfg.totalPages <= $maxpages) return [{ start: 1, end: $cfg.totalPages }];

        var chunks = [];

        var $chunk1 = ($cfg.currentPage <= ($maxpages - 3)) ? { start: 1, end: ($maxpages - 3) } : { start: 1, end: 2 };
        chunks.push($chunk1);

        if ($cfg.currentPage > ($maxpages - 3) && $cfg.currentPage <= ($cfg.totalPages - ($maxpages - 3))) {
            var $chunk2 = { start: $cfg.currentPage - 1, end: $cfg.currentPage + 2 };
            chunks.push($chunk2);
        };

        var $chunk3 = ($cfg.currentPage > ($cfg.totalPages - ($maxpages - 3))) ? { start: ($cfg.totalPages - ($maxpages - 4)), end: $cfg.totalPages, islastchunck: true } : { start: $cfg.totalPages - 1, end: $cfg.totalPages, islastchunk: true };
        chunks.push($chunk3);

        return chunks;
    },
};

