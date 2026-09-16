using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend_app3.DTOs;

namespace backend_app3.Templates
{
    public class ReceiptDocument : IDocument
    {
        public ReceiptModel Model { get; }

        public ReceiptDocument(ReceiptModel model)
        {
            Model = model;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container
                .Page(page =>
                {
                    page.Size(PageSizes.A5);
                    page.Margin(20);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(ComposeContent);
                    page.Footer().Element(ComposeFooter);
                });
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("VANGUARD DRIVE").FontSize(18).Bold().FontColor(Colors.Orange.Darken2);
                    column.Item().Text("Automotive Sales & Spare Parts").FontSize(9).FontColor(Colors.Grey.Medium);
                });

                row.ConstantItem(120).Column(column =>
                {
                    column.Item().AlignRight().Text($"Receipt #{Model.ReceiptId}").Bold();
                    column.Item().AlignRight().Text($"Date: {Model.Date:yyyy-MM-dd HH:mm}").FontSize(8);
                });
            });
        }

        private void ComposeContent(IContainer container)
        {
            container.PaddingVertical(15).Column(column =>
            {
                // Customer Information Box
                column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(cust =>
                {
                    cust.Item().Text("CUSTOMER DETAILS").FontSize(9).Bold().FontColor(Colors.Grey.Darken2);
                    cust.Item().Text($"Name: {Model.CustomerName}");
                    cust.Item().Text($"Phone: {Model.CustomerPhone}");
                });

                column.Item().Height(15);

                // Table Items
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Description
                        columns.RelativeColumn(1); // Qty
                        columns.RelativeColumn(1); // Price
                        columns.RelativeColumn(1); // Total
                    });

                    // Table Header
                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Orange.Darken2).Padding(5).Text("Item").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Orange.Darken2).Padding(5).AlignRight().Text("Qty").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Orange.Darken2).Padding(5).AlignRight().Text("Unit Price").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Orange.Darken2).Padding(5).AlignRight().Text("Total").FontColor(Colors.White).Bold();
                    });

                    // Table Row
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(Model.ItemName);
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(Model.Quantity.ToString());
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${Model.UnitPrice:N2}");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${Model.TotalAmount:N2}");
                });

                column.Item().Height(15);

                // Grand Total
                column.Item().AlignRight().Text($"Total: ${Model.TotalAmount:N2}").FontSize(12).Bold().FontColor(Colors.Black);
                
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                column.Item().PaddingTop(5).AlignCenter().Text("Thank you for choosing Vanguard Drive!").FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
            });
        }
    }
}