import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { PersonInfo } from '../../org.example.cjibnetwork';

@Component({
  selector: 'app-citizen-form',
  templateUrl: './citizen-form.component.html',
  styleUrls: ['./citizen-form.component.css']
})
export class CitizenFormComponent implements OnInit {
    mockMunicipalityId = "1";

    loading = false;
    errorAlert = false;
    successAlert = false;

    person = {
        BSN: undefined,
        firstName: undefined,
        lastName: undefined,
        address: undefined,
        salary: undefined,
        consent: false,
        owner: "org.example.cjibnetwork.Municipality#" + this.mockMunicipalityId
    }
  
    persons: PersonInfo[];
    
    constructor(private apiService: ApiService) { }

    ngOnInit() {
    }

    closeAlert = function() {
		this.errorAlert = false;
		this.successAlert = false;
    }
    
    getAllPersonInformation(): void {
        this.apiService.getAllPersonInformation()
            .subscribe(persons => this.persons = persons);
    }

    uploadPersonInformation(): void {
        this.loading = true;
        this.closeAlert();

        var body = {
            personinfo: this.person
        }
        this.apiService.uploadPersonInformation(body)
        .subscribe(
            res => this.uploadPersonInformationSuccessCallback(res),
            err => this.uploadPersonInformationFailCallback(err)
        );
    }

    uploadPersonInformationSuccessCallback (result) {
        this.loading = false;
        this.successAlert = true;
        console.log(result);
    }

    uploadPersonInformationFailCallback(error) {
        this.loading = false;
        this.errorAlert = true;
        console.log(error);
    }
}
