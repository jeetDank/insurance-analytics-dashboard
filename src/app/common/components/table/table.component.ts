import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {TableModule} from "primeng/table";


@Component({
  selector: 'app-table',
  imports: [TableModule,CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  @Input() sectionHeader: string = "Section header"

  // Define columns
  columns = [
    { field: 'code', header: 'Code' },
    { field: 'name', header: 'Name' },
    { field: 'category', header: 'Category' },
    { field: 'quantity', header: 'Quantity' }
  ];

  // Selected (visible) columns
  selectedColumns = [...this.columns];

  // Sample data
  data = [
    { code: 'A1', name: 'Product A', category: 'Category 1', quantity: 100 },
    { code: 'B2', name: 'Product B', category: 'Category 2', quantity: 200 },
    { code: 'C3', name: 'Product C', category: 'Category 1', quantity: 300 }
  ];

  // Export menu items
  exportItems = [
    {
      label: 'CSV',
      icon: 'pi pi-file',
      command: () => this.exportCSV()
    },
    // {
    //   label: 'Excel',
    //   icon: 'pi pi-file-excel',
    //   command: () => this.exportExcel()
    // },
    // {
    //   label: 'PDF',
    //   icon: 'pi pi-file-pdf',
    //   command: () => this.exportPdf()
    // }
  ];

  // Export functions
  exportCSV() {
    const csv = this.convertToCSV(this.data);
    this.downloadFile(csv, 'products.csv', 'text/csv');
  }

  // exportExcel() {
  //   import('xlsx').then(xlsx => {
  //     const worksheet = xlsx.utils.json_to_sheet(this.data);
  //     const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  //     const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  //     this.downloadFile(new Blob([excelBuffer]), 'products.xlsx', 
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //   });
  // }

  // exportPdf() {
  //   import('jspdf').then(jsPDF => {
  //     import('jspdf-autotable').then(() => {
  //       const doc = new jsPDF.default();
  //       (doc as any).autoTable({
  //         head: [this.selectedColumns.map(c => c.header)],
  //         body: this.data.map(row => this.selectedColumns.map(c => row[c.field]))
  //       });
  //       doc.save('products.pdf');
  //     });
  //   });
  // }

  // Helpers
  private downloadFile(content: any, fileName: string, type: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(objArray: any[]) {
    const header = this.selectedColumns.map(c => c.header).join(',');
    const rows = objArray.map(row => this.selectedColumns.map(c => row[c.field]).join(','));
    return [header, ...rows].join('\r\n');
  }

}
