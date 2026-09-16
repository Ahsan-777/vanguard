using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.DTO;
namespace appnumber2.Templates
{
    // Define a class to hold your table structure and data
    
    // QuestPDF Dynamic Document Template
    public class GenericReportTemplate : IDocument
    {
        private readonly ReportDataDto _data;

        public GenericReportTemplate(ReportDataDto data)
        {
            _data = data;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                // 1. DYNAMIC HEADER
                page.Header()
                    .Height(50)
                    .Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(_data.Title).Bold().FontSize(20).FontColor(_data.HeaderColor);
                            col.Item().Text($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(9).FontColor(Colors.Grey.Darken1);
                        });
                    });

                // 2. DYNAMIC TABLE CONTENT
                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(col =>
                    {
                        col.Item().Table(table =>
                        {
                            // Equal distribution for all columns dynamically
                            table.ColumnsDefinition(columns =>
                            {
                                foreach (var header in _data.Headers)
                                {
                                    columns.RelativeColumn();
                                }
                            });

                            // Build Table Headers dynamically
                            table.Header(header =>
                            {
                                foreach (var headerText in _data.Headers)
                                {
                                    header.Cell()
                                        .Background(_data.HeaderColor)
                                        .Padding(5)
                                        .Text(headerText)
                                        .Bold()
                                        .FontColor(Colors.White);
                                }
                            });

                            // Build Table Rows dynamically
                            for (int i = 0; i < _data.Rows.Count; i++)
                            {
                                var row = _data.Rows[i];
                                var bgColor = i % 2 == 0 ? Colors.Grey.Lighten4 : Colors.White;

                                foreach (var cellValue in row)
                                {
                                    table.Cell()
                                        .Background(bgColor)
                                        .Padding(5)
                                        .Text(cellValue ?? "N/A");
                                }
                            }
                        });
                    });

                // 3. REUSABLE FOOTER
                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                    
            });
        }
    }
    
}
