import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../services/data.service';
import { ClientTestRepo } from '../../../../model/clientTestRepo';
import { flatMap } from 'rxjs/internal/operators';
import { TestRepository } from '../../../../model/test-repository';
import { BannerOptions } from '../../../../utils/banner/banner';
import Swal from 'sweetalert2';
import { Case } from '../../../../model/case';
import { TranslateService } from '@ngx-translate/core';
import { Tms } from 'src/app/utils/tms';

const SUCCESS_COLOR = 'alert alert-success';
const ERROR_COLOR = 'alert alert-danger';

@Component({
  selector: 'app-admin-tms',
  templateUrl: './admin-tms.component.html',
  styleUrls: ['./admin-tms.component.css']
})
export class AdminTmsComponent implements OnInit {

  clientTestRepositories: ClientTestRepo[] = [];
  testRepositories: TestRepository[] = [];
  availableTestRepositories: TestRepository[] = [];
  banner: BannerOptions;

  XRAY_CLOUD = Tms.XRAY_CLOUD;
  XRAY_SERVER = Tms.XRAY_SERVER;
  TEST_LINK = Tms.TEST_LINK;
  HP_ALM = Tms.HP_ALM;
  AZURE_TEST_PLANS = Tms.AZURE_TEST_PLANS;

  constructor(
    public dataService: DataService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.banner = new BannerOptions();
    this.getClientTestRepositories();
  }

  getClientTestRepositories() {
    this.dataService.getClientTestRepositories().subscribe(
      (clientTestRepositories) => {
        this.clientTestRepositories = clientTestRepositories;
        this.getAvailableTestRepositories();
      },
      (error) => {
        this.banner = new BannerOptions(this.translate.instant('main.admin.tms.error.getClientRepos'), error.message, ERROR_COLOR, true);
      }
    );
  }

  getAvailableTestRepositories() {
    this.dataService.getTestRepositories().subscribe(
      (testRepositories) => {
        this.testRepositories = testRepositories;
        this.availableTestRepositories = JSON.parse(JSON.stringify(testRepositories));
        this.filterAvailableRepositories();
      },
      (error) => {
        this.banner = new BannerOptions(this.translate.instant('main.admin.tms.error.getAvailableRepos'), error.message, ERROR_COLOR, true);
      }
    );
  }

  filterAvailableRepositories() {
    if (this.clientTestRepositories.length == 0) {
      return;
    }

    for (let clientRepository of this.clientTestRepositories) {
      let testRepo = this.availableTestRepositories.find(testRepository => testRepository.testRepoId == clientRepository.id.testRepoId);
      if (testRepo) {
        this.availableTestRepositories.splice(this.availableTestRepositories.indexOf(testRepo), 1);
      }
    }
  }

  activateRepository(clientTestRepo: ClientTestRepo, event: any): void {
    if (event.currentTarget.checked) {
      // Repository has been activated
      return;
    }

    Swal.fire({
      title: this.translate.instant('main.admin.tms.activateRepo.title', { repositoryName: clientTestRepo.testRepository.name }),
      text: this.translate.instant('main.admin.tms.activateRepo.text', { repositoryName: clientTestRepo.testRepository.name }),
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: this.translate.instant('main.admin.tms.activateRepo.confirmButton'),
      //cancelButtonText: 'Entendido',
      backdrop: `
                rgba(64, 69, 58,0.4)
                left top
                no-repeat`
    }).then((result) => {
      if (result.value) {
      } else {
      }
    });
  }

  addNewTestRepository(): void {
    this.clientTestRepositories.push(new ClientTestRepo());
  }

  selectTestRepository(testRepoId: any, clientTestRepo: ClientTestRepo) {
    let testRepo = this.availableTestRepositories.find(testRepository => testRepository.testRepoId == testRepoId.target.value);
    clientTestRepo.testRepository = testRepo;
    this.filterAvailableRepositories();
  }

  save(clientTestRepo: ClientTestRepo): void {
    if (!this.isValidRepo(clientTestRepo)){
      this.banner = new BannerOptions('', this.translate.instant('main.admin.tms.save.errorMandatoryFields'), ERROR_COLOR, true);
      return;
    }

    this.dataService.saveClientTestRepository(clientTestRepo).subscribe(
      (clientTestRepoSaved) => {
        let clientTestRepoInList = this.clientTestRepositories.find(clientRepo => clientRepo.id.testRepoId == clientTestRepo.id.testRepoId);
        if (clientTestRepoInList) {
          let index = this.clientTestRepositories.indexOf(clientTestRepoInList);
          this.clientTestRepositories[index] = clientTestRepoSaved;
        }

        this.banner = new BannerOptions(this.translate.instant('main.admin.tms.save.ok'), '', SUCCESS_COLOR, true);
      },
      (error) => {
        this.banner = new BannerOptions(this.translate.instant('main.admin.tms.save.error'), error.message, ERROR_COLOR, true);
      },
    );
  }

  isValidRepo(clientTestRepo: ClientTestRepo): boolean {
    if (!clientTestRepo.testRepository){
      return false;
    }
    if (clientTestRepo.testRepository.name == this.XRAY_CLOUD) {
      return this.isNotEmpty(clientTestRepo.user) && this.isValidPassword(clientTestRepo);
    }
    if (clientTestRepo.testRepository.name == this.XRAY_SERVER) {
      return this.isNotEmpty(clientTestRepo.url) && this.isNotEmpty(clientTestRepo.user) && this.isValidPassword(clientTestRepo);
    }
    if (clientTestRepo.testRepository.name == this.TEST_LINK) {
      return this.isNotEmpty(clientTestRepo.url) && this.isValidPassword(clientTestRepo);
    }
    if (clientTestRepo.testRepository.name == this.HP_ALM) {
      return this.isNotEmpty(clientTestRepo.url) && this.isNotEmpty(clientTestRepo.user) && this.isValidPassword(clientTestRepo);
    }
    if (clientTestRepo.testRepository.name == this.AZURE_TEST_PLANS) {
      return this.isNotEmpty(clientTestRepo.url) && this.isNotEmpty(clientTestRepo.user) && this.isValidPassword(clientTestRepo);
    }
    return false;
  }

  isValidPassword(clientTestRepo: ClientTestRepo): boolean {
    if (clientTestRepo.id.clientId > 0) {
      // repo already saved, change password is optional, can be empty
      return true;
    } 
    if (clientTestRepo.id.clientId == 0 && this.isNotEmpty(clientTestRepo.password)){
      return true;
    }
    return false;
  }

  isEmpty(value: string): boolean {
    if (!value){
      return true;
    }
    return value.trim().length == 0;
  }

  isNotEmpty(value: string): boolean {
    return !this.isEmpty(value);
  }

  delete(clientTestRepo: ClientTestRepo): void {
    // Local delete
    if (clientTestRepo.id.clientId == 0) {
      const index = this.clientTestRepositories.indexOf(clientTestRepo);
      this.clientTestRepositories.splice(index, 1);

      if (clientTestRepo.id.testRepoId > 0) {
        let testRepo = this.testRepositories.find(testRepository => testRepository.testRepoId == clientTestRepo.id.testRepoId);
        this.availableTestRepositories.push(testRepo);
      }

      return;
    }

    // Backend delete
    Swal.fire({
      title: this.translate.instant('main.admin.tms.delete.title', { repositoryName: clientTestRepo.testRepository.name }),
      text: this.translate.instant('main.admin.tms.delete.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('main.admin.tms.delete.confirmButton'),
      cancelButtonText: this.translate.instant('main.admin.tms.delete.cancelButton'),
      backdrop: `
                rgba(64, 69, 58,0.4)
                left top
                no-repeat`
    }).then((result) => {
      if (result.value) {
        clientTestRepo.active = false;

        this.dataService.deleteClientTestRepository(clientTestRepo.id.testRepoId).subscribe(
          () => {
            const index = this.clientTestRepositories.indexOf(clientTestRepo);
            this.clientTestRepositories.splice(index, 1);

            let testRepo = this.testRepositories.find(testRepository => testRepository.testRepoId == clientTestRepo.id.testRepoId);
            this.availableTestRepositories.push(testRepo);
          },
          (error) => {

            if (error.status == 409) {
              this.banner = new BannerOptions('', this.translate.instant('main.admin.tms.delete.error409'), ERROR_COLOR, true);  
            } else {
              this.banner = new BannerOptions(this.translate.instant('main.admin.tms.delete.error'), error.message, ERROR_COLOR, true);
            }
          }, () => {
            this.banner = new BannerOptions(this.translate.instant('main.admin.tms.delete.ok'), '', SUCCESS_COLOR, true);
          }
        );
      } else {
        clientTestRepo.active = true;
      }
    });
  }

  // tslint:disable-next-line:typedef
  closeBanner() {
    // tslint:disable-next-line:new-parens
    this.banner = new BannerOptions;
  }

}
