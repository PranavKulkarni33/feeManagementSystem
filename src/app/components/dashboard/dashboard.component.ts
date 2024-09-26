import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentDatabase } from 'src/app/interfaces/student-database';
import { AuthService } from 'src/app/services/auth.service';
import { StudentDatabaseServiceService } from 'src/app/services/student-database-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

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
    enrollmentStatus: 'enrolled'
  };
  enrollmentStatuses: string[] = ['enrolled', 'graduated', 'withdrawn', 'other']; // Status options
  enrollmentStatusesForFilter: string[] = ['enrolled', 'graduated', 'withdrawn', 'other', 'all']; // Status options
  selectedFilterStatus: string = 'all';
  filteredStudentList: StudentDatabase[] = [];
  showModal: boolean = false;
  showInstallmentDetailsModal: boolean = false; // New variable for the details modal

  // Including paymentMode and note for each installment
  installmentList: { 
    date: string, 
    amount: string, 
    dateReceived: string, 
    amountReceived: string,
    paymentMode: string,
    note: string
  }[] = [];
  
  selectedInstallments: { 
    date: string, 
    amount: string, 
    dateReceived: string, 
    amountReceived: string,
    paymentMode: string,
    note: string
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
      datesOfFeesToBePaid: {}, // Reset to empty map
      dateOfPaymentReceived: [], // Reset to empty array
      etNumber: '',
      amountReceived: [],
      paymentModes: [], // Reset to empty array
      installmentNotes: [], // Reset to empty array
      modeOfPayment: '',
      confirmedByVM: '',
      totalFeeBalance: '', // Reset fee balance
      notes: '',
      enrollmentStatus: 'enrolled'
    };
    this.installmentList = []; // Reset installment list
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
      enrollmentStatus: this.studentObj.enrollmentStatus 
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
            paymentMode: student.paymentModes?.[index] || 'ET', // Default to ET if not available
            note: student.installmentNotes?.[index] || '' // Default to empty string if no note
        };
    });

    this.showInstallmentDetailsModal = true;
  }

  closeInstallmentDetailsModal() {
    this.showInstallmentDetailsModal = false;
    this.selectedInstallments = []; // Clear selected installments
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
        paymentMode: 'ET', // Default to ET
        note: '' // Empty note by default
    });
  }

  removeInstallment(index: number) {
    this.installmentList.splice(index, 1);
  }

  saveInstallments() {
    this.studentObj.datesOfFeesToBePaid = this.installmentList.reduce((map: { [key: string]: string }, installment) => {
        map[installment.date] = installment.amount; // Map each date to the corresponding amount to be paid
        return map;
    }, {});

    this.studentObj.dateOfPaymentReceived = this.installmentList.map(installment => installment.dateReceived).filter(date => date);
    this.studentObj.amountReceived = this.installmentList.map(installment => installment.amountReceived).filter(amount => amount); // Save received amounts
    this.studentObj.paymentModes = this.installmentList.map(installment => installment.paymentMode); // Save payment modes
    this.studentObj.installmentNotes = this.installmentList.map(installment => installment.note); // Save notes

    // Calculate the total amount received and the remaining fee balance
    const totalAmountReceived = this.studentObj.amountReceived.reduce((total, amount) => total + parseFloat(amount || '0'), 0);
    const totalFees = parseFloat(this.studentObj.totalFees || '0');

    // Calculate and save the fee balance
    this.studentObj.totalFeeBalance = (totalFees - totalAmountReceived).toString();

    this.closeInstallmentModal();
  }

  back() {
    this.router.navigate(['/login']);
  }
}
