import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username : string = '';
  password : string = '';
  
  constructor(private auth : AuthService,
    private router : Router){}

  

  login(){
    if(this.username == '' ){
      alert('Please fill in the Username');
      return;
    }
    if(this.password == '' ){
      alert('Please fill in the Password');
      return;
    }

    this.auth.login(this.username,this.password);
    this.username= '';
    this.password= '';
  }

  goBack(){
    this.router.navigate(['/landing']);
  }


}
