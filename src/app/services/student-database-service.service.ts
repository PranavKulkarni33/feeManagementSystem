import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { StudentDatabase } from '../interfaces/student-database';

@Injectable({
  providedIn: 'root'
})
export class StudentDatabaseServiceService {
  constructor(private afs: AngularFirestore) {}

  // Adds a new student and triggers the Cloud Function to send an email.
  addStudent(student: StudentDatabase) {
    // Generate a unique ID for the student (if needed)
    student.id = this.afs.createId();

    // Add the student to Firestore, which will trigger the Cloud Function
    return this.afs
      .collection('/StudentDatabase')
      .add(student)
      .then(() => {
        console.log('Successfully added student!');
      })
      .catch(error => {
        console.error('Error adding student: ', error);
        throw error;
      });
  }

  // Fetches all students from Firestore
  getAllStudents() {
    return this.afs.collection('/StudentDatabase').snapshotChanges();
  }

  // Deletes a student from Firestore
  deleteStudent(student: StudentDatabase) {
    return this.afs
      .doc('StudentDatabase/' + student.id)
      .delete()
      .catch(error => {
        console.error('Error deleting student: ', error);
        throw error;
      });
  }

  // Updates an existing student in Firestore
  updateStudent(student: StudentDatabase) {
    return this.afs
      .doc('StudentDatabase/' + student.id)
      .update(student)
      .then(() => {
        console.log('Student updated successfully!');
      })
      .catch(error => {
        console.error('Error updating student: ', error);
        throw error;
      });
  }

  // Updates the installments of a student in Firestore
  updateInstallment(student: StudentDatabase) {
    return this.afs
      .doc('StudentDatabase/' + student.id)
      .update({
        datesOfFeesToBePaid: student.datesOfFeesToBePaid,
        dateOfPaymentReceived: student.dateOfPaymentReceived,
        amountReceived: student.amountReceived,
        paymentModes: student.paymentModes,
        installmentNotes: student.installmentNotes,
        totalFeeBalance: student.totalFeeBalance // Update the balance as well
      })
      .then(() => {
        console.log('Installments updated successfully!');
      })
      .catch(error => {
        console.error('Error updating installments: ', error);
        throw error;
      });
  }
}
