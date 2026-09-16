using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend_app3.DTOs;

namespace backend_app3.Templates
{
    public class InventoryReportDocument : IDocument
    {
        public InventoryReportDto Model { get; }

        public InventoryReportDocument(InventoryReportDto model)
        {
            Model = model;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        }

        void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("VANGUARD DRIVE").FontSize(20).Bold().FontColor(Colors.Orange.Medium);
                    column.Item().Text("Inventory & Stock Summary Report").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                row.ConstantItem(150).AlignRight().Column(column =>
                {
                    column.Item().Text($"Date: {Model.GeneratedDate:yyyy-MM-dd HH:mm}").Bold();
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(15).Column(column =>
            {
                column.Spacing(15);

                // Summary KPI Cards
                column.Item().Row(row =>
                {
                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Total Stock Value").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"${Model.TotalInventoryValue:N2}").FontSize(13).Bold().FontColor(Colors.Green.Darken2);
                    });

                    row.ConstantItem(10);

                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Available Parts").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{Model.TotalAvailableParts}").FontSize(13).Bold().FontColor(Colors.Blue.Darken2);
                    });

                    row.ConstantItem(10);

                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Total Parts Sold").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{Model.TotalSoldParts}").FontSize(13).Bold().FontColor(Colors.Orange.Darken2);
                    });
                });

                // Inventory Table
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Part Name
                        columns.RelativeColumn(2); // Part #
                        columns.RelativeColumn(2); // Category
                        columns.RelativeColumn(1.5f); // Price
                        columns.RelativeColumn(1f); // Available
                        columns.RelativeColumn(1f); // Sold
                        columns.RelativeColumn(2f); // Total Value
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Part Name").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Part #").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Category").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("Price").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("In Stock").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("Sold").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("Valuation").Bold().FontColor(Colors.White);
                    });

                    foreach (var item in Model.Items)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Name);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.PartNumber);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Category);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${item.Price:N2}");
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(item.QuantityInStock.ToString());
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(item.SoldQuantity.ToString());
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${item.TotalStockValue:N2}");
                    }
                });
            });
        }

        void ComposeFooter(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Text("Confidential - Internal Inventory Document").FontSize(8).Italic().FontColor(Colors.Grey.Medium);
                row.RelativeItem().AlignRight().Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }
    }
}