import {Component, OnInit, TemplateRef } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
// import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';

@Component({
  selector: 'app-experts',
  templateUrl: './experts.component.html',
  styleUrls: ['./experts.component.css']
})
export class ExpertsComponent implements OnInit {

  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };
  expertsData =  [];
  expertDetailsData = null;
  actionData = null;

  exampleData = [];
  options = {};

  categoryDataForExpert =  [];
  addExpertsForm: FormGroup = new FormGroup({
    category_id: new FormControl('', Validators.required),
    name: new FormControl(''),
  });

  assignRole: FormGroup = new FormGroup({
    role: new FormControl('', Validators.required),
  });

  itemsPerPage = 50;
  currentPage = 1;

  rolesData = [];
  rolesOptionList = [];

  constructor(private commonService: CommonService,
              private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getExperts();
    this.getCategory();
    this.getRoles();
    this.options = {
      width: '450',
      multiple: false,
    };
  }

  getExperts(): void {
    this.commonService.apiCall('get', '/api/system/getExpertList?pageNo=0&limit=' + this.itemsPerPage).subscribe((data) =>{
      if (data['success'] == true){
        this.expertsData =  [];
        this.expertsData = data['data']['data'];
        this.commonService.flashMessage('success', 'Success', data['message']);
      }else if (data['success'] == false){
        this.commonService.flashMessage('warning', 'Warning', data['message']);
      }
    }, err =>{
      this.commonService.flashMessage('error', 'Error', err['error']['message']);
    });
  }

  pageChange(event){
    this.currentPage = event;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  closeModal(){
    this.modalRef.hide();
    this.actionData = null;
    this.addExpertsForm.reset();
  }

  expertAction(expert){
    this.actionData = expert;
  }

  expertAllowRejectAction(action){

    var sendOBJ = {
      is_verified: this.actionData['is_verified']
    }

    this.commonService.apiCall('post', '/api/metadata/verifyExpert/' + this.actionData.id, sendOBJ).subscribe((data) =>{
      if (data['success'] == true){
        this.closeModal();
        this.commonService.flashMessage('success', 'Success', data['message']);
      }else if (data['success'] == false){
        this.closeModal();
        this.commonService.flashMessage('warning', 'Warning', data['message']);
      }
    }, err =>{
      this.closeModal();
      this.commonService.flashMessage('error', 'Error', err['error']['message']);
    });
  }

  expertDetails(expert){
    this.expertDetailsData = expert;
  }


  getCategory(): void {
    this.commonService.apiCall('get', '/api/system/getCategory?pageNo=0&limit=' + this.itemsPerPage).subscribe((data) =>{
      if (data['success'] == true){
        this.categoryDataForExpert =  [];
        for (var i = 0; i < data['data']['data'].length; i++){
          this.categoryDataForExpert.push({id: data['data']['data'][i]['id'], text: data['data']['data'][i]['name']})
        }
        this.commonService.flashMessage('success', 'Success', data['message']);
      }else if (data['success'] == false){
        this.commonService.flashMessage('warning', 'Warning', data['message']);
      }
    }, err =>{
      this.commonService.flashMessage('error', 'Error', err['message']);
    });
  }

  addExpert(){
    this.commonService.apiCall('post', '/api/metadata/createExpertise', this.addExpertsForm.value).subscribe((data) =>{
      if (data['success'] == true){
        this.closeModal();
        this.getExperts();
        this.commonService.flashMessage('success', 'Success', data['message']);
      }else if (data['success'] == false){
        this.closeModal();
        this.commonService.flashMessage('warning', 'Warning', data['message']);
      }
    }, err =>{
      this.closeModal();
      this.commonService.flashMessage('error', 'Error', err['error']['message']);
    });
  }


  getRoles(): void {
    this.commonService.apiCall('get', '/api/metadata/getRoles').subscribe((data) =>{
      if (data['success'] == true){
        this.rolesData =  [];
        this.rolesData = data['data']['data'];
        // this.commonService.flashMessage('success', 'Success', data['message']);
        for(var i = 0; i < this.rolesData.length; i++){
          this.rolesData[i]['checked'] = false;
          this.rolesOptionList.push({id: data['data']['data'][i]['id'], text: data['data']['data'][i]['name']})
        }
      }else if (data['success'] == false){
        // this.commonService.flashMessage('warning', 'Warning', data['message']);
      }
    }, err =>{
      this.commonService.flashMessage('error', 'Error', err['message']);
    });
  }

  selectedRole(permission, index){
    this.rolesData[index]['checked'] = !this.rolesData[index]['checked'];
  }

  assignRoleToExpert(){
    var sendOBJ = {
      "role_id": this.assignRole.value.role,
      "user_id": this.expertDetailsData.id,
    }
    this.commonService.apiCall('post', '/api/metadata/assignRole', sendOBJ).subscribe((data) =>{
      if (data['success'] == true){
        this.closeModal();
        this.commonService.flashMessage('success', 'Success', data['message']);
      }else if (data['success'] == false){
        this.closeModal();
        this.commonService.flashMessage('warning', 'Warning', data['message']);
      }
    }, err =>{
      this.closeModal();
      this.commonService.flashMessage('error', 'Error', err['error']['message']);
    });
  }
}
