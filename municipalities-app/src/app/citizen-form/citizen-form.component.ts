import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { PersonInfo } from '../../org.example.cjibnetwork';

@Component({
  selector: 'app-citizen-form',
  templateUrl: './citizen-form.component.html',
  styleUrls: ['./citizen-form.component.css']
})
export class CitizenFormComponent implements OnInit {
  person = {
    BSN: undefined,
    firstName: undefined,
    lastName: undefined,
    address: undefined,
    salary: undefined,
    consent: false,
    owner: {munId: "1"} // mock for now 
  }
  
  persons: PersonInfo[];
  
  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  getAllPersonInformation(): void {
    this.apiService.getAllPersonInformation()
        .subscribe(persons => this.persons = persons);
  }

  uploadPersonInformation(): void {
    this.person.owner.munId = "1";  

    this.apiService.uploadPersonInformation(this.person as PersonInfo)
    .subscribe(uploadedCitizenInfo => {
      console.log(uploadedCitizenInfo)
    });
  }
}
