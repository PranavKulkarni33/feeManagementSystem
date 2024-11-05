import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentDatabase } from 'src/app/interfaces/student-database';
import { AuthService } from 'src/app/services/auth.service';
import { StudentDatabaseServiceService } from 'src/app/services/student-database-service.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


import { TDocumentDefinitions } from 'pdfmake/interfaces';



@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  studentList: StudentDatabase[] = [];
  studentObj: StudentDatabase = {
    id: '',
    studentID: '',
    name: '',
    email: '',
    program: '',
    startDate: '',
    endDate: '',
    totalFees: '',
    datesOfFeesToBePaid: {}, // Empty map for fees to be paid
    dateOfPaymentReceived: [], // Empty array for payment received dates
    etNumber: '',
    amountReceived: [], // Empty array for amounts received
    paymentModes: [], // Empty array for payment modes
    installmentNotes: [], // Empty array for notes
    modeOfPayment: '',
    confirmedByVM: '',
    totalFeeBalance: '', // Fee balance to be calculated
    notes: '',
    enrollmentStatus: 'enrolled',
    raises: []
  };
  enrollmentStatuses: string[] = ['enrolled', 'graduated', 'withdrawn', 'other']; // Status options
  enrollmentStatusesForFilter: string[] = ['enrolled', 'graduated', 'withdrawn', 'other', 'all']; // Status options
  selectedFilterStatus: string = 'all';
  filteredStudentList: StudentDatabase[] = [];
  showModal: boolean = false;
  showInstallmentDetailsModal: boolean = false; // New variable for the details modal
  currentEditingIndex: number | null = null;
  installmentDueDateFilter: string = '';
  showFilterModal: boolean = false;
  showStatusFilterModal: boolean = false;
  showDueDateFilterModal: boolean = false;
  startDateFilter: string = '';
  endDateFilter: string = '';
  showDateRangeFilterModal: boolean = false;
  appliedFilter: { type: string, value?: any } | null = null;
  showAddStudentModal: boolean = false;
  logoBase64: string = ''; 
  


  // Including paymentMode and note for each installment
  installmentList: { 
    date: string, 
    amount: string, 
    dateReceived: string, 
    amountReceived: string,
    paymentMode: string,
    note: string,
    raises: string
    
  }[] = [];
  
  selectedInstallments: { 
    date: string, 
    amount: string, 
    dateReceived: string, 
    amountReceived: string,
    paymentMode: string,
    note: string,
    raises: string
    editing: boolean
  }[] = [];

  selectedStudent: StudentDatabase | null = null; // Selected student for modal

  constructor(
    private auth: AuthService,
    private studentService: StudentDatabaseServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllStudents();
  }

  getAllStudents() {
    this.studentService.getAllStudents().subscribe(
      res => {
        this.studentList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        });
        this.filterStudentsByStatus(); // Apply initial filter after fetching students
      },
      err => {
        alert('Error while fetching the data');
      }
    );
  }

  // Filter students based on selected status
  filterStudentsByStatus() {
    if (this.selectedFilterStatus === 'all') {
      this.filteredStudentList = [...this.studentList]; // Show all students if "all" is selected
    } else {
      this.filteredStudentList = this.studentList.filter(student => student.enrollmentStatus === this.selectedFilterStatus);
    }
  }

  // Called when the filter is changed
  onStatusFilterChange() {
    this.filterStudentsByStatus(); // Apply the filter based on the selected status
  }


  resetForm() {
    this.studentObj = {
      id: '',
      studentID: '',
      name: '',
      email: '',
      program: '',
      startDate: '',
      endDate: '',
      totalFees: '',
      datesOfFeesToBePaid: {},
      dateOfPaymentReceived: [],
      etNumber: '',
      amountReceived: [],
      paymentModes: [],
      installmentNotes: [],
      modeOfPayment: '',
      confirmedByVM: '',
      totalFeeBalance: '',
      notes: '',
      enrollmentStatus: 'enrolled',
      raises: []
    };
    this.installmentList = [];
  }

  // Methods for Add Student Modal
  openAddStudentModal() {
    this.showAddStudentModal = true;
  }

  closeAddStudentModal() {
    this.showAddStudentModal = false;
  }

  addStudent() {
    const newStudentEntry: StudentDatabase = {
      id: '',
      studentID: this.studentObj.studentID,
      name: this.studentObj.name,
      email: this.studentObj.email,
      program: this.studentObj.program,
      startDate: this.studentObj.startDate,
      endDate: this.studentObj.endDate,
      totalFees: this.studentObj.totalFees,
      datesOfFeesToBePaid: this.studentObj.datesOfFeesToBePaid,
      dateOfPaymentReceived: this.studentObj.dateOfPaymentReceived,
      etNumber: this.studentObj.etNumber,
      amountReceived: this.studentObj.amountReceived,
      paymentModes: this.studentObj.paymentModes, // Add payment modes
      installmentNotes: this.studentObj.installmentNotes, // Add installment notes
      modeOfPayment: this.studentObj.modeOfPayment,
      confirmedByVM: this.studentObj.confirmedByVM,
      totalFeeBalance: this.studentObj.totalFeeBalance, // Include total fee balance
      notes: this.studentObj.notes,
      enrollmentStatus: this.studentObj.enrollmentStatus,
      raises: this.studentObj.raises 
    };

    this.studentService
      .addStudent(newStudentEntry)
      .then(() => {
        console.log('Successfully added student!');
      })
      .catch(error => {
        console.error('Error adding student: ', error);
      });

    this.resetForm();
  }

  deleteStudent(student: StudentDatabase) {
    if (window.confirm('Are you sure you want to delete the student? This action cannot be undone.')) {
      this.studentService.deleteStudent(student).then(() => {
        console.log('Student deleted successfully');
      }).catch(error => {
        console.error('Error deleting student: ', error);
      });
    }
  }

  // Methods to show installments
  openInstallmentModalForStudent(student: StudentDatabase) {
    this.selectedStudent = student;

    this.selectedInstallments = Object.keys(student.datesOfFeesToBePaid || {}).map((date, index) => {
      return {
        date: date,
        amount: student.datesOfFeesToBePaid[date],
        dateReceived: student.dateOfPaymentReceived?.[index] || 'Not Received',
        amountReceived: student.amountReceived?.[index] || 'Not Received',
        paymentMode: student.paymentModes?.[index] || 'ET',
        note: student.installmentNotes?.[index] || '',
        raises: student.raises[index] || 'Not Raised',
        editing: false
      };
    });

    this.showInstallmentDetailsModal = true;
  }

  closeInstallmentDetailsModal() {
    this.showInstallmentDetailsModal = false;
    this.selectedInstallments = [];
    this.selectedStudent = null;
  }

  // Methods to add installments
  openInstallmentModal() {
    this.showModal = true;
  }

  closeInstallmentModal() {
    this.showModal = false;
  }

  addInstallment() {
    this.installmentList.push({
      date: '',
      amount: '',
      dateReceived: '',
      amountReceived: '',
      paymentMode: 'ET',
      note: '',
      raises: ''
    });
  }

  removeInstallment(index: number) {
    this.installmentList.splice(index, 1);
  }

  saveInstallments() {
    this.studentObj.datesOfFeesToBePaid = this.installmentList.reduce((map: { [key: string]: string }, installment) => {
      map[installment.date] = installment.amount;
      return map;
    }, {});

    this.studentObj.dateOfPaymentReceived = this.installmentList.map(installment => installment.dateReceived).filter(date => date);
    this.studentObj.amountReceived = this.installmentList.map(installment => installment.amountReceived).filter(amount => amount);
    this.studentObj.paymentModes = this.installmentList.map(installment => installment.paymentMode);
    this.studentObj.installmentNotes = this.installmentList.map(installment => installment.note);
    this.studentObj.raises = this.installmentList.map(installment => installment.raises); // Store raises as an array

    this.studentObj.totalFeeBalance = this.calculateFeeBalance(this.studentObj);

    this.closeInstallmentModal();
  }


  editStudent(student: StudentDatabase) {
    student.editing = true; // Allows fields to be edited
  }

  updateStudent(updatedStudent: StudentDatabase, index: number) {
    const originalStudent = this.studentList[index];

    // Check if there are any changes
    if (updatedStudent.name !== originalStudent.name ||
        updatedStudent.email !== originalStudent.email ||
        updatedStudent.totalFees !== originalStudent.totalFeeBalance ||
        updatedStudent.startDate !== originalStudent.startDate ||
        updatedStudent.endDate !== originalStudent.endDate ||
        updatedStudent.enrollmentStatus !== originalStudent.enrollmentStatus ||
        updatedStudent.program !== originalStudent.program) {
        
        // Calculate and update the total fee balance
        updatedStudent.totalFeeBalance = this.calculateFeeBalance(updatedStudent);

        updatedStudent.editing = false; // Turn off editing mode

        // Call the update service method to update the database
        this.studentService.updateStudent(updatedStudent).then(() => {
            this.studentList[index] = { ...updatedStudent }; // Update the UI after successful save
            console.log('Student updated successfully');
        }).catch((error) => {
            console.error('Error updating student:', error);
        });
    } else {
        updatedStudent.editing = false; // No changes, just exit edit mode
    }
  }


  // Toggle editing mode for an installment
  toggleEditInstallment(installment: any) {
    installment.editing = !installment.editing;
  }

  editInstallment(installment: any) {
    // Enable editing mode for the specific installment
    installment.editing = true;
  }


  // Update the installment details and save to the database
  updateInstallment(updatedInstallment: any, index: number) {
    // Check if date and amount are provided
    if (!updatedInstallment.date || !updatedInstallment.amount) {
      alert("Please fill in both the Date and Amount fields before saving the installment.");
      return; // Stop further execution if validation fails
    }

    if (this.selectedStudent) {
      // Update the student object with the new installment details
      this.selectedStudent.datesOfFeesToBePaid[updatedInstallment.date] = updatedInstallment.amount;
      this.selectedStudent.dateOfPaymentReceived[index] = updatedInstallment.dateReceived;
      this.selectedStudent.amountReceived[index] = updatedInstallment.amountReceived;
      this.selectedStudent.paymentModes[index] = updatedInstallment.paymentMode;
      this.selectedStudent.installmentNotes[index] = updatedInstallment.note;
      this.selectedStudent.raises[index] = updatedInstallment.raises; // Update raises at the specific index

      // Calculate and update the total fee balance
      this.selectedStudent.totalFeeBalance = this.calculateFeeBalance(this.selectedStudent);

      // Call the service method to update the student in the database
      this.studentService.updateInstallment(this.selectedStudent).then(() => {
        // Update the installment list with the new details
        this.selectedInstallments[index] = { ...updatedInstallment };
      }).catch((error) => {
        console.error('Error updating installment:', error);
      });
    } else {
      console.error('Selected student is null. Cannot update installment.');
    }

    // Turn off editing mode for the installment
    updatedInstallment.editing = false;
  }




  addNewInstallment() {
    if (this.selectedInstallments) {
        this.selectedInstallments.push({
            date: '',
            amount: '',
            dateReceived: '',
            amountReceived: '',
            paymentMode: 'ET', // Default to 'ET'
            note: '',
            raises: '',
            editing: true // Set to true to allow immediate editing
        });
    }
  }

    // Calculate the fee balance based on total fees and received amounts
  calculateFeeBalance(student: StudentDatabase) {
    const totalFees = parseFloat(student.totalFees || '0');
    const totalReceived = student.amountReceived.reduce((sum, amount) => sum + parseFloat(amount || '0'), 0);
    return (totalFees - totalReceived).toFixed(2); // Keep two decimal places
  }

  filterByInstallmentDueDate() {
    if (!this.installmentDueDateFilter) {
        // If no date is selected, reset the filtered list
        this.filteredStudentList = [...this.studentList];
    } else {
        const selectedDate = new Date(this.installmentDueDateFilter);
        console.log('Selected date for filtering:', selectedDate); // Debugging log

        this.filteredStudentList = this.studentList.filter(student => {
            // Check if the student has any installments with a due date that matches the selected date
            return Object.keys(student.datesOfFeesToBePaid).some(dateStr => {
                const installmentDate = new Date(dateStr);
                // Validate date and check if it exactly matches the selected date
                return !isNaN(installmentDate.getTime()) && installmentDate.toDateString() === selectedDate.toDateString();
            });
        });
    }
  }

  

  // Methods to handle filter modals
  openFilterModal() {
      this.showFilterModal = true;
  }

  closeFilterModal() {
      this.showFilterModal = false;
  }

  openStatusFilterModal() {
      this.closeFilterModal(); // Close main filter modal
      this.showStatusFilterModal = true;
  }

  closeStatusFilterModal() {
      this.showStatusFilterModal = false;
  }

  openDueDateFilterModal() {
      this.closeFilterModal(); // Close main filter modal
      this.showDueDateFilterModal = true;
  }

  closeDueDateFilterModal() {
      this.showDueDateFilterModal = false;
  }

  // Apply status filter
  applyStatusFilter() {
    this.filteredStudentList = this.selectedFilterStatus === 'all'
        ? [...this.studentList]
        : this.studentList.filter(student => student.enrollmentStatus === this.selectedFilterStatus);

    this.appliedFilter = { type: 'status', value: this.selectedFilterStatus };
    this.closeStatusFilterModal();
  }

  // Apply due date filter
  applyDueDateFilter() {
    if (!this.installmentDueDateFilter) {
        this.filteredStudentList = [...this.studentList];
    } else {
        const selectedDate = new Date(this.installmentDueDateFilter);
        this.filteredStudentList = this.studentList.filter(student => {
            return Object.keys(student.datesOfFeesToBePaid).some(dateStr => {
                const installmentDate = new Date(dateStr);
                return installmentDate.getTime() === selectedDate.getTime();
            });
        });
    }

    this.appliedFilter = { type: 'dueDate', value: this.installmentDueDateFilter };
    this.closeDueDateFilterModal();
  }

  // Apply date range filter
  applyDateRangeFilter() {
    if (!this.startDateFilter || !this.endDateFilter) {
        this.filteredStudentList = [...this.studentList];
    } else {
        const startDate = new Date(this.startDateFilter);
        const endDate = new Date(this.endDateFilter);

        this.filteredStudentList = this.studentList.filter(student => {
            return Object.keys(student.datesOfFeesToBePaid).some(dateStr => {
                const installmentDate = new Date(dateStr);
                return installmentDate >= startDate && installmentDate <= endDate;
            });
        });
    }

    this.appliedFilter = { type: 'dateRange', value: { start: this.startDateFilter, end: this.endDateFilter } };
    this.closeDateRangeFilterModal();
  }

  openDateRangeFilterModal() {
    this.showDateRangeFilterModal = true;
    this.showFilterModal = false; // Close main filter modal
  }

  closeDateRangeFilterModal() {
      this.showDateRangeFilterModal = false;
  }
  

  back() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout();
  }

  generatePDF() {
    const doc = new jsPDF();
    const logoUrl = 'assets/images/a1-logo.png';

    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
        const currentDate = new Date();
        const month = currentDate.toLocaleString('default', { month: 'long' });
        
        this.studentList.forEach((student, index) => {
            if (index > 0) {
                doc.addPage(); // Start a new page for each student after the first
            }

            // Add the logo
            doc.addImage(img, 'PNG', 10, 10, 30, 30);

            // Title with month, centered
            doc.setFontSize(18);
            doc.text(`Student Fee Report (${month})`, doc.internal.pageSize.getWidth() / 2, 25, { align: "center" });

            // Date below the title
            doc.setFontSize(12);
            doc.text(`Date: ${currentDate.toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });

            // Add space and a horizontal line
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(10, 40, doc.internal.pageSize.getWidth() - 10, 40);

            let startY = 50;

            // Student details
            doc.setFontSize(14);
            doc.text(`Name: ${student.name}`, 14, startY);
            doc.text(`Program: ${student.program}`, 14, startY + 8);
            doc.text(`Total Fee: ${student.totalFees}`, 14, startY + 16);

            // Installment details
            const installmentData = Object.keys(student.datesOfFeesToBePaid).map((date, idx) => [
                date,
                student.datesOfFeesToBePaid[date] || 'N/A',
                student.dateOfPaymentReceived?.[idx] || 'N/A',
                student.amountReceived?.[idx] || 'N/A',
                student.raises?.[idx] || 'N/A'
            ]);

            // Render table for installments
            (doc as any).autoTable({
                startY: startY + 24,
                head: [["Installment Date", "Amount Due", "Date Received", "Amount Received", "Date Raised"]],
                body: installmentData,
                theme: "grid",
            });

            // Signature line with "Mr. Pankaj" at the bottom right
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFontSize(12);
            doc.text("Mr. Pankaj", doc.internal.pageSize.getWidth() - 30, pageHeight - 20, { align: "right" });
        });

        // Open PDF in a new tab
        window.open(doc.output('bloburl'), '_blank');
    };

    img.onerror = () => {
        console.error("Failed to load the logo image.");
    };
}


}
