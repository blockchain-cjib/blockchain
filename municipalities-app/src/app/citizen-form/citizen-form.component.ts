import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { PersonInfo } from '../../PersonInfo';

@Component({
  selector: 'app-citizen-form',
  templateUrl: './citizen-form.component.html',
  styleUrls: ['./citizen-form.component.css']
})
export class CitizenFormComponent implements OnInit {
  person:PersonInfo = {
    bsn: undefined,
    name: undefined,
    address: undefined,
    salary: undefined,
    owner: {munId: undefined}
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
    this.person.owner.munId = "1";  // mock for now 

    this.apiService.uploadPersonInformation(this.person as PersonInfo)
    .subscribe(uploadedCitizenInfo => {
      console.log(uploadedCitizenInfo)
    });
  }

}
