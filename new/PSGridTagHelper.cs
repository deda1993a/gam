using Gamanet.Common.Web.Model;
using Gamanet.Common.Web.Model.Interfaces;
using Gamanet.PortalServices.Controls.Helper;
using Gamanet.PortalServices.Controls.Model;
using Gamanet.PortalServices.Controls.Model.Interfaces;
using Gamanet.PortalServices.Controls.TagHelpers.Interfaces;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Localization;
using System.Text;
using System.Text.Json;

namespace Gamanet.PortalServices.Controls.TagHelpers
{
    [HtmlTargetElement("psgrid")]
    [RestrictChildren("psgridcolumn")]
    public class PSGridTagHelper : TagHelper
    {
        private IStringLocalizer<SharedResource> _loc { get; }

        [HtmlAttributeName("id")]
        public string Id { get; set; } = string.Empty;

        [HtmlAttributeName("datasource-url")]
        public string DataEndPoint { get; set; } = string.Empty;

        /// <summary>
        /// Used for calculation of Table Height
        /// </summary>
        [HtmlAttributeName("rows-per-page")]
        public int RowsPerPage { get; set; } = -1;

        [HtmlAttributeNotBound]
        public List<IGridColumnEntity> Columns { get; set; } = default!;

        /// <summary>
        /// User for initial data loaded and delivered as part of HTML page
        /// </summary>
        [HtmlAttributeName("dataprovider")]
        public object? DataSource { get; set; } = null;

        [HtmlAttributeName("grid-parameters")]
        public object? Data { get; set; } = null;

        /// <summary>
        /// Determines the value of toggle buttons used for filtering rows
        /// Default value = null
        /// </summary>
        [HtmlAttributeName("filtervalues")]
        public string[]? FilterValues { get; set; } = null;

        /// Determines the text of toggle buttons used for filtering rows
        /// Default value = null
        [HtmlAttributeName("filtertextkeys")]
        public string[]? FilterTextKeys { get; set; } = null;

        /// <summary>
        /// Determines which toggle button used for filtering should be selected by default based on button index.
        /// Indexing starts at 1
        /// Default value = 1
        /// </summary>
        [HtmlAttributeName("selectedfilterindex")]
        public int SelectedFilterIndex { get; set; } = 1;

        [HtmlAttributeNotBound]
        private string? SerializedData { get; set; } = null;

        [HtmlAttributeNotBound]
        private PagerResponseEntity? DataSet { get; set; } = null;

        /// <summary>
        /// Initial sort field when grid is loaded calculated in ConsolidateSortFields();
        /// </summary>
        [HtmlAttributeNotBound]
        private string SortField { get; set; } = string.Empty;

        /// <summary>
        /// Initial sort order when grid is loaded calculated in ConsolidateSortFields();
        /// </summary>
        [HtmlAttributeNotBound]
        private string SortOrder { get; set; } = string.Empty;

        /// <summary>
        /// Initial flter text when grid is loaded calculated in DetermineFilterText();
        /// </summary>
        [HtmlAttributeNotBound]
        private string FilterValue { get; set; } = string.Empty;

        [ViewContext]
        [HtmlAttributeNotBound]
        public ViewContext? ViewContext { get; set; }

        private IUserInfoService _userInfoSvc;

        public PSGridTagHelper(IStringLocalizer<SharedResource> localizer, IUserInfoService infoservice)
        {
            _loc = localizer;
            Columns = new List<IGridColumnEntity>();
            _userInfoSvc = infoservice;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (string.IsNullOrEmpty(Id) == true) throw new ArgumentNullException(nameof(Id));

            if (FilterTextKeys?.Length != FilterValues?.Length)
            {
                throw new ArgumentException("The 'filtertextkeys' and 'filtervalues' attribute arrays should have the same length (same number of elements).");
            }

            context.Items.Add(typeof(PSGridTagHelper), this);
            _ = await output.GetChildContentAsync();

            output.TagName = "div";
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Attributes.Add("id", Id);
            output.Attributes.Add("class", "psgrid");

            ConsolidateSortFields();
            DetermineCurrentFilterKey();
            await GetInitialDataAsync();


            output.Content.SetHtmlContent(CreateHtmlContent());

            await base.ProcessAsync(context, output);
        }

        private async Task GetInitialDataAsync()
        {
            if (DataSource == null) return;
            Guid? userId = null;

            string? suserid = _userInfoSvc.GetUserSetting(ViewContext?.HttpContext, "userid");

            if (Guid.TryParse(suserid, out Guid parsedUserId) == true) userId = parsedUserId;

            if (Data != null) SerializedData = JsonSerializer.Serialize(Data, PSSerialization.GetDefaultOptions());

            var request = new PagerRequestEntity()
            {
                page = 1,
                sort_field = SortField,
                sort_order = SortOrder,
                filter_value = FilterValue,
                user_id = userId,
                data = SerializedData
            };

            if (DataSource is IPagerDataProvider)
            {
                DataSet = new PagerResponseService((IPagerDataProvider)DataSource).GetPage(request, RowsPerPage);
            }
            else if (DataSource is IPagerDataProviderAsync)
            {
                DataSet = await new PagerResponseServiceAsync((IPagerDataProviderAsync)DataSource).GetPageAsync(request, RowsPerPage);
            }
        }

        private string CreateHtmlContent()
        {
            var content = new StringBuilder();
            int i = 1;
            int height = RowsPerPage * 40 + 48;

            content.I(i).AppendLine($"");
            content.I(i).AppendLine($"<div class=\"psgrid-top-container\">");


            content.I(i + 1).AppendLine($"<div class=\"psgrid-filter-container\">");
            if (FilterValues?.Length > 0)
            {
                CreateToggleButtons(content, i + 1);
            }
            content.I(i + 1).AppendLine("</div>");

            content.I(i + 1).AppendLine($"<div class=\"psgrid-search-container\">");
            content.I(i + 2).AppendLine($"<input type=\"text\" name=\"psgrid-search\" placeholder=\"{_loc["txtTypeAKeyword"]}\">");
            content.I(i + 2).AppendLine($"<button name=\"psgrid-search-button\" class=\"psgrid-search-button\" type=\"submit\" data-isempty=\"false\"></button>");
            content.I(i + 1).AppendLine($"</div>");
            content.I(i).AppendLine($"</div>");
            content.I(i).AppendLine($"");
            content.I(i).AppendLine($"<div class=\"psgrid-container-table\" style=\"width: 100%; height: {height}px\">");
            content.I(i + 1).AppendLine($"<table class=\"psgrid-table\">");
            CreateHeader(content, i + 2);
            content.I(i + 2).AppendLine($"<tbody class=\"psgrid-table-body\" name=\"psgrid-table-body\" data-pagerows=\"6\" ></tbody>");
            content.I(i + 1).AppendLine($"</table>");
            content.I(i).AppendLine($"</div>");
            content.I(i).AppendLine($"");
            CreatePager(content, i);
            content.I(i).AppendLine($"");
            CreateRowTemplate(content, i);
            content.I(i).AppendLine($"");
            CreateScript(content, i);

            return content.ToString();
        }

        private void CreateToggleButtons(StringBuilder content, int indent)
        {
            if (FilterTextKeys == null) return;

            int i = indent;

            content.I(i).AppendLine("<div id=\"pstogglebutton\" class=\"pstogglebutton\">");

            for (int j = 0; j < FilterValues?.Length; j++)
            {
                var dataSelected = SelectedFilterIndex == j + 1 ? "true" : "false";

                content.I(i + 1).AppendLine($"<button class=\"pstogglebutton-button\" name=\"pstogglebutton-filter-button\" value=\"{FilterValues[j]}\" data-selected=\"{dataSelected}\">");
                content.I(i + 2).AppendLine($"<div class=\"pstogglebutton-text\">{_loc[FilterTextKeys[j]]}</div>");
                content.I(i + 1).AppendLine("</button>");
            }
            content.Append("\n");

            content.I(i).AppendLine("</div>");
        }

        private void CreateHeader(StringBuilder content, int indent)
        {
            int i = indent;
            content.I(i).AppendLine($"<thead class=\"psgrid-table-head\" name=\"psgrid-header\">");
            content.I(i + 1).AppendLine($"<tr class=\"psgrid-thead-row\">");

            foreach (var column in Columns)
            {
                // Conversion for Asc/Desc/None to up/down/none
                var order = column.Sorted.ToString().ToLower();
                var issortable = (column.IsSortable || column.Sorted != enOrderType.None) ? $"sortable=\"{order}\"" : "";

                content.I(i + 2).AppendLine($"<th {issortable} data-field=\"{column.TextField}\">");
                content.I(i + 3).Append($"<div>");
                content.Append($"{_loc[column.Title]}");
                content.Append($"<span class=\"psgrid-sort\"></span>");
                content.AppendLine($"</div>");
                content.I(i + 2).AppendLine($"</th>");
            }

            content.I(i + 1).AppendLine($" </tr>");
            content.I(i).AppendLine($" </thead>");
        }

        private void CreatePager(StringBuilder content, int indent)
        {
            int i = indent;
            // Pager is created by JavaScript, we have to create a placeholder for it
            content.I(i).AppendLine($"<div class=\"psgrid-paginator\" name=\"psgrid-pager\"></div>");
        }

        private void CreateRowTemplate(StringBuilder content, int indent)
        {
            int i = indent;

            content.I(i).AppendLine($"<template name=\"psgrid-row-template\">");
            content.I(i + 1).AppendLine($"<tr class=\"psgrid-tbody-row\">");

            foreach (var column in Columns)
            {
                content.I(i + 2).Append($"<td>");
                if (string.IsNullOrEmpty(column.OnClick) == false)
                    content.Append($"<div class=\"psgrid-column-onclick\" name=\"{column.OnClick}\" onclick=\"\" >");

                if (string.IsNullOrEmpty(column.LinkField) == false)
                    content.Append($"<a name=\"{column.LinkField}\" href=\"\" >");

                if (string.IsNullOrEmpty(column.ImageField) == false)
                    content.Append($"<img class=\"psgrid-image\" name=\"{column.ImageField}\" src=\"\">");

                if (string.IsNullOrEmpty(column.TextField) == false)
                    content.Append($"<span name=\"{column.TextField}\"></span>");

                if (string.IsNullOrEmpty(column.LinkField) == false)
                    content.Append($"</a>");

                if (string.IsNullOrEmpty(column.OnClick) == false)
                    content.Append($"</div>");

                content.AppendLine($"</td>");
            }

            content.I(i + 1).AppendLine($"</tr>");
            content.I(i).AppendLine($"</template>");
        }

        private void CreateScript(StringBuilder content, int indent)
        {
            int i = indent;
            content.AppendLine("");
            content.I(i).AppendLine($"<script type=\"text/javascript\">");
            content.I(i + 1).AppendLine("$(document).ready(function () {");
            content.I(i + 2).AppendLine($"$('#{Id}').initGrid({{");
            content.I(i + 2).AppendLine($"dataEndPoint: '{DataEndPoint}',");
            GetRowsInitialData(content, i + 2);
            if (DataSet != null)
            {
                content.I(i + 2).AppendLine($"totalPages: {DataSet.pages_total},");
                content.I(i + 2).AppendLine($"currentPage: {DataSet.page},");
                content.I(i + 2).AppendLine($"totalRows: {DataSet.rows_total},");
            }

            content.I(i + 2).AppendLine($"selectedFilterIndex: '{SelectedFilterIndex}',");
            content.I(i + 2).AppendLine($"sortField: '{SortField}',");
            content.I(i + 2).AppendLine($"sortOrder: '{SortOrder}',");
            content.I(i + 2).AppendLine($"gridParams: '{SerializedData}',");
            GetBindDataFunction(content, i + 2);
            content.I(i + 1).AppendLine("});");
            content.AppendLine("");
            content.I(i + 1).AppendLine($"$('#{Id}').loadData();");
            content.I(i).AppendLine("});");
            content.I(i).AppendLine("</script>");
            content.AppendLine("");
        }

        private void GetRowsInitialData(StringBuilder content, int indent)
        {
            if (DataSet == null) return;

            var jdata = JsonSerializer.Serialize(DataSet.data, PSSerialization.GetDefaultOptions());
            content.I(indent).AppendLine($"rows: {jdata},");
        }

        private void GetBindDataFunction(StringBuilder content, int indent)
        {
            int i = indent;

            content.I(i).AppendLine("bindData: function (data, tbody, rtemplate) {");
            content.I(i + 1).AppendLine("$.each(data, function(index, row) {");
            content.I(i + 2).AppendLine("const newRow = document.importNode(rtemplate, true);");


            foreach (var column in Columns)
            {
                if (string.IsNullOrEmpty(column.TextField) == false)
                    content.I(i + 2).AppendLine($"$(newRow).find('[name=\"{column.TextField}\"]').text({FormatField(column)});");

                if (string.IsNullOrEmpty(column.ImageField) == false)
                    content.I(i + 2).AppendLine($"$(newRow).find('[name=\"{column.ImageField}\"]').attr('src', row.{column.ImageField});");

                if (string.IsNullOrEmpty(column.LinkField) == false)
                    content.I(i + 2).AppendLine($"$(newRow).find('[name=\"{column.LinkField}\"]').attr('href', row.{column.LinkField});");

                if (string.IsNullOrEmpty(column.OnClick) == false)
                    content.I(i + 2).AppendLine($"$(newRow).find('[name=\"{column.OnClick}\"]').attr('onclick', row.{column.OnClick});");
            }

            content.I(i + 2).AppendLine("tbody.append(newRow);");
            content.I(i + 1).AppendLine("});");
            content.I(i).AppendLine("},");
        }

        private string FormatField(IGridColumnEntity? field)
        {
            if (field == null) return string.Empty;

            string retval = string.Empty;
            if (field.FieldType == Enums.enFieldType.Date)
                //retval = $"new Date(row.{field.PageUrl}).toLocaleString('sk-sk')";
                retval = $"getFormattedDate(row.{field.TextField})";
            else
                retval = $"row.{field.TextField}";


            return retval;
        }

        private void ConsolidateSortFields()
        {
            bool isfirstsortedfield = true;
            foreach (var column in Columns)
            {
                if (column.Sorted == enOrderType.None) continue;
                if (isfirstsortedfield == false)
                {
                    column.Sorted = enOrderType.None;
                    column.IsSortable = true;
                    continue;
                }

                SortField = column.TextField;
                SortOrder = column.Sorted.ToString().ToLower();
                isfirstsortedfield = false;
            }
        }

        private void DetermineCurrentFilterKey()
        {
            if (FilterValues == null)
            {
                return;
            }

            if (SelectedFilterIndex > FilterValues.Length || SelectedFilterIndex - 1 < 0)
            {
                throw new Exception("The SelectedFilterIndex is incorrect in relation of the filtervalues attribute");
            }

            FilterValue = FilterValues[SelectedFilterIndex - 1];
        }

    }
}
