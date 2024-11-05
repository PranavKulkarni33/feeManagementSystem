declare module 'jspdf-autotable' {
    function autoTable(...args: any[]): void;
    export = autoTable;
  }
  
  declare module 'jspdf' {
    interface jsPDF {
      autoTable: (...args: any[]) => jsPDF;
    }
  }
  