import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UserData } from '../interfaces/user-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userRole: string | null = null;

  constructor( 
    private fireauth: AngularFireAuth, 
    private router : Router,
    private firestore: AngularFirestore ) { }

    login(username: string, password: string) {
      this.fireauth.signInWithEmailAndPassword(username, password).then((userCredential) => {
        const uid = userCredential.user?.uid;
        console.log("User UID:", uid);  // Debugging log
        if (uid) {
          // Fetch role from Firestore
          this.firestore.collection('Users').doc(uid).get().subscribe((doc) => {
            if (doc.exists) {
              console.log("Document data:", doc.data());  // Debugging log
              const userData = doc.data() as UserData; // Cast to UserData
              this.userRole = userData.role || 'employee'; // Default to 'employee'
              localStorage.setItem('role', this.userRole);
              localStorage.setItem('token', 'true');
              this.router.navigate(['dashboard']);
            } else {
              console.log("Document does not exist");  // Debugging log
              alert('No role assigned.');
              this.router.navigate(['/login']);
            }
          });
        }
      }).catch((err) => {
        alert(err.message);
        this.router.navigate(['/login']);
      });
    }
    
    

  //signup method
  signup(username: string, password: string) {
    this.fireauth.createUserWithEmailAndPassword(username, password).then((userCredential) => {
      const uid = userCredential.user?.uid;
      if (uid) {
        const userData: UserData = {
          role: 'employee',
          userEmail: username
        };
  
        this.firestore.collection('Users').doc(uid).set(userData)
          .then(() => {
            alert('SignUp successful');
            this.router.navigate(['/login']);
          })
          .catch((error) => {
            console.error('Error adding user to Firestore:', error);
            alert('SignUp successful, but an error occurred while saving user data.');
          });
      }
    }).catch((err) => {
      alert(err.message);
      this.router.navigate(['/signup']);
    });
  }
  

  // Logout and clear stored role
  logout() {
    this.fireauth.signOut().then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      this.userRole = null; // Clear cached role
      this.router.navigate(['/login']);
    }).catch(err => {
      alert(err.message);
    });
  }
  

  getRole(): string | null {
    return localStorage.getItem('role');
  }

}
