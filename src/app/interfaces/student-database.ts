export interface StudentDatabase {
    id: string; // Firestore document ID
    studentID: string; // Unique student identifier
    name: string; // Full name of the student
    email: string; // Student email
    program: string; // Program name
    startDate: string; // Start date in YYYY-MM-DD format
    endDate: string; // End date in YYYY-MM-DD format
    totalFees: string; // Total fees for the program
    datesOfFeesToBePaid: { [key: string]: string }; // Fees to be paid by date
    dateOfPaymentReceived: string[]; // Array of payment received dates (YYYY-MM-DD)
    etNumber: string; // ET number
    amountReceived: string[]; // Array of amounts received corresponding to the dates
    paymentModes: string[]; // Array for payment modes (ET, Credit, Cash, OSAP, etc.)
    installmentNotes: string[]; // Array for specific notes for each installment
    modeOfPayment: string; // Mode of payment (for general purposes)
    confirmedByVM: string; // Confirmation from VM (yes/no or other status)
    totalFeeBalance: string; // Total remaining balance
    enrollmentStatus: string; // New field for enrollment status
    notes: string; // Notes for student
    editing?: boolean;
}

